import express from 'express';
import { PrismaClient } from '@prisma/client';
import { auth } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Middleware para verificar se o usuário é da empresa dona do sistema
const requireSystemOwner = async (req: any, res: any, next: any) => {
  try {
    console.log('🔐 === MIDDLEWARE requireSystemOwner (LOGS) ===');
    console.log('🔐 Usuário:', req.user);
    console.log('🔐 Empresa:', req.user?.empresa);
    console.log('🔐 CNPJ da empresa:', req.user?.empresa?.cnpj);
    console.log('🔐 Perfil do usuário:', req.user?.perfil);

    // Verificar se o usuário é da empresa dona do sistema (CNPJ: 41.115.030/0001-20)
    const isSystemOwner = req.user?.empresa?.cnpj === '41.115.030/0001-20';
    console.log('🔐 É dono do sistema?', isSystemOwner);
    
    if (!req.user || !req.user.empresa || !isSystemOwner) {
      console.log('❌ Acesso negado - Não é da empresa dona do sistema');
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

// GET /api/admin/logs - Buscar logs do sistema
router.get('/', auth, requireSystemOwner, async (req: any, res: any) => {
  try {
    console.log('🔍 === ROTA /api/admin/logs CHAMADA ===');
    console.log('🔍 Usuário logado:', req.user.email);
    console.log('🔍 Filtros aplicados:', req.query);

    const { 
      page = 1, 
      limit = 50, 
      level = '', 
      category = '', 
      dateFrom = '', 
      dateTo = '', 
      search = '',
      userId = '',
      companyId = ''
    } = req.query;

    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

    // Construir filtros de busca
    const whereClause: any = {};

    if (level) {
      whereClause.level = level;
    }

    if (category) {
      whereClause.category = category;
    }

    if (dateFrom || dateTo) {
      whereClause.timestamp = {};
      if (dateFrom) {
        whereClause.timestamp.gte = new Date(dateFrom as string);
      }
      if (dateTo) {
        whereClause.timestamp.lte = new Date(dateTo as string);
      }
    }

    if (search) {
      whereClause.OR = [
        { message: { contains: search as string, mode: 'insensitive' } },
        { userEmail: { contains: search as string, mode: 'insensitive' } },
        { companyName: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    if (userId) {
      whereClause.userId = userId;
    }

    if (companyId) {
      whereClause.companyId = companyId;
    }

    console.log('🔍 Filtros construídos:', whereClause);

    // Buscar logs com paginação
    const [logs, totalLogs] = await Promise.all([
      prisma.systemLog.findMany({
        where: whereClause,
        orderBy: { timestamp: 'desc' },
        skip: offset,
        take: parseInt(limit as string),
        include: {
          user: {
            select: {
              email: true,
              perfil: true
            }
          },
          company: {
            select: {
              nome_fantasia: true,
              razao_social: true
            }
          }
        }
      }),
      prisma.systemLog.count({ where: whereClause })
    ]);

    console.log(`📋 Logs encontrados: ${logs.length} de ${totalLogs}`);

    // Formatar logs para resposta
    const formattedLogs = logs.map(log => ({
      id: log.id,
      timestamp: log.timestamp.toISOString(),
      level: log.level,
      category: log.category,
      message: log.message,
      userId: log.userId,
      userEmail: log.user?.email,
      userProfile: log.user?.perfil,
      companyId: log.companyId,
      companyName: log.company?.nome_fantasia || log.company?.razao_social,
      ipAddress: log.ipAddress,
      userAgent: log.userAgent,
      sessionId: log.sessionId,
      action: log.action,
      resource: log.resource,
      details: log.details
    }));

    return res.json({
      success: true,
      data: {
        logs: formattedLogs,
        total: totalLogs
      },
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total: totalLogs,
        totalPages: Math.ceil(totalLogs / parseInt(limit as string))
      }
    });
  } catch (error) {
    console.error('❌ Erro ao buscar logs do sistema:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// GET /api/admin/logs/stats - Estatísticas dos logs
router.get('/stats', auth, requireSystemOwner, async (req: any, res: any) => {
  try {
    console.log('📊 === ROTA /api/admin/logs/stats CHAMADA ===');

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

    // Estatísticas por período
    const [totalLogs, logsToday, logsThisWeek, logsThisMonth] = await Promise.all([
      prisma.systemLog.count(),
      prisma.systemLog.count({
        where: { timestamp: { gte: today } }
      }),
      prisma.systemLog.count({
        where: { timestamp: { gte: weekAgo } }
      }),
      prisma.systemLog.count({
        where: { timestamp: { gte: monthAgo } }
      })
    ]);

    // Estatísticas por nível
    const logsByLevel = await prisma.systemLog.groupBy({
      by: ['level'],
      _count: { level: true }
    });

    const byLevel = {
      INFO: 0,
      WARN: 0,
      ERROR: 0,
      DEBUG: 0,
      AUDIT: 0
    };

    logsByLevel.forEach(item => {
      byLevel[item.level as keyof typeof byLevel] = item._count.level;
    });

    // Estatísticas por categoria
    const logsByCategory = await prisma.systemLog.groupBy({
      by: ['category'],
      _count: { category: true }
    });

    const byCategory: { [key: string]: number } = {};
    logsByCategory.forEach(item => {
      byCategory[item.category] = item._count.category;
    });

    // Top usuários
    const topUsers = await prisma.systemLog.groupBy({
      by: ['userEmail'],
      _count: { userEmail: true },
      orderBy: { _count: { userEmail: 'desc' } },
      take: 10
    });

    // Top empresas
    const topCompanies = await prisma.systemLog.groupBy({
      by: ['companyName'],
      _count: { companyName: true },
      orderBy: { _count: { companyName: 'desc' } },
      take: 10
    });

    const stats = {
      totalLogs,
      logsToday,
      logsThisWeek,
      logsThisMonth,
      byLevel,
      byCategory,
      topUsers: topUsers.map(item => ({
        email: item.userEmail || 'Sistema',
        count: item._count.userEmail
      })),
      topCompanies: topCompanies.map(item => ({
        name: item.companyName || 'Sistema',
        count: item._count.companyName
      }))
    };

    console.log('📊 Estatísticas dos logs calculadas:', stats);

    return res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('❌ Erro ao calcular estatísticas dos logs:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// GET /api/admin/logs/export - Exportar logs
router.get('/export', auth, requireSystemOwner, async (req: any, res: any) => {
  try {
    console.log('📤 === ROTA /api/admin/logs/export CHAMADA ===');
    
    const { format = 'json', level = '', category = '', dateFrom = '', dateTo = '', search = '' } = req.query;

    // Construir filtros (similar ao endpoint de busca)
    const whereClause: any = {};

    if (level) {
      whereClause.level = level;
    }

    if (category) {
      whereClause.category = category;
    }

    if (dateFrom || dateTo) {
      whereClause.timestamp = {};
      if (dateFrom) {
        whereClause.timestamp.gte = new Date(dateFrom as string);
      }
      if (dateTo) {
        whereClause.timestamp.lte = new Date(dateTo as string);
      }
    }

    if (search) {
      whereClause.OR = [
        { message: { contains: search as string, mode: 'insensitive' } },
        { userEmail: { contains: search as string, mode: 'insensitive' } },
        { companyName: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    // Buscar todos os logs com os filtros aplicados
    const logs = await prisma.systemLog.findMany({
      where: whereClause,
      orderBy: { timestamp: 'desc' },
      include: {
        user: {
          select: {
            email: true,
            perfil: true
          }
        },
        company: {
          select: {
            nome_fantasia: true,
            razao_social: true
          }
        }
      }
    });

    console.log(`📤 Exportando ${logs.length} logs no formato ${format}`);

    if (format === 'csv') {
      // Gerar CSV
      const csvHeaders = [
        'Timestamp',
        'Nível',
        'Categoria',
        'Mensagem',
        'Usuário',
        'Perfil',
        'Empresa',
        'IP',
        'User Agent',
        'Sessão',
        'Ação',
        'Recurso'
      ];

      const csvRows = logs.map(log => [
        log.timestamp.toISOString(),
        log.level,
        log.category,
        log.message,
        log.user?.email || '',
        log.user?.perfil || '',
        log.company?.nome_fantasia || log.company?.razao_social || '',
        log.ipAddress || '',
        log.userAgent || '',
        log.sessionId || '',
        log.action || '',
        log.resource || ''
      ]);

      const csvContent = [csvHeaders, ...csvRows]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=system-logs-${new Date().toISOString().split('T')[0]}.csv`);
      return res.send(csvContent);
    } else {
      // Gerar JSON
      const formattedLogs = logs.map(log => ({
        id: log.id,
        timestamp: log.timestamp.toISOString(),
        level: log.level,
        category: log.category,
        message: log.message,
        userId: log.userId,
        userEmail: log.user?.email,
        userProfile: log.user?.perfil,
        companyId: log.companyId,
        companyName: log.company?.nome_fantasia || log.company?.razao_social,
        ipAddress: log.ipAddress,
        userAgent: log.userAgent,
        sessionId: log.sessionId,
        action: log.action,
        resource: log.resource,
        details: log.details
      }));

      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename=system-logs-${new Date().toISOString().split('T')[0]}.json`);
      return res.json({
        success: true,
        data: formattedLogs,
        exportInfo: {
          timestamp: new Date().toISOString(),
          totalLogs: formattedLogs.length,
          filters: req.query
        }
      });
    }
  } catch (error) {
    console.error('❌ Erro ao exportar logs:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

export default router;
