import express from 'express';
import { PrismaClient } from '@prisma/client';
import { auth } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Middleware para verificar se o usuário é admin
const requireAdmin = async (req: any, res: any, next: any) => {
  try {
    // Verificar se o usuário é admin usando os dados já carregados no middleware de auth
    if (!req.user || req.user.perfil !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado. Apenas administradores podem acessar esta funcionalidade.'
      });
    }

    next();
  } catch (error) {
    console.error('Erro ao verificar perfil de admin:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// GET /api/users/stats - Buscar estatísticas de TODOS os usuários do sistema
router.get('/stats', auth, requireAdmin, async (req: any, res: any) => {
  try {
    console.log('📊 === ROTA /api/users/stats CHAMADA ===');
    console.log('📊 Usuário logado ID:', req.user.id_usuario);
    console.log('📊 Buscando estatísticas de TODOS os usuários do sistema...');
    
    // Contar usuários por perfil (TODOS os usuários do sistema)
    const totalUsers = await prisma.user.count();

    const adminUsers = await prisma.user.count({
      where: { perfil: 'admin' }
    });

    const userUsers = await prisma.user.count({
      where: { perfil: 'user' }
    });

    const ghostUsers = await prisma.user.count({
      where: { perfil: 'ghost' }
    });

    // Usuários criados este mês (TODOS os usuários do sistema)
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const newUsersThisMonth = await prisma.user.count({
      where: { 
        data_criacao: {
          gte: startOfMonth
        }
      }
    });

    // Última atividade (usuário mais recente de TODO o sistema)
    const lastUser = await prisma.user.findFirst({
      orderBy: { data_atualizacao: 'desc' },
      select: { data_atualizacao: true }
    });

    // Estatísticas por empresa
    const usersByCompany = await prisma.user.groupBy({
      by: ['id_empresa'],
      _count: {
        id_usuario: true
      }
    });

    const stats = {
      totalUsers,
      adminUsers,
      userUsers,
      ghostUsers,
      newUsersThisMonth,
      lastActivity: lastUser?.data_atualizacao || new Date(),
      usersByCompany: usersByCompany.length
    };

    console.log('📊 Estatísticas calculadas (TODOS os usuários):', stats);

    return res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas dos usuários:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// GET /api/users/company - Buscar usuários da empresa do usuário logado
router.get('/company', auth, requireAdmin, async (req: any, res: any) => {
  try {
    console.log('🔍 === ROTA /api/users/company CHAMADA ===');
    console.log('🔍 Usuário logado ID:', req.user.id_usuario);
    console.log('🔍 ID da empresa do usuário:', req.user.id_empresa);
    console.log('🔍 Perfil do usuário:', req.user.perfil);
    
    // Verificar se o usuário tem empresa associada
    if (!req.user.id_empresa) {
      return res.status(400).json({
        success: false,
        message: 'Usuário não possui empresa associada'
      });
    }
    
    // Buscar apenas usuários da empresa do usuário logado
    console.log('🔍 Buscando usuários da empresa:', req.user.id_empresa);
    
    const users = await prisma.user.findMany({
      where: {
        id_empresa: req.user.id_empresa
      },
      select: {
        id_usuario: true,
        nome: true,
        email: true,
        perfil: true,
        data_criacao: true,
        data_atualizacao: true,
        id_empresa: true,
        empresa: {
          select: {
            razao_social: true,
            nome_fantasia: true,
            cnpj: true
          }
        }
      },
      orderBy: { data_criacao: 'desc' }
    });

    console.log('📋 Usuários encontrados na empresa:', users.length);

    // Contar total de usuários da empresa
    const totalUsers = await prisma.user.count({
      where: {
        id_empresa: req.user.id_empresa
      }
    });

    console.log(`📋 Usuários encontrados na empresa: ${users.length}`);
    console.log(`🔢 Total de usuários na empresa: ${totalUsers}`);

    return res.json({
      success: true,
      data: users,
      totalUsers: totalUsers
    });
  } catch (error) {
    console.error('Erro ao buscar usuários da empresa:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// GET /api/users/system - Buscar todos os usuários do sistema (apenas para admins)
router.get('/system', auth, requireAdmin, async (req: any, res: any) => {
  try {
    console.log('🔍 === ROTA /api/users/system CHAMADA ===');
    console.log('🔍 Usuário logado ID:', req.user.id_usuario);
    console.log('🔍 ID da empresa do usuário:', req.user.id_empresa);
    console.log('🔍 Perfil do usuário:', req.user.perfil);
    
    // Verificar se o usuário é admin
    if (req.user.perfil !== 'admin') {
      console.log('❌ Usuário não é admin, acesso negado');
      return res.status(403).json({
        success: false,
        message: 'Acesso negado. Apenas administradores podem visualizar todos os usuários'
      });
    }
    
    console.log('✅ Usuário é admin, permitindo acesso');
    
    // Buscar TODOS os usuários do sistema
    console.log('🔍 Buscando TODOS os usuários do sistema...');
    
    const users = await prisma.user.findMany({
      select: {
        id_usuario: true,
        nome: true,
        email: true,
        perfil: true,
        data_criacao: true,
        data_atualizacao: true,
        id_empresa: true,
        empresa: {
          select: {
            razao_social: true,
            nome_fantasia: true,
            cnpj: true
          }
        }
      },
      orderBy: { data_criacao: 'desc' }
    });

    console.log('📋 Usuários encontrados no sistema:', users.length);

    // Contar total de usuários do sistema
    const totalUsers = await prisma.user.count();

    console.log(`📋 Usuários encontrados no sistema: ${users.length}`);
    console.log(`🔢 Total de usuários no sistema: ${totalUsers}`);

    return res.json({
      success: true,
      data: users,
      totalUsers: totalUsers
    });
  } catch (error) {
    console.error('Erro ao buscar usuários do sistema:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// POST /api/users - Criar novo usuário
router.post('/', auth, requireAdmin, async (req: any, res: any) => {
  try {
    const { nome, email, perfil } = req.body;

    console.log('➕ === ROTA /api/users (CREATE) CHAMADA ===');
    console.log('➕ Dados recebidos:', { nome, email, perfil });

    // Validações básicas
    if (!nome || !email || !perfil) {
      return res.status(400).json({
        success: false,
        message: 'Nome, e-mail e perfil são obrigatórios'
      });
    }

    if (!['admin', 'user', 'ghost'].includes(perfil)) {
      return res.status(400).json({
        success: false,
        message: 'Perfil inválido. Deve ser admin, user ou ghost'
      });
    }

    // Verificar se o email já existe
    const existingUser = await prisma.user.findFirst({
      where: { 
        email: email.toLowerCase().trim()
      }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Este e-mail já está sendo usado por outro usuário'
      });
    }

    // Gerar senha temporária
    const tempPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);

    // Criar usuário
    const newUser = await prisma.user.create({
      data: {
        nome: nome.trim(),
        email: email.toLowerCase().trim(),
        senha: tempPassword, // TODO: Hash da senha
        perfil: perfil,
        id_empresa: req.user.id_empresa,
        data_criacao: new Date(),
        data_atualizacao: new Date()
      },
      select: {
        id_usuario: true,
        nome: true,
        email: true,
        perfil: true,
        data_criacao: true,
        data_atualizacao: true
      }
    });

    console.log(`✅ Usuário criado com sucesso: ${newUser.email}`);

    // TODO: Enviar e-mail com credenciais temporárias

    return res.status(201).json({
      success: true,
      message: 'Usuário criado com sucesso',
      data: newUser,
      tempPassword // TODO: Remover em produção
    });
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// PUT /api/users/:id - Atualizar usuário (apenas nome, email e perfil)
router.put('/:id', auth, requireAdmin, async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const { nome, email, perfil } = req.body;

    // Verificar se o usuário a ser editado pertence à mesma empresa
    const targetUser = await prisma.user.findUnique({
      where: { id_usuario: id },
      select: { id_empresa: true, perfil: true }
    });

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    // Verificar se o usuário logado é da empresa dona do sistema (CNPJ: 41.115.030/0001-20)
    const isSystemOwner = req.user?.empresa?.cnpj === '41.115.030/0001-20';
    
    // Se não for da empresa dona do sistema, verificar se pertence à mesma empresa
    if (!isSystemOwner && targetUser.id_empresa !== req.user.id_empresa) {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado. Usuário não pertence à mesma empresa.'
      });
    }

    // Verificar se não está tentando alterar o último admin da empresa
    if (targetUser.perfil === 'admin' && (perfil === 'user' || perfil === 'ghost')) {
      const adminCount = await prisma.user.count({
        where: { 
          id_empresa: req.user.id_empresa,
          perfil: 'admin'
        }
      });

      if (adminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: 'Não é possível remover o último administrador da empresa'
        });
      }
    }

    // Verificar se o email já existe em outro usuário
    if (email) {
      const existingUser = await prisma.user.findFirst({
        where: { 
          email: email.toLowerCase().trim(),
          id_usuario: { not: id }
        }
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Este e-mail já está sendo usado por outro usuário'
        });
      }
    }

    // Atualizar usuário
    const updatedUser = await prisma.user.update({
      where: { id_usuario: id },
      data: {
        nome: nome?.trim(),
        email: email?.toLowerCase().trim(),
        perfil: perfil,
        data_atualizacao: new Date()
      },
      select: {
        id_usuario: true,
        nome: true,
        email: true,
        perfil: true,
        data_criacao: true,
        data_atualizacao: true
      }
    });

    console.log(`✅ Usuário atualizado: ${updatedUser.email}`);

    return res.json({
      success: true,
      message: 'Usuário atualizado com sucesso',
      data: updatedUser
    });
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// POST /api/users/:id/reset-password - Reset de senha do usuário
router.post('/:id/reset-password', auth, requireAdmin, async (req: any, res: any) => {
  try {
    const { id } = req.params;

    console.log('🔐 === ROTA /api/users/:id/reset-password CHAMADA ===');
    console.log('🔐 ID do usuário:', id);

    // Verificar se o usuário a ser editado pertence à mesma empresa
    const targetUser = await prisma.user.findUnique({
      where: { id_usuario: id },
      select: { id_empresa: true, email: true }
    });

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    // Verificar se o usuário logado é da empresa dona do sistema (CNPJ: 41.115.030/0001-20)
    const isSystemOwner = req.user?.empresa?.cnpj === '41.115.030/0001-20';
    
    // Se não for da empresa dona do sistema, verificar se pertence à mesma empresa
    if (!isSystemOwner && targetUser.id_empresa !== req.user.id_empresa) {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado. Usuário não pertence à mesma empresa.'
      });
    }

    // Gerar nova senha temporária
    const newPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);

    // Atualizar senha
    await prisma.user.update({
      where: { id_usuario: id },
      data: {
        senha: newPassword, // TODO: Hash da senha
        data_atualizacao: new Date()
      }
    });

    console.log(`✅ Senha resetada para usuário: ${targetUser.email}`);

    // TODO: Enviar e-mail com nova senha

    return res.json({
      success: true,
      message: 'Senha resetada com sucesso',
      newPassword // TODO: Remover em produção
    });
  } catch (error) {
    console.error('Erro ao resetar senha:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// DELETE /api/users/:id - Remover usuário (apenas se não for o último admin)
router.delete('/:id', auth, requireAdmin, async (req: any, res: any) => {
  try {
    const { id } = req.params;

    // Verificar se o usuário a ser removido pertence à mesma empresa
    const targetUser = await prisma.user.findUnique({
      where: { id_usuario: id },
      select: { id_empresa: true, perfil: true }
    });

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    // Verificar se o usuário logado é da empresa dona do sistema (CNPJ: 41.115.030/0001-20)
    const isSystemOwner = req.user?.empresa?.cnpj === '41.115.030/0001-20';
    
    // Se não for da empresa dona do sistema, verificar se pertence à mesma empresa
    if (!isSystemOwner && targetUser.id_empresa !== req.user.id_empresa) {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado. Usuário não pertence à mesma empresa.'
      });
    }

    // Verificar se não está tentando remover o último admin da empresa
    if (targetUser.perfil === 'admin') {
      const adminCount = await prisma.user.count({
        where: { 
          id_empresa: req.user.id_empresa,
          perfil: 'admin'
        }
      });

      if (adminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: 'Não é possível remover o último administrador da empresa'
        });
      }
    }

    // Não permitir remover o próprio usuário
    if (id === req.user.id_usuario) {
      return res.status(400).json({
        success: false,
        message: 'Não é possível remover seu próprio usuário'
      });
    }

    // Remover usuário
    await prisma.user.delete({
      where: { id_usuario: id }
    });

    console.log(`🗑️ Usuário removido: ${id}`);

    return res.json({
      success: true,
      message: 'Usuário removido com sucesso'
    });
  } catch (error) {
    console.error('Erro ao remover usuário:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

export default router;
