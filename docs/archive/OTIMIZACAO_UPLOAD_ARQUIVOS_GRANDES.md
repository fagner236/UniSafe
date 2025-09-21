# Otimização de Upload para Arquivos Grandes - UniSafe

## 🚨 **PROBLEMA IDENTIFICADO**

### **Limite Atual: 10MB**
O sistema estava configurado com um limite de **10MB** para upload de arquivos, causando falhas na importação de arquivos maiores.

### **Causas do Problema:**
1. **Timeout muito baixo**: Frontend com timeout de apenas 10 segundos
2. **Limite de tamanho restritivo**: 10MB não é suficiente para planilhas grandes
3. **Processamento síncrono**: Arquivos grandes causavam travamento
4. **Limites de memória**: Express com limite de 10MB para JSON

## ✅ **SOLUÇÕES IMPLEMENTADAS**

### **1. Aumento de Timeout (Frontend)**
```typescript:frontend/src/config/environment.ts
// Antes: 10 segundos
requestTimeout: 10000

// Depois: 60 segundos
requestTimeout: 60000
```

### **2. Novo Sistema de Configuração (Backend)**
```typescript:backend/src/config/upload.ts
export const uploadConfig = {
  // Limite aumentado para 50MB
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '52428800'),
  
  // Timeouts otimizados
  requestTimeout: parseInt(process.env.REQUEST_TIMEOUT || '120000'), // 2 min
  uploadTimeout: parseInt(process.env.UPLOAD_TIMEOUT || '180000'), // 3 min
  processingTimeout: parseInt(process.env.PROCESSING_TIMEOUT || '300000'), // 5 min
  
  // Processamento em lotes
  batchSize: parseInt(process.env.BATCH_SIZE || '1000'),
  maxConcurrentBatches: parseInt(process.env.MAX_CONCURRENT_BATCHES || '3')
};
```

### **3. Processamento Inteligente em Lotes**
```typescript:backend/src/controllers/uploadController.ts
// Determina automaticamente se deve usar processamento em lotes
const batchConfig = getBatchConfig(fileStats.size, data.length);

if (batchConfig.useBatches) {
  // Processamento em lotes para arquivos grandes
  for (let i = 0; i < data.length; i += batchConfig.batchSize) {
    const batch = data.slice(i, i + batchConfig.batchSize);
    // Processa lote por lote
  }
} else {
  // Processamento normal para arquivos pequenos
}
```

### **4. Limites de Express Aumentados**
```typescript:backend/src/index.ts
// Antes: 10MB
app.use(express.json({ limit: '10mb' }));

// Depois: 50MB
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
```

## 📊 **NOVOS LIMITES CONFIGURADOS**

### **Tamanho de Arquivo:**
- **Antes**: 10MB (10.485.760 bytes)
- **Depois**: 50MB (52.428.800 bytes)

### **Timeouts:**
- **Frontend**: 60 segundos (upload)
- **Backend**: 2-5 minutos (processamento)

### **Processamento:**
- **Arquivos pequenos**: Processamento normal
- **Arquivos grandes**: Processamento em lotes de 1000 registros

## 🔧 **CONFIGURAÇÕES DE AMBIENTE**

### **Desenvolvimento (.env)**
```bash
# File Upload - OTIMIZADO PARA ARQUIVOS GRANDES
MAX_FILE_SIZE=52428800
REQUEST_TIMEOUT=120000
UPLOAD_TIMEOUT=180000
PROCESSING_TIMEOUT=300000
BATCH_SIZE=1000
MAX_CONCURRENT_BATCHES=3
```

### **Produção (Google Cloud)**
```bash
# File Upload - OTIMIZADO PARA ARQUIVOS GRANDES
MAX_FILE_SIZE=52428800
REQUEST_TIMEOUT=120000
UPLOAD_TIMEOUT=180000
PROCESSING_TIMEOUT=300000
BATCH_SIZE=1000
MAX_CONCURRENT_BATCHES=3
```

## 📈 **MELHORIAS DE PERFORMANCE**

### **1. Processamento em Lotes**
- **Arquivos > 5MB ou > 5000 registros**: Processamento em lotes
- **Lotes de 1000 registros**: Evita sobrecarga de memória
- **Logs de progresso**: Acompanhamento em tempo real

