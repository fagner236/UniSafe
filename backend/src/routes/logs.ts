import express from 'express';
import { PrismaClient } from '@prisma/client';
import { auth } from '../middleware/auth';
import LogCleanupService from '../services/logCleanupService';
import { SystemLogger } from '../utils/logger';

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

    // Aplicar filtros apenas se não estiverem vazios
    if (level && level.trim() !== '') {
      whereClause.level = level;
    }

    if (category && category.trim() !== '') {
      whereClause.category = category;
    }

    if (dateFrom || dateTo) {
      whereClause.timestamp = {};
      if (dateFrom && dateFrom.trim() !== '') {
        whereClause.timestamp.gte = new Date(dateFrom as string);
      }
      if (dateTo && dateTo.trim() !== '') {
        whereClause.timestamp.lte = new Date(dateTo as string);
      }
    }

    if (search && search.trim() !== '') {
      whereClause.OR = [
        { message: { contains: search as string, mode: 'insensitive' } },
        { userEmail: { contains: search as string, mode: 'insensitive' } },
        { companyName: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    if (userId && userId.trim() !== '') {
      whereClause.userId = userId;
    }

    if (companyId && companyId.trim() !== '') {
      whereClause.companyId = companyId;
    }

    console.log('🔍 Filtros construídos:', JSON.stringify(whereClause, null, 2));

    // Se whereClause estiver vazio, buscar todos os logs
    const finalWhereClause = Object.keys(whereClause).length === 0 ? undefined : whereClause;
    
    console.log('🔍 Where clause final:', finalWhereClause ? JSON.stringify(finalWhereClause, null, 2) : '{} (todos os logs)');

    // Buscar logs com paginação
    const [logs, totalLogs] = await Promise.all([
      prisma.systemLog.findMany({
        where: finalWhereClause || {},
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
      prisma.systemLog.count({ where: finalWhereClause || {} })
    ]);

    console.log(`📋 Logs encontrados: ${logs.length} de ${totalLogs} total no banco`);

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

// GET /api/admin/logs/cleanup-stats - Estatísticas de limpeza de logs
router.get('/cleanup-stats', auth, requireSystemOwner, async (req: any, res: any) => {
  try {
    console.log('📊 === ROTA /api/admin/logs/cleanup-stats CHAMADA ===');
    
    const stats = await LogCleanupService.getCleanupStats();
    
    return res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('❌ Erro ao obter estatísticas de limpeza:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// POST /api/admin/logs/cleanup - Executar limpeza manual de logs
router.post('/cleanup', auth, requireSystemOwner, async (req: any, res: any) => {
  try {
    console.log('🧹 === ROTA /api/admin/logs/cleanup CHAMADA ===');
    
    const result = await LogCleanupService.cleanupOldLogs();
    
    return res.json({
      success: true,
      message: `Limpeza concluída: ${result.deleted} logs removidos`,
      data: result
    });
  } catch (error) {
    console.error('❌ Erro ao executar limpeza de logs:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// POST /api/admin/logs - Criar log do sistema (chamado do frontend)
router.post('/', auth, async (req: any, res: any) => {
  try {
    console.log('📝 === ROTA POST /api/admin/logs CHAMADA ===');
    console.log('📝 Dados do log:', req.body);

    const {
      level = 'INFO',
      category = 'SYSTEM',
      message,
      action,
      resource,
      details
    } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Mensagem é obrigatória'
      });
    }

    // Obter informações do usuário e empresa do token
    const userId = req.user?.id_usuario;
    const userEmail = req.user?.email;
    const userProfile = req.user?.perfil;
    const companyId = req.user?.empresa?.id_empresa;
    const companyName = req.user?.empresa?.nome_fantasia || req.user?.empresa?.razao_social;

    // Obter IP e User Agent da requisição
    // Usar a mesma lógica das outras rotas do sistema
    let ipAddress: string | undefined;
    
    // Tentar múltiplas formas de obter o IP (na ordem de prioridade)
    // 1. req.ip (funciona quando trust proxy está configurado)
    if (req.ip && req.ip !== '::1' && req.ip !== '127.0.0.1' && req.ip !== '::ffff:127.0.0.1') {
      ipAddress = req.ip;
    }
    // 2. X-Forwarded-For (quando há proxy/load balancer)
    else if (req.headers['x-forwarded-for']) {
      const forwardedFor = req.headers['x-forwarded-for'];
      ipAddress = Array.isArray(forwardedFor) 
        ? forwardedFor[0].trim() 
        : forwardedFor.split(',')[0].trim();
    }
    // 3. X-Real-IP (nginx proxy)
    else if (req.headers['x-real-ip']) {
      ipAddress = Array.isArray(req.headers['x-real-ip']) 
        ? req.headers['x-real-ip'][0] 
        : req.headers['x-real-ip'];
    }
    // 4. CF-Connecting-IP (Cloudflare)
    else if (req.headers['cf-connecting-ip']) {
      ipAddress = Array.isArray(req.headers['cf-connecting-ip']) 
        ? req.headers['cf-connecting-ip'][0] 
        : req.headers['cf-connecting-ip'];
    }
    // 5. socket.remoteAddress (fallback direto)
    else if (req.socket?.remoteAddress) {
      const socketIp = req.socket.remoteAddress;
      // Remover prefixo IPv6 se houver
      ipAddress = socketIp.startsWith('::ffff:') 
        ? socketIp.replace('::ffff:', '') 
        : socketIp;
    }
    // 6. connection.remoteAddress (fallback antigo)
    else if ((req as any).connection?.remoteAddress) {
      const connIp = (req as any).connection.remoteAddress;
      // Remover prefixo IPv6 se houver
      ipAddress = connIp.startsWith('::ffff:') 
        ? connIp.replace('::ffff:', '') 
        : connIp;
    }
    
    // Se ainda não tiver IP válido, usar 'Não informado'
    if (!ipAddress || ipAddress === '::1' || ipAddress === '127.0.0.1' || ipAddress === '::ffff:127.0.0.1') {
      ipAddress = 'Não informado';
    }
    
    const userAgent = req.headers['user-agent'] || 'Não informado';
    // Tentar múltiplas formas de obter o Session ID
    let sessionId = req.headers['x-session-id']?.toString() || 
                    (req as any).sessionID || 
                    (req as any).session?.id;
    
    // Se não tiver session ID, gerar um baseado no timestamp e IP
    if (!sessionId) {
      const timestamp = Date.now();
      const ipHash = ipAddress ? ipAddress.replace(/[^0-9]/g, '').slice(-8) : '00000000';
      sessionId = `session-${timestamp}-${ipHash}`;
    }
    
    // Logs de debug para verificar captura do IP
    console.log('📝 === DEBUG CAPTURA DE IP ===');
    console.log('📝 req.ip:', req.ip);
    console.log('📝 req.headers[x-forwarded-for]:', req.headers['x-forwarded-for']);
    console.log('📝 req.headers[x-real-ip]:', req.headers['x-real-ip']);
    console.log('📝 req.socket.remoteAddress:', req.socket?.remoteAddress);
    console.log('📝 req.connection.remoteAddress:', (req as any).connection?.remoteAddress);
    console.log('📝 IP FINAL capturado:', ipAddress);
    console.log('📝 Session ID capturado:', sessionId);

    // Criar log usando o SystemLogger
    // IP e Session ID são salvos nos campos principais do log e aparecem na seção de detalhes
    const log = await SystemLogger.log({
      level: level.toUpperCase(),
      category: category.toUpperCase(),
      message,
      userId,
      userEmail,
      userProfile,
      companyId,
      companyName,
      ipAddress,
      userAgent,
      sessionId,
      action,
      resource,
      details
    });

    console.log('✅ Log criado com sucesso:', log?.id);

    return res.json({
      success: true,
      data: log
    });
  } catch (error) {
    console.error('❌ Erro ao criar log:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

export default router;
