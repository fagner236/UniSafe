// Configuração de ambiente
export const config = {
  // URL da API - pode ser configurada via variável de ambiente
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  
  // Timeout das requisições - aumentado para arquivos grandes
  requestTimeout: 60000, // 60 segundos
  
  // Configurações de desenvolvimento
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
};

export default config;
