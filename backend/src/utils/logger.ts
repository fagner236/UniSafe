import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface LogData {
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG' | 'AUDIT';
  category: 'AUTH' | 'USER' | 'COMPANY' | 'UPLOAD' | 'SYSTEM' | 'SECURITY';
  message: string;
  userId?: string;
  userEmail?: string;
  userProfile?: string;
  companyId?: string;
  companyName?: string;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  action?: string;
  resource?: string;
  details?: any;
}

/**
 * Utilitário para gerar logs do sistema
 * Todos os logs são armazenados no banco de dados para auditoria
 */
export class SystemLogger {
  /**
   * Log de informação geral
   */
  static async info(data: Omit<LogData, 'level'>) {
    return this.log({ ...data, level: 'INFO' });
  }

  /**
   * Log de aviso
   */
  static async warn(data: Omit<LogData, 'level'>) {
    return this.log({ ...data, level: 'WARN' });
  }

  /**
   * Log de erro
   */
  static async error(data: Omit<LogData, 'level'>) {
    return this.log({ ...data, level: 'ERROR' });
  }

  /**
   * Log de debug
   */
  static async debug(data: Omit<LogData, 'level'>) {
    return this.log({ ...data, level: 'DEBUG' });
  }

  /**
   * Log de auditoria (ações importantes do usuário)
   */
  static async audit(data: Omit<LogData, 'level'>) {
    return this.log({ ...data, level: 'AUDIT' });
  }

  /**
   * Método principal para criar logs
   */
  static async log(data: LogData) {
    try {
      const log = await prisma.systemLog.create({
        data: {
          level: data.level,
          category: data.category,
          message: data.message,
          userId: data.userId,
          userEmail: data.userEmail,
          userProfile: data.userProfile,
          companyId: data.companyId,
          companyName: data.companyName,
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
          sessionId: data.sessionId,
          action: data.action,
          resource: data.resource,
          details: data.details
        }
      });

      // Log no console para desenvolvimento
      if (process.env.NODE_ENV === 'development') {
        const timestamp = new Date().toISOString();
        const level = data.level.padEnd(5);
        const category = data.category.padEnd(8);
        console.log(`[${timestamp}] ${level} [${category}] ${data.message}`);
        
        if (data.details) {
          console.log('  Details:', JSON.stringify(data.details, null, 2));
        }
      }

      return log;
    } catch (error) {
      // Em caso de erro ao salvar o log, apenas logar no console
      console.error('❌ Erro ao salvar log do sistema:', error);
      console.error('❌ Dados do log que falhou:', data);
    }
  }

  /**
   * Log de autenticação
   */
  static async auth(data: {
    message: string;
    userId?: string;
    userEmail?: string;
    userProfile?: string;
    companyId?: string;
    companyName?: string;
    ipAddress?: string;
    userAgent?: string;
    sessionId?: string;
    action?: string;
    details?: any;
  }) {
    return this.audit({
      ...data,
      category: 'AUTH'
    });
  }

  /**
   * Log de ações do usuário
   */
  static async userAction(data: {
    message: string;
    userId: string;
    userEmail: string;
    userProfile: string;
    companyId?: string;
    companyName?: string;
    ipAddress?: string;
    userAgent?: string;
    sessionId?: string;
    action: string;
    resource?: string;
    details?: any;
  }) {
    return this.audit({
      ...data,
      category: 'USER'
    });
  }

  /**
   * Log de ações relacionadas a empresas
   */
  static async companyAction(data: {
    message: string;
    userId?: string;
    userEmail?: string;
    userProfile?: string;
    companyId: string;
    companyName: string;
    ipAddress?: string;
    userAgent?: string;
    sessionId?: string;
    action: string;
    resource?: string;
    details?: any;
  }) {
    return this.audit({
      ...data,
      category: 'COMPANY'
    });
  }

  /**
   * Log de uploads
   */
  static async upload(data: {
    message: string;
    userId: string;
    userEmail: string;
    userProfile: string;
    companyId?: string;
    companyName?: string;
    ipAddress?: string;
    userAgent?: string;
    sessionId?: string;
    action: string;
    resource?: string;
    details?: any;
  }) {
    return this.info({
      ...data,
      category: 'UPLOAD'
    });
  }

  /**
   * Log de ações do sistema
   */
  static async system(data: {
    message: string;
    userId?: string;
    userEmail?: string;
    userProfile?: string;
    companyId?: string;
    companyName?: string;
    ipAddress?: string;
    userAgent?: string;
    sessionId?: string;
    action?: string;
    resource?: string;
    details?: any;
  }) {
    return this.info({
      ...data,
      category: 'SYSTEM'
    });
  }

  /**
   * Log de eventos de segurança
   */
  static async security(data: {
    message: string;
    userId?: string;
    userEmail?: string;
    userProfile?: string;
    companyId?: string;
    companyName?: string;
    ipAddress?: string;
    userAgent?: string;
    sessionId?: string;
    action: string;
    resource?: string;
    details?: any;
  }) {
    return this.warn({
      ...data,
      category: 'SECURITY'
    });
  }
}

export default SystemLogger;
