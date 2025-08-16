// Configuração de ambiente
export const config = {
  // URL da API - pode ser configurada via variável de ambiente
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  
  // Timeout das requisições
  requestTimeout: 10000,
  
  // Configurações de desenvolvimento
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
};

export default config;
