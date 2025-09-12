import { Request, Response } from 'express';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const register = async (req: Request, res: Response) => {
  try {
    const { nome, email, password, companyId } = req.body;

    console.log('🔍 Dados recebidos no registro:', { nome, email, companyId });

    // Validação adicional de segurança
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'fallback-secret') {
      throw new Error('JWT_SECRET não configurado corretamente');
    }

    // Verificar se usuário já existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Usuário já existe'
      });
    }

    // Se companyId for fornecido, verificar se a empresa existe
    let perfil = 'ghost'; // Valor padrão
    
    if (companyId) {
      console.log('🏢 Verificando empresa com ID:', companyId);
      
      const company = await prisma.company.findUnique({
        where: { id_empresa: companyId }
      });

      if (!company) {
        console.log('❌ Empresa não encontrada com ID:', companyId);
        return res.status(400).json({
          success: false,
          message: 'Empresa não encontrada'
        });
      }

      console.log('✅ Empresa encontrada:', company.razao_social);

      // Verificar se é o primeiro usuário da empresa para definir perfil como admin
      const userCount = await prisma.user.count({
        where: { id_empresa: companyId }
      });

      perfil = userCount === 0 ? 'admin' : 'ghost';
      console.log('👤 Perfil definido como:', perfil, '(usuários na empresa:', userCount, ')');
    } else {
      console.log('⚠️ Nenhum companyId fornecido');
    }

    // Hash da senha com rounds configuráveis
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Dados para criação do usuário
    const userData = {
      nome: nome.trim(),
      email: email.toLowerCase().trim(),
      senha: hashedPassword,
      perfil: perfil,
      id_empresa: companyId || null,
      data_criacao: new Date(),
      data_atualizacao: new Date()
    };

    console.log('📝 Dados para criação do usuário:', userData);

    // Criar usuário com dados sanitizados
    const user = await prisma.user.create({
      data: userData,
      select: {
        id_usuario: true,
        nome: true,
        email: true,
        perfil: true,
        id_empresa: true,
        data_criacao: true
      }
    });

    console.log('✅ Usuário criado com sucesso:', user);

    // Gerar token JWT
    const token = jwt.sign(
      { userId: user.id_usuario, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );

    // Log de auditoria
    console.log(`[AUDIT] Novo usuário registrado: ${email} - ${new Date().toISOString()}`);

    return res.status(201).json({
      success: true,
      message: 'Usuário criado com sucesso',
      data: {
        user,
        token
      }
    });
  } catch (error) {
    console.error('❌ Erro no registro:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    console.log('🔍 Tentativa de login:', { email, password: password ? '[SENHA_FORNECIDA]' : '[SEM_SENHA]' });

    // Validação de segurança
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'fallback-secret') {
      throw new Error('JWT_SECRET não configurado corretamente');
    }

    // Buscar usuário
    console.log('🔍 Buscando usuário com email:', email);
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    });
    
    console.log('🔍 Resultado da busca:', user ? 'Usuário encontrado' : 'Usuário não encontrado');

    if (!user) {
      console.log('❌ Usuário não localizado para email:', email);
      return res.status(401).json({
        success: false,
        message: 'Usuário não localizado!'
      });
    }

    console.log('✅ Usuário encontrado:', { id: user.id_usuario, nome: user.nome, email: user.email });

    // Verificar senha
    console.log('🔍 Verificando senha...');
    const isValidPassword = await bcrypt.compare(password, user.senha);
    console.log('🔍 Senha válida:', isValidPassword);

    if (!isValidPassword) {
      // Log de tentativa de login falhada
      console.log(`[SECURITY] Tentativa de login falhada para: ${email} - ${new Date().toISOString()}`);
      return res.status(401).json({
        success: false,
        message: 'Credenciais inválidas'
      });
    }

    // Gerar token JWT
    const token = jwt.sign(
      { userId: user.id_usuario, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );

    // Buscar informações da empresa se o usuário tiver uma empresa associada
    let empresaInfo = null;
    if (user.id_empresa) {
      const empresa = await prisma.company.findUnique({
        where: { id_empresa: user.id_empresa },
        select: {
          nome_fantasia: true,
          razao_social: true,
          cnpj: true
        }
      });
      
      if (empresa) {
        empresaInfo = {
          nome_fantasia: empresa.nome_fantasia,
          razao_social: empresa.razao_social,
          cnpj: empresa.cnpj
        };
      }
    }

    // Log de auditoria de login bem-sucedido
    console.log(`[AUDIT] Login bem-sucedido: ${email} - ${new Date().toISOString()}`);

    return res.json({
      success: true,
      message: 'Login realizado com sucesso',
      data: {
        user: {
          id_usuario: user.id_usuario,
          nome: user.nome,
          email: user.email,
          perfil: user.perfil,
          data_criacao: user.data_criacao,
          empresa: empresaInfo
        },
        token
      }
    });
  } catch (error) {
    console.error('Erro no login:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

export const getProfile = async (req: any, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id_usuario: req.user.id_usuario },
      select: {
        id_usuario: true,
        nome: true,
        email: true,
        perfil: true,
        data_criacao: true,
        id_empresa: true,
        base_sindical: true
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
        });
    }

    // Buscar informações da empresa se o usuário tiver uma empresa associada
    let empresaInfo = null;
    if (user.id_empresa) {
      const empresa = await prisma.company.findUnique({
        where: { id_empresa: user.id_empresa },
        select: {
          nome_fantasia: true,
          razao_social: true,
          cnpj: true
        }
      });
      
      if (empresa) {
        empresaInfo = {
          nome_fantasia: empresa.nome_fantasia,
          razao_social: empresa.razao_social,
          cnpj: empresa.cnpj
        };
      }
    }

    return res.json({
      success: true,
      data: {
        id_usuario: user.id_usuario,
        nome: user.nome,
        email: user.email,
        perfil: user.perfil,
        data_criacao: user.data_criacao,
        id_empresa: user.id_empresa,
        base_sindical: user.base_sindical,
        empresa: empresaInfo
      }
    });
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

