// Configuração de ambiente
export const config = {
  // URL da API - detecta automaticamente o ambiente
  apiUrl: import.meta.env.VITE_API_URL || 
    (import.meta.env.PROD 
      ? 'https://unisafe-api-dot-evia-app.ue.r.appspot.com/api'
      : 'http://localhost:3000/api'
    ),
  
  // Timeout das requisições - aumentado para arquivos grandes
  requestTimeout: 60000, // 60 segundos
  
  // Configurações de ambiente
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  mode: import.meta.env.MODE,
  
  // Configurações de upload
  maxFileSize: 50 * 1024 * 1024, // 50MB
  allowedFileTypes: ['.xlsx', '.xls', '.csv'],
  
  // Configurações de cache
  cacheTimeout: 5 * 60 * 1000, // 5 minutos
  
  // Configurações de paginação
  defaultPageSize: 20,
  maxPageSize: 100,
  
  // Configurações de logs
  logLevel: import.meta.env.DEV ? 'debug' : 'info',
  
  // Configurações de segurança
  tokenRefreshThreshold: 5 * 60 * 1000, // 5 minutos antes do vencimento
};

export default config;
