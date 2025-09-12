import express from 'express';
import { PrismaClient } from '@prisma/client';
import { auth } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Middleware para verificar se o usuário é da empresa dona do sistema
const requireSystemOwner = async (req: any, res: any, next: any) => {
  try {
    console.log('🔐 === MIDDLEWARE requireSystemOwner ===');
    console.log('🔐 Usuário:', req.user);
    console.log('🔐 Empresa:', req.user?.empresa);
    console.log('🔐 CNPJ da empresa:', req.user?.empresa?.cnpj);
    console.log('🔐 Perfil do usuário:', req.user?.perfil);

    // Verificar se o usuário é da empresa dona do sistema (CNPJ: 41.115.030/0001-20)
    const isSystemOwner = req.user?.empresa?.cnpj === '41.115.030/0001-20';
    console.log('🔐 É dono do sistema?', isSystemOwner);
    
    if (!req.user || !req.user.empresa || !isSystemOwner) {
      console.log('❌ Acesso negado - Não é da empresa dona do sistema');
      console.log('❌ Detalhes da validação:');
      console.log('❌ - Usuário existe:', !!req.user);
      console.log('❌ - Empresa existe:', !!req.user?.empresa);
      console.log('❌ - CNPJ correto:', req.user?.empresa?.cnpj === '41.115.030/0001-20');
      return res.status(403).json({
        success: false,
        message: 'Acesso negado. Apenas administradores da empresa dona do sistema podem acessar esta funcionalidade.'
      });
    }

    // Verificar se o usuário é admin
    if (req.user.perfil !== 'admin') {
      console.log('❌ Acesso negado - Não é administrador');
      return res.status(403).json({
        success: false,
        message: 'Acesso negado. Apenas administradores podem acessar esta funcionalidade.'
      });
    }

    console.log('✅ Acesso permitido - Usuário é admin da empresa dona do sistema');
    next();
  } catch (error) {
    console.error('❌ Erro ao verificar permissões de sistema:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// GET /api/admin/stats - Estatísticas globais do sistema
router.get('/stats', auth, requireSystemOwner, async (req: any, res: any) => {
  try {
    console.log('🔍 === ROTA /api/admin/stats CHAMADA ===');
    console.log('🔍 Usuário logado:', req.user.email);
    console.log('🔍 Empresa:', req.user.empresa?.razao_social);
    console.log('🔍 CNPJ da empresa:', req.user.empresa?.cnpj);
    console.log('🔍 Perfil do usuário:', req.user.perfil);

    // Buscar estatísticas globais do sistema
    const [
      totalUsers,
      totalCompanies,
      adminUsers,
      ghostUsers,
      userUsers
    ] = await Promise.all([
      // Total de usuários no sistema
      prisma.user.count(),
      
      // Total de empresas (contagem de CNPJs distintos)
      prisma.company.count(),
      
      // Usuários por perfil
      prisma.user.count({ where: { perfil: 'admin' } }),
      prisma.user.count({ where: { perfil: 'ghost' } }),
      prisma.user.count({ where: { perfil: 'user' } })
    ]);

    // Verificar se há empresas duplicadas (CNPJs duplicados)
    const allCompanies = await prisma.company.findMany({
      select: { cnpj: true }
    });
    
    const uniqueCnpjs = new Set(allCompanies.map(company => company.cnpj));
    const totalUniqueCnpjs = uniqueCnpjs.size;

    console.log('📊 Estatísticas do sistema:', {
      totalUsers,
      totalCompanies,
      totalUniqueCnpjs,
      adminUsers,
      ghostUsers,
      userUsers
    });

    console.log('🏢 Detalhes das empresas:', {
      totalCompaniesFromCount: totalCompanies,
      totalUniqueCnpjs: totalUniqueCnpjs,
      cnpjs: Array.from(uniqueCnpjs)
    });

    return res.json({
      success: true,
      data: {
        totalUsers,
        totalCompanies: totalUniqueCnpjs, // Usar CNPJs únicos
        usersByProfile: {
          admin: adminUsers,
          ghost: ghostUsers,
          user: userUsers
        }
      }
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas do sistema:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// GET /api/admin/users - Listar todos os usuários do sistema
router.get('/users', auth, requireSystemOwner, async (req: any, res: any) => {
  try {
    console.log('🔍 === ROTA /api/admin/users CHAMADA ===');
    
    const { page = 1, limit = 50, search = '' } = req.query;
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

    // Construir filtro de busca
    const whereClause = search ? {
      OR: [
        { nome: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } },
        { perfil: { contains: search as string, mode: 'insensitive' } }
      ]
    } : {};

    // Buscar usuários com paginação
    const [users, totalUsers] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
        select: {
          id_usuario: true,
          nome: true,
          email: true,
          perfil: true,
          data_criacao: true,
          data_atualizacao: true,
          empresa: {
            select: {
              nome_fantasia: true,
              razao_social: true,
              cnpj: true
            }
          }
        },
        orderBy: { data_criacao: 'desc' },
        skip: offset,
        take: parseInt(limit as string)
      }),
      prisma.user.count({ where: whereClause })
    ]);

    console.log(`📋 Usuários encontrados: ${users.length} de ${totalUsers}`);

    return res.json({
      success: true,
      data: users,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total: totalUsers,
        totalPages: Math.ceil(totalUsers / parseInt(limit as string))
      }
    });
  } catch (error) {
    console.error('Erro ao buscar usuários do sistema:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Rota de teste para debug
router.get('/test', auth, async (req: any, res: any) => {
  try {
    console.log('🧪 === ROTA DE TESTE /api/admin/test ===');
    console.log('🧪 Usuário completo:', JSON.stringify(req.user, null, 2));
    console.log('🧪 Headers:', req.headers);
    
    return res.json({
      success: true,
      message: 'Rota de teste funcionando',
      user: req.user,
      empresa: req.user?.empresa,
      cnpj: req.user?.empresa?.cnpj,
      perfil: req.user?.perfil
    });
  } catch (error) {
    console.error('❌ Erro na rota de teste:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro na rota de teste'
    });
  }
});

// Rota de teste para contar empresas (sem autenticação para debug)
router.get('/test-companies', async (req: any, res: any) => {
  try {
    console.log('🏢 === ROTA DE TESTE EMPRESAS /api/admin/test-companies ===');
    
    // Contar total de empresas
    const totalCompanies = await prisma.company.count();
    
    // Buscar todas as empresas com CNPJ
    const allCompanies = await prisma.company.findMany({
      select: { 
        id_empresa: true,
        cnpj: true,
        razao_social: true,
        nome_fantasia: true
      }
    });
    
    // Contar CNPJs únicos
    const uniqueCnpjs = new Set(allCompanies.map(company => company.cnpj));
    const totalUniqueCnpjs = uniqueCnpjs.size;
    
    console.log('🏢 Estatísticas das empresas:', {
      totalCompanies,
      totalUniqueCnpjs,
      companies: allCompanies
    });
    
    return res.json({
      success: true,
      message: 'Contagem de empresas realizada',
      data: {
        totalCompanies,
        totalUniqueCnpjs,
        companies: allCompanies,
        uniqueCnpjs: Array.from(uniqueCnpjs)
      }
    });
  } catch (error) {
    console.error('❌ Erro ao contar empresas:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao contar empresas',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
});

// Rota de teste para contar usuários (sem autenticação para debug)
router.get('/test-users', async (req: any, res: any) => {
  try {
    console.log('👥 === ROTA DE TESTE USUÁRIOS /api/admin/test-users ===');
    
    // Contar total de usuários
    const totalUsers = await prisma.user.count();
    
    // Contar usuários por perfil
    const adminUsers = await prisma.user.count({ where: { perfil: 'admin' } });
    const ghostUsers = await prisma.user.count({ where: { perfil: 'ghost' } });
    const userUsers = await prisma.user.count({ where: { perfil: 'user' } });
    
    // Buscar alguns usuários para exemplo
    const sampleUsers = await prisma.user.findMany({
      select: { 
        id_usuario: true,
        nome: true,
        email: true,
        perfil: true,
        id_empresa: true
      },
      take: 5
    });
    
    console.log('👥 Estatísticas dos usuários:', {
      totalUsers,
      adminUsers,
      ghostUsers,
      userUsers,
      sampleUsers
    });
    
    return res.json({
      success: true,
      message: 'Contagem de usuários realizada',
      data: {
        totalUsers,
        usersByProfile: {
          admin: adminUsers,
          ghost: ghostUsers,
          user: userUsers
        },
        sampleUsers
      }
    });
  } catch (error) {
    console.error('❌ Erro ao contar usuários:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao contar usuários',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
});

export default router;
