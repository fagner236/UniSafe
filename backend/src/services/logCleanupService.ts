import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Serviço de limpeza automática de logs antigos
 * Remove logs mais antigos que o período de retenção configurado
 */
export class LogCleanupService {
  // Período de retenção padrão: 90 dias (configurável via variável de ambiente)
  private static readonly DEFAULT_RETENTION_DAYS = 90;
  
  // Intervalo de execução: 1 vez por dia (24 horas)
  private static readonly CLEANUP_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 horas
  
  private static cleanupInterval: NodeJS.Timeout | null = null;

  /**
   * Obtém o período de retenção em dias a partir da variável de ambiente
   */
  private static getRetentionDays(): number {
    const retentionDays = process.env.LOG_RETENTION_DAYS;
    if (retentionDays) {
      const parsed = parseInt(retentionDays, 10);
      if (!isNaN(parsed) && parsed > 0) {
        return parsed;
      }
    }
    return this.DEFAULT_RETENTION_DAYS;
  }

  /**
   * Executa a limpeza de logs antigos
   */
  static async cleanupOldLogs(): Promise<{ deleted: number; retentionDays: number }> {
    try {
      const retentionDays = this.getRetentionDays();
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

      console.log(`🧹 Iniciando limpeza de logs antigos (retenção: ${retentionDays} dias)`);
      console.log(`📅 Removendo logs anteriores a: ${cutoffDate.toISOString()}`);

      // Contar logs que serão removidos
      const countToDelete = await prisma.systemLog.count({
        where: {
          timestamp: {
            lt: cutoffDate
          }
        }
      });

      if (countToDelete === 0) {
        console.log('✅ Nenhum log antigo encontrado para remover');
        return { deleted: 0, retentionDays };
      }

      // Remover logs antigos
      const result = await prisma.systemLog.deleteMany({
        where: {
          timestamp: {
            lt: cutoffDate
          }
        }
      });

      console.log(`✅ Limpeza concluída: ${result.count} logs removidos`);
      console.log(`📊 Logs mantidos: logs dos últimos ${retentionDays} dias`);

      return { deleted: result.count, retentionDays };
    } catch (error) {
      console.error('❌ Erro ao executar limpeza de logs:', error);
      throw error;
    }
  }

  /**
   * Inicia o serviço de limpeza automática
   * Executa limpeza imediatamente e depois a cada 24 horas
   */
  static start(): void {
    // Executar limpeza imediatamente ao iniciar
    this.cleanupOldLogs().catch(error => {
      console.error('❌ Erro na limpeza inicial de logs:', error);
    });

    // Configurar limpeza periódica
    this.cleanupInterval = setInterval(() => {
      this.cleanupOldLogs().catch(error => {
        console.error('❌ Erro na limpeza periódica de logs:', error);
      });
    }, this.CLEANUP_INTERVAL_MS);

    const retentionDays = this.getRetentionDays();
    console.log(`🔄 Serviço de limpeza de logs iniciado`);
    console.log(`📅 Período de retenção: ${retentionDays} dias`);
    console.log(`⏰ Limpeza automática: a cada 24 horas`);
  }

  /**
   * Para o serviço de limpeza automática
   */
  static stop(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
      console.log('🛑 Serviço de limpeza de logs parado');
    }
  }

  /**
   * Obtém estatísticas sobre a limpeza de logs
   */
  static async getCleanupStats(): Promise<{
    retentionDays: number;
    totalLogs: number;
    logsToDelete: number;
    oldestLogDate: Date | null;
    cutoffDate: Date;
  }> {
    const retentionDays = this.getRetentionDays();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const [totalLogs, logsToDelete, oldestLog] = await Promise.all([
      prisma.systemLog.count(),
      prisma.systemLog.count({
        where: {
          timestamp: {
            lt: cutoffDate
          }
        }
      }),
      prisma.systemLog.findFirst({
        orderBy: {
          timestamp: 'asc'
        },
        select: {
          timestamp: true
        }
      })
    ]);

    return {
      retentionDays,
      totalLogs,
      logsToDelete,
      oldestLogDate: oldestLog?.timestamp || null,
      cutoffDate
    };
  }
}

export default LogCleanupService;

