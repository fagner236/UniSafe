import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface AuthRequest extends Request {
  user?: {
    id_usuario: string;
    email: string;
    perfil: string;
    id_empresa?: string;
    base_sindical?: string;
    empresa?: {
      id_empresa: string;
      razao_social: string;
      nome_fantasia?: string;
      cnpj: string;
    };
  };
}

export const auth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    console.log('🔐 === MIDDLEWARE DE AUTENTICAÇÃO CHAMADO ===');
    console.log('🔐 Headers recebidos:', req.headers);
    console.log('🔐 IP do cliente:', req.ip || req.connection.remoteAddress);
    console.log('🔐 User-Agent:', req.get('User-Agent'));
    
    const token = req.header('Authorization')?.replace('Bearer ', '');
    console.log('🔐 Token extraído:', token ? token.substring(0, 20) + '...' : 'Nenhum');

    if (!token) {
      console.log('❌ Token não fornecido');
      return res.status(401).json({
        success: false,
        message: 'Token de acesso não fornecido'
      });
    }

    // Validação de segurança do JWT_SECRET
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'fallback-secret') {
      throw new Error('JWT_SECRET não configurado corretamente');
    }

    // Validar formato do token
    if (typeof token !== 'string' || token.length < 10) {
      console.log('❌ Token com formato inválido');
      return res.status(401).json({
        success: false,
        message: 'Token com formato inválido'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as any;
    
    // Validar estrutura do token decodificado
    const userId = decoded.userId || decoded.id_usuario;
    if (!decoded || !userId || typeof userId !== 'string') {
      console.log('❌ Token com estrutura inválida');
      return res.status(401).json({
        success: false,
        message: 'Token com estrutura inválida'
      });
    }

    // Validar se o userId não é vazio
    if (userId.trim() === '') {
      console.log('❌ Token com userId vazio');
      return res.status(401).json({
        success: false,
        message: 'Token com dados inválidos'
      });
    }

    const user = await prisma.user.findUnique({
      where: { id_usuario: userId },
      select: {
        id_usuario: true,
        email: true,
        perfil: true,
        nome: true,
        id_empresa: true,
        base_sindical: true,
        empresa: {
          select: {
            id_empresa: true,
            razao_social: true,
            nome_fantasia: true,
            cnpj: true
          }
        }
      }
    });

    console.log('🔐 Usuário encontrado no banco:', user);

    if (!user) {
      console.log('❌ Usuário não encontrado no banco');
      return res.status(401).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    // Validação adicional de segurança
    if (!user.id_usuario || user.id_usuario.trim() === '') {
      console.log('❌ Usuário com ID inválido');
      return res.status(401).json({
        success: false,
        message: 'Dados do usuário inválidos'
      });
    }

    // Verificar se o usuário está ativo (não deletado)
    if (user.perfil === 'deleted' || user.perfil === 'inactive') {
      console.log('❌ Usuário inativo ou deletado');
      return res.status(401).json({
        success: false,
        message: 'Usuário inativo ou deletado'
      });
    }

    console.log('✅ Usuário autenticado com sucesso:', {
      id: user.id_usuario,
      email: user.email,
      perfil: user.perfil,
      id_empresa: user.id_empresa,
      base_sindical: user.base_sindical
    });
    
    // Validação de segurança para base sindical
    if (!user.base_sindical) {
      console.log('⚠️ AVISO: Usuário sem base sindical configurada:', user.email);
    } else {
      console.log('🔐 Base sindical validada:', user.base_sindical);
    }

    req.user = {
      id_usuario: user.id_usuario,
      email: user.email,
      perfil: user.perfil,
      id_empresa: user.id_empresa || undefined,
      base_sindical: user.base_sindical || undefined,
      empresa: user.empresa ? {
        id_empresa: user.empresa.id_empresa,
        razao_social: user.empresa.razao_social,
        nome_fantasia: user.empresa.nome_fantasia || undefined,
        cnpj: user.empresa.cnpj
      } : undefined
    };

    // Adicionar headers de segurança na resposta
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block'
    });

    return next();
  } catch (error) {
    console.error('❌ Erro no middleware de autenticação:', error);
    
    // Não revelar detalhes do erro para o cliente
    return res.status(401).json({
      success: false,
      message: 'Token inválido ou expirado'
    });
  }
};

export const requireRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Acesso negado'
      });
    }

    if (!roles.includes(req.user.perfil)) {
      return res.status(403).json({
        success: false,
        message: 'Permissão insuficiente'
      });
    }

    return next();
  };
};
