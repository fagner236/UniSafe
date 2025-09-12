import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';

/**
 * Middleware para validar acesso aos dados da empresa
 * Garante que usuários só acessem dados de sua própria empresa
 */
export const validateCompanyAccess = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    console.log('🔐 === VALIDAÇÃO DE ACESSO À EMPRESA ===');
    console.log('🔐 Método:', req.method);
    console.log('🔐 Path:', req.path);
    console.log('🔐 Headers:', req.headers);
    
    const user = req.user;
    
    if (!user) {
      console.log('❌ Usuário não autenticado no middleware de validação de empresa');
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado'
      });
    }

    console.log('🔐 Usuário autenticado:', {
      id: user.id_usuario,
      email: user.email,
      perfil: user.perfil,
      empresa: user.id_empresa
    });

    // Usuários admin podem acessar dados de qualquer empresa
    if (user.perfil === 'admin') {
      console.log('✅ Usuário admin - acesso permitido a qualquer empresa');
      return next();
    }

    // Verificar se o usuário tem empresa vinculada
    if (!user.id_empresa) {
      console.log('❌ Usuário sem empresa vinculada');
      return res.status(403).json({
        success: false,
        message: 'Usuário não possui empresa vinculada'
      });
    }

    // Para uploads, permitir sempre (usuário só pode fazer upload para sua própria empresa)
    if (req.method === 'POST' && req.path === '/') {
      console.log('✅ Upload autorizado para usuário da empresa:', user.id_empresa);
      return next();
    }

    // Verificar se há tentativa de acessar dados de outra empresa
    const requestedCompanyId = req.params.companyId || req.body.companyId || req.query.companyId;
    
    if (requestedCompanyId && requestedCompanyId !== user.id_empresa) {
      console.log('❌ Tentativa de acesso a empresa não autorizada:', {
        userCompany: user.id_empresa,
        requestedCompany: requestedCompanyId,
        userId: user.id_usuario,
        userEmail: user.email
      });
      
      return res.status(403).json({
        success: false,
        message: 'Acesso negado - você só pode acessar dados de sua própria empresa'
      });
    }

    console.log('✅ Acesso à empresa validado com sucesso:', {
      userId: user.id_usuario,
      userCompany: user.id_empresa,
      requestedCompany: requestedCompanyId || 'própria empresa',
      method: req.method,
      path: req.path
    });

    next();
  } catch (error) {
    console.error('❌ Erro no middleware de validação de empresa:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno na validação de acesso'
    });
  }
};

/**
 * Middleware para validar se o usuário pode acessar dados de um upload específico
 */
export const validateUploadAccess = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = req.user;
    const uploadId = req.params.uploadId;
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado'
      });
    }

    if (!uploadId) {
      return res.status(400).json({
        success: false,
        message: 'ID do upload é obrigatório'
      });
    }

    // Usuários admin podem acessar qualquer upload
    if (user.perfil === 'admin') {
      return next();
    }

    // Verificar se o upload pertence à empresa do usuário
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    prisma.upload.findFirst({
      where: { 
        id: uploadId,
        id_empresa: user.id_empresa
      },
      select: { id: true, id_empresa: true }
    }).then((upload: any) => {
      if (!upload) {
        console.log('❌ Tentativa de acesso a upload não autorizado:', {
          uploadId,
          userCompany: user.id_empresa,
          userId: user.id_usuario
        });
        
        return res.status(403).json({
          success: false,
          message: 'Upload não encontrado ou não pertence à sua empresa'
        });
      }

      console.log('✅ Acesso ao upload validado:', {
        uploadId,
        userCompany: user.id_empresa,
        userId: user.id_usuario
      });

      next();
      return;
    }).catch((error: any) => {
      console.error('❌ Erro ao validar acesso ao upload:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno na validação de acesso'
      });
    }).finally(() => {
      prisma.$disconnect();
    });

  } catch (error) {
    console.error('❌ Erro no middleware de validação de upload:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno na validação de acesso'
    });
  }
};