### **2. Estimativa de Tempo**
```typescript
// Calcula tempo estimado baseado no tamanho e número de registros
export const estimateProcessingTime = (fileSize: number, recordCount: number): number => {
  const sizeTime = fileSize / 1024 / 1024; // 1MB = ~1 segundo
  const recordTime = recordCount / 1000 * 2; // 1000 registros = ~2 segundos
  return Math.max(sizeTime, recordTime) * 1000;
};
```

### **3. Validação Inteligente**
- **Arquivos pequenos**: Validação completa
- **Arquivos grandes**: Validação em lotes com progresso

## 🚀 **COMO TESTAR**

### **1. Arquivo Pequeno (< 5MB)**
```bash
# Deve funcionar normalmente
# Processamento síncrono
# Tempo estimado: < 30 segundos
```

### **2. Arquivo Médio (5-20MB)**
```bash
# Deve usar processamento em lotes
# Logs de progresso por lote
# Tempo estimado: 1-3 minutos
```

### **3. Arquivo Grande (20-50MB)**
```bash
# Processamento em lotes otimizado
# Logs detalhados de progresso
# Tempo estimado: 3-8 minutos
```

## 📋 **LOGS DE PROCESSAMENTO**

### **Arquivo Pequeno:**
```
🔄 === INICIANDO PROCESSAMENTO DE ARQUIVO ===
📖 Lendo arquivo...
📊 Total de registros encontrados: 1500
⚙️ Configuração de processamento: { useBatches: false, batchSize: 1500, maxConcurrent: 1, estimatedTime: 3s }
🔄 Processando normalmente...
✅ Arquivo processado: 1500 registros válidos, 0 erros
```

### **Arquivo Grande:**
```
🔄 === INICIANDO PROCESSAMENTO DE ARQUIVO ===
📖 Lendo arquivo...
📊 Total de registros encontrados: 15000
⚙️ Configuração de processamento: { useBatches: true, batchSize: 1000, maxConcurrent: 3, estimatedTime: 30s }
🔄 Processando em lotes...
📦 Processando lote 1/15
✅ Lote processado: 1000 registros válidos, 0 erros
📦 Processando lote 2/15
✅ Lote processado: 2000 registros válidos, 0 erros
...
✅ Arquivo processado: 15000 registros válidos, 0 erros
```

## 🔍 **MONITORAMENTO E DEBUG**

### **1. Logs Detalhados**
- Status de cada etapa do processamento
- Progresso de lotes para arquivos grandes
- Tempo estimado vs. tempo real

### **2. Métricas de Performance**
- Tamanho do arquivo vs. tempo de processamento
- Número de registros vs. tempo de processamento
- Uso de memória durante processamento

### **3. Tratamento de Erros**
- Erros por lote (para arquivos grandes)
- Rollback automático em caso de falha
- Relatório detalhado de problemas

## ⚠️ **CONSIDERAÇÕES IMPORTANTES**

### **1. Memória do Servidor**
- **Arquivos > 50MB**: Podem causar problemas de memória
- **Registros > 100.000**: Considerar processamento assíncrono completo

### **2. Timeout do Cliente**
- **Frontend**: 60 segundos para upload
- **Backend**: 5 minutos para processamento
- **Usuário**: Deve aguardar o processamento completo

### **3. Banco de Dados**
- **Transações longas**: Podem causar locks
- **Índices**: Importante para performance de consultas
- **Backup**: Recomendado antes de importações grandes

## 🎯 **PRÓXIMAS MELHORIAS**

### **1. Processamento Assíncrono Completo**
- Queue de processamento (Redis/Bull)
- Notificações por email/SMS
- Interface de acompanhamento em tempo real

### **2. Compressão de Arquivos**
- Suporte a arquivos .zip/.rar
- Descompressão automática
- Validação de conteúdo

### **3. Validação Avançada**
- Regras de negócio customizáveis
- Validação cruzada entre campos
- Relatórios de qualidade de dados

## 📞 **SUPORTE**

Para dúvidas ou problemas com arquivos grandes:
1. Verificar logs do backend
2. Confirmar tamanho do arquivo
3. Verificar configurações de ambiente
4. Consultar documentação de troubleshooting

---

**Data da Implementação**: Dezembro 2024  
**Versão**: 1.8.3  
**Status**: ✅ Implementado e Testado
