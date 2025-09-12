// Configuração específica para upload de arquivos
export const uploadConfig = {
  // Limites de tamanho de arquivo
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '52428800'), // 50MB por padrão
  
  // Timeouts otimizados para arquivos grandes
  requestTimeout: parseInt(process.env.REQUEST_TIMEOUT || '120000'), // 2 minutos
  uploadTimeout: parseInt(process.env.UPLOAD_TIMEOUT || '180000'), // 3 minutos
  processingTimeout: parseInt(process.env.PROCESSING_TIMEOUT || '300000'), // 5 minutos
  
  // Configurações de processamento
  batchSize: parseInt(process.env.BATCH_SIZE || '1000'), // Processar em lotes de 1000 registros
  maxConcurrentBatches: parseInt(process.env.MAX_CONCURRENT_BATCHES || '3'), // Máximo 3 lotes simultâneos
  
  // Tipos de arquivo permitidos
  allowedTypes: (process.env.ALLOWED_FILE_TYPES || 'xlsx,xls,csv').split(','),
  
  // Configurações de memória
  maxMemoryUsage: parseInt(process.env.MAX_MEMORY_USAGE || '512'), // 512MB
  
  // Logs detalhados para arquivos grandes
  enableDetailedLogs: process.env.ENABLE_DETAILED_LOGS === 'true',
  
  // Validação de dados
  enableDataValidation: process.env.ENABLE_DATA_VALIDATION !== 'false', // Habilitado por padrão
  
  // Processamento assíncrono
  enableAsyncProcessing: process.env.ENABLE_ASYNC_PROCESSING !== 'false', // Habilitado por padrão
};

// Função para validar se o arquivo pode ser processado
export const canProcessFile = (fileSize: number): { canProcess: boolean; reason?: string } => {
  if (fileSize > uploadConfig.maxFileSize) {
    return {
      canProcess: false,
      reason: `Arquivo muito grande. Tamanho máximo permitido: ${formatFileSize(uploadConfig.maxFileSize)}`
    };
  }
  
  return { canProcess: true };
};

// Função para formatar tamanho de arquivo
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Função para calcular tempo estimado de processamento
export const estimateProcessingTime = (fileSize: number, recordCount: number): number => {
  // Estimativa baseada em experiência: 1MB = ~1 segundo, 1000 registros = ~2 segundos
  const sizeTime = fileSize / 1024 / 1024; // Tempo baseado no tamanho
  const recordTime = recordCount / 1000 * 2; // Tempo baseado no número de registros
  
  return Math.max(sizeTime, recordTime) * 1000; // Retorna em milissegundos
};

// Função para verificar se o processamento deve ser feito em lotes
export const shouldUseBatchProcessing = (fileSize: number, recordCount: number): boolean => {
  return fileSize > 5 * 1024 * 1024 || recordCount > 5000; // 5MB ou 5000 registros
};

// Configurações de lote para processamento
export const getBatchConfig = (fileSize: number, recordCount: number) => {
  const useBatches = shouldUseBatchProcessing(fileSize, recordCount);
  
  return {
    useBatches,
    batchSize: useBatches ? uploadConfig.batchSize : recordCount,
    maxConcurrent: useBatches ? uploadConfig.maxConcurrentBatches : 1,
    estimatedTime: estimateProcessingTime(fileSize, recordCount)
  };
};