export const updateProfile = async (req: any, res: Response) => {
  try {
    const { nome, email, currentPassword, newPassword } = req.body;
    const userId = req.user.id_usuario;

    console.log('🔍 Atualizando perfil do usuário:', userId);

    // Buscar usuário atual
    const currentUser = await prisma.user.findUnique({
      where: { id_usuario: userId }
    });

    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    // Preparar dados para atualização
    const updateData: any = {
      data_atualizacao: new Date()
    };

    // Atualizar nome se fornecido
    if (nome && nome.trim() !== '') {
      updateData.nome = nome.trim();
    }

    // Atualizar email se fornecido
    if (email && email.trim() !== '') {
      // Verificar se o novo email já existe em outro usuário
      const existingUserWithEmail = await prisma.user.findFirst({
        where: {
          email: email.toLowerCase().trim(),
          id_usuario: { not: userId }
        }
      });

      if (existingUserWithEmail) {
        return res.status(400).json({
          success: false,
          message: 'Este email já está sendo usado por outro usuário'
        });
      }

      updateData.email = email.toLowerCase().trim();
    }

    // Se fornecida nova senha, verificar senha atual e atualizar
    if (newPassword && newPassword.trim() !== '') {
      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          message: 'Senha atual é obrigatória para alterar a senha'
        });
      }

      // Verificar senha atual
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, currentUser.senha);
      if (!isCurrentPasswordValid) {
        return res.status(400).json({
          success: false,
          message: 'Senha atual incorreta'
        });
      }

      // Validar nova senha
      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'A nova senha deve ter pelo menos 6 caracteres'
        });
      }

      // Hash da nova senha
      const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
      updateData.senha = await bcrypt.hash(newPassword, saltRounds);

      console.log('🔐 Senha atualizada para o usuário:', userId);
    }

    // Atualizar usuário
    const updatedUser = await prisma.user.update({
      where: { id_usuario: userId },
      data: updateData,
      select: {
        id_usuario: true,
        nome: true,
        email: true,
        perfil: true,
        data_criacao: true,
        data_atualizacao: true
      }
    });

    console.log('✅ Perfil atualizado com sucesso:', updatedUser);

    // Log de auditoria
    console.log(`[AUDIT] Perfil atualizado: ${userId} - ${new Date().toISOString()}`);

    return res.json({
      success: true,
      message: 'Perfil atualizado com sucesso',
      data: updatedUser
    });
  } catch (error) {
    console.error('❌ Erro ao atualizar perfil:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

export default {
  register,
  login,
  getProfile,
  updateProfile
};
