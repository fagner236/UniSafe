/**
 * Sistema de logging condicional para o frontend
 * Em produção, os logs são desabilitados para melhor performance
 */

import config from '@/config/environment';

const logLevel = config.logLevel;

// Função auxiliar para verificar se o nível de log está habilitado
const shouldLog = (level: string): boolean => {
  if (level === 'error') return true; // Erros sempre são logados
  if (logLevel === 'debug') return true;
  if (logLevel === 'info' && ['info', 'warn', 'error'].includes(level)) return true;
  if (logLevel === 'warn' && ['warn', 'error'].includes(level)) return true;
  return false;
};

export const logger = {
  log: (...args: any[]) => {
    if (shouldLog('info')) {
      console.log(...args);
    }
  },
  
  error: (...args: any[]) => {
    // Erros sempre são logados, mesmo em produção
    console.error(...args);
  },
  
  warn: (...args: any[]) => {
    if (shouldLog('warn')) {
      console.warn(...args);
    }
  },
  
  info: (...args: any[]) => {
    if (shouldLog('info')) {
      console.info(...args);
    }
  },
  
  debug: (...args: any[]) => {
    if (shouldLog('debug')) {
      console.debug(...args);
    }
  }
};

export default logger;

