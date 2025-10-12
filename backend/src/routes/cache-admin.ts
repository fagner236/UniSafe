import express from 'express';
import { PrismaClient } from '@prisma/client';
import { auth, AuthRequest } from '../middleware/auth';
import { cacheService } from '../config/redis';
import { cacheUtils } from '../utils/cacheUtils';

const router = express.Router();
const prisma = new PrismaClient();

// Middleware para verificar se o usuário é admin
const requireAdmin = async (req: AuthRequest, res: any, next: any) => {
  try {
    if (!req.user || req.user.perfil !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado. Apenas administradores podem acessar esta funcionalidade.'
      });
    }
    next();
  } catch (error) {
    console.error('Erro na verificação de admin:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// GET /api/cache-admin/status - Obter status do cache
router.get('/status', auth, requireAdmin, async (req: AuthRequest, res) => {
  try {
    console.log('📊 === ADMINISTRAÇÃO DE CACHE - STATUS ===');
    console.log('👤 Usuário admin:', req.user?.email);

    // Obter estatísticas do cache
    const stats = await cacheUtils.getCacheStats();
    
    // Obter informações das chaves existentes
    const allKeys = await cacheService.getKeys('*');
    
    // Separar chaves por tipo
    const dashboardKeys = allKeys.filter(key => key.startsWith('dashboard:'));
    const userKeys = allKeys.filter(key => key.startsWith('user:'));
    const empregadoKeys = allKeys.filter(key => key.startsWith('empregado:'));
    
    // Obter TTL das chaves principais
    const keyTTLs = [];
    for (const key of allKeys.slice(0, 10)) { // Limitar a 10 chaves para performance
      try {
        const ttl = await cacheService.getTTL(key);
        keyTTLs.push({ key, ttl });
      } catch (error) {
        keyTTLs.push({ key, ttl: 'N/A' });
      }
    }

    const cacheStatus = {
      success: true,
      data: {
        redis: {
          connected: true,
          totalKeys: allKeys.length,
          memoryUsage: 'N/A' // Redis não expõe isso facilmente
        },
        keys: {
          dashboard: dashboardKeys.length,
          users: userKeys.length,
          empregados: empregadoKeys.length,
          total: allKeys.length
        },
        sampleKeys: keyTTLs,
        lastUpdated: new Date().toISOString(),
        admin: {
          name: req.user?.email, // Usando email como nome
          email: req.user?.email,
          baseSindical: req.user?.base_sindical
        }
      }
    };

    console.log('✅ Status do cache obtido com sucesso');
    return res.json(cacheStatus);

  } catch (error) {
    console.error('❌ Erro ao obter status do cache:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao obter status do cache',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
});

// POST /api/cache-admin/clear - Limpar cache manualmente
router.post('/clear', auth, requireAdmin, async (req: AuthRequest, res) => {
  try {
    console.log('🗑️ === ADMINISTRAÇÃO DE CACHE - LIMPEZA MANUAL ===');
    console.log('👤 Usuário admin:', req.user?.email);
    console.log('📊 Tipo de limpeza:', req.body.type || 'all');

    const { type, baseSindical } = req.body;
    let clearedKeys = 0;
    let message = '';

    switch (type) {
      case 'dashboard':
        if (baseSindical) {
          // Limpar cache específico de uma base sindical
          await cacheUtils.invalidateDashboardCache(baseSindical);
          message = `Cache do dashboard da base sindical "${baseSindical}" limpo com sucesso`;
          clearedKeys = 1; // Estimativa
        } else {
          // Limpar todos os caches de dashboard
          const dashboardKeys = await cacheService.getKeys('dashboard:*');
          await cacheService.delMany(dashboardKeys);
          clearedKeys = dashboardKeys.length;
          message = `Cache do dashboard limpo com sucesso (${clearedKeys} chaves)`;
        }
        break;

      case 'users':
        // Limpar cache de usuários
        const userKeys = await cacheService.getKeys('user:*');
        await cacheService.delMany(userKeys);
        clearedKeys = userKeys.length;
        message = `Cache de usuários limpo com sucesso (${clearedKeys} chaves)`;
        break;

      case 'empregados':
        // Limpar cache de empregados
        const empregadoKeys = await cacheService.getKeys('empregado:*');
        await cacheService.delMany(empregadoKeys);
        clearedKeys = empregadoKeys.length;
        message = `Cache de empregados limpo com sucesso (${clearedKeys} chaves)`;
        break;

      case 'all':
      default:
        // Limpar todo o cache
        await cacheUtils.clearAllCache();
        message = 'Todo o cache foi limpo com sucesso';
        clearedKeys = -1; // Indica limpeza completa
        break;
    }

    // Log da ação administrativa
    console.log(`[AUDIT] Cache limpo por admin: ${req.user?.email} - ${new Date().toISOString()}`);
    console.log(`[AUDIT] Tipo: ${type}, Chaves afetadas: ${clearedKeys}`);

    const response = {
      success: true,
      message,
      data: {
        type,
        clearedKeys,
        clearedAt: new Date().toISOString(),
        admin: {
          name: req.user?.email, // Usando email como nome
          email: req.user?.email
        }
      }
    };

    console.log('✅ Cache limpo com sucesso');
    return res.json(response);

  } catch (error) {
    console.error('❌ Erro ao limpar cache:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao limpar cache',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
});

// GET /api/cache-admin/keys - Listar chaves do cache (para debug)
router.get('/keys', auth, requireAdmin, async (req: AuthRequest, res) => {
  try {
    console.log('🔍 === ADMINISTRAÇÃO DE CACHE - LISTAR CHAVES ===');
    
    const allKeys = await cacheService.getKeys('*');
    
    // Obter informações detalhadas das chaves
    const keyDetails = [];
    for (const key of allKeys.slice(0, 50)) { // Limitar a 50 chaves
      try {
        const ttl = await cacheService.getTTL(key);
        const size = await cacheService.getSize(key);
        keyDetails.push({
          key,
          ttl,
          size: size || 'N/A'
        });
      } catch (error) {
        keyDetails.push({
          key,
          ttl: 'N/A',
          size: 'N/A'
        });
      }
    }

    return res.json({
      success: true,
      data: {
        totalKeys: allKeys.length,
        keys: keyDetails,
        lastUpdated: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Erro ao listar chaves do cache:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao listar chaves do cache'
    });
  }
});

export default router;
