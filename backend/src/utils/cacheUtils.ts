import { cacheService } from '../config/redis';

/**
 * Utilitários de cache específicos para o sistema UniSafe
 * Considerando a frequência de atualização dos dados
 */
export const cacheUtils = {
  
  /**
   * Invalidar cache de dashboard quando dados da base sindical são atualizados
   * Usado quando há upload de novos dados mensais
   */
  async invalidateDashboardCache(baseSindical: string, monthYear?: string) {
    try {
      console.log('🗑️ Invalidando cache de dashboard...');
      
      if (monthYear) {
        // Invalidar cache específico do mês
        const specificKey = `dashboard:${baseSindical}:default:${monthYear}`;
        await cacheService.del(specificKey);
        console.log(`✅ Cache específico invalidado: ${specificKey}`);
      } else {
        // Invalidar todos os caches da base sindical
        const pattern = `dashboard:${baseSindical}:*`;
        await cacheService.delPattern(pattern);
        console.log(`✅ Todos os caches da base sindical invalidados: ${pattern}`);
      }
    } catch (error) {
      console.log('⚠️ Erro ao invalidar cache de dashboard:', error);
    }
  },

  /**
   * Invalidar cache de empregado quando dados são editados
   * Usado quando usuário edita dados na tabela empregados
   */
  async invalidateEmpregadoCache(matricula: string) {
    try {
      console.log('🗑️ Invalidando cache de empregado...');
      const empregadoKey = `empregado:${matricula}`;
      await cacheService.del(empregadoKey);
      console.log(`✅ Cache de empregado invalidado: ${empregadoKey}`);
    } catch (error) {
      console.log('⚠️ Erro ao invalidar cache de empregado:', error);
    }
  },

  /**
   * Invalidar cache de usuário quando dados são atualizados
   * Usado quando perfil de usuário é modificado
   */
  async invalidateUserCache(userId: string) {
    try {
      console.log('🗑️ Invalidando cache de usuário...');
      const userKey = `user:${userId}`;
      await cacheService.del(userKey);
      console.log(`✅ Cache de usuário invalidado: ${userKey}`);
    } catch (error) {
      console.log('⚠️ Erro ao invalidar cache de usuário:', error);
    }
  },

  /**
   * Limpar todo o cache (usar com cuidado)
   * Usado em casos de atualizações massivas
   */
  async clearAllCache() {
    try {
      console.log('🗑️ Limpando todo o cache...');
      await cacheService.delPattern('*');
      console.log('✅ Todo o cache foi limpo');
    } catch (error) {
      console.log('⚠️ Erro ao limpar cache:', error);
    }
  },

  /**
   * Obter estatísticas do cache
   */
  async getCacheStats() {
    try {
      const dashboardKeys = await cacheService.getKeys('dashboard:*');
      const userKeys = await cacheService.getKeys('user:*');
      const empregadoKeys = await cacheService.getKeys('empregado:*');
      
      return {
        dashboardKeys: dashboardKeys.length,
        userKeys: userKeys.length,
        empregadoKeys: empregadoKeys.length,
        memoryUsage: 'N/A' // Redis não expõe isso facilmente
      };
    } catch (error) {
      console.log('⚠️ Erro ao obter estatísticas do cache:', error);
      return { dashboardKeys: 0, userKeys: 0, empregadoKeys: 0, memoryUsage: 'N/A' };
    }
  }
};
