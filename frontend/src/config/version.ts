// 📋 CONFIGURAÇÃO DE VERSÃO DO SISTEMA UNISAFE
// Este arquivo controla a versão do sistema de forma centralizada

export const APP_VERSION = '1.2.0';
export const APP_NAME = 'UniSafe';
export const APP_DESCRIPTION = 'Sistema de Gestão de Empregados Filiados';

// Informações adicionais da versão
export const VERSION_INFO = {
  version: APP_VERSION,
  name: APP_NAME,
  description: APP_DESCRIPTION,
  buildDate: new Date().toISOString(),
  environment: 'development' // Ambiente fixo para frontend
};

// Função para obter a versão formatada
export const getVersionString = (): string => {
  return `v${APP_VERSION}`;
};

// Função para obter informações completas da versão
export const getVersionInfo = () => {
  return {
    ...VERSION_INFO,
    displayVersion: getVersionString()
  };
};

export default VERSION_INFO;
