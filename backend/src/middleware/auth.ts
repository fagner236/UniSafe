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

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as any;
    
    const user = await prisma.user.findUnique({
      where: { id_usuario: decoded.userId },
      select: {
        id_usuario: true,
        email: true,
        perfil: true,
        nome: true,
        id_empresa: true,
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

    console.log('✅ Usuário autenticado com sucesso:', {
      id: user.id_usuario,
      email: user.email,
      perfil: user.perfil,
      id_empresa: user.id_empresa
    });

    req.user = user;
    return next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token inválido'
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
