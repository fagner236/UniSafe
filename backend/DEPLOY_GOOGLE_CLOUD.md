# 🚀 Guia de Deploy no Google Cloud - UniSafe Backend

## 📋 Pré-requisitos

### 1. **Google Cloud SDK**
```bash
# Instalar Google Cloud SDK
# https://cloud.google.com/sdk/docs/install

# Verificar instalação
gcloud version

# Fazer login
gcloud auth login
```

### 2. **Docker**
```bash
# Instalar Docker Desktop
# https://www.docker.com/products/docker-desktop

# Verificar instalação
docker --version
```

### 3. **Configurar Projeto**
```bash
# Listar projetos
gcloud projects list

# Definir projeto ativo
gcloud config set project SEU_PROJETO_ID

# Habilitar APIs necessárias
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
gcloud services enable sqladmin.googleapis.com
```

## 🔧 Configuração

### 1. **Variáveis de Ambiente**
Edite o arquivo `env.production` com suas configurações:

```env
# Database (Cloud SQL)
DATABASE_URL="mysql://username:password@/database_name?host=/cloudsql/project:region:instance"

# JWT - CRÍTICO: Use uma chave forte!
JWT_SECRET="sua-chave-super-secreta-com-pelo-menos-64-caracteres"

# CORS - Seu domínio de produção
CORS_ORIGIN="https://seudominio.com"

# Google Cloud
GOOGLE_CLOUD_PROJECT="seu-projeto-id"
GOOGLE_CLOUD_REGION="us-central1"
```

### 2. **Configurar Cloud SQL (MySQL)**
```bash
# Criar instância MySQL
gcloud sql instances create unisafe-mysql \
    --database-version=MYSQL_8_0 \
    --tier=db-f1-micro \
    --region=us-central1 \
    --root-password=SUA_SENHA_ROOT

# Criar banco de dados
gcloud sql databases create unisafe_db \
    --instance=unisafe-mysql

# Criar usuário
gcloud sql users create unisafe_user \
    --instance=unisafe-mysql \
    --password=SUA_SENHA_USUARIO

# Obter connection name
gcloud sql instances describe unisafe-mysql \
    --format="value(connectionName)"
```

## 🚀 Deploy

### **Opção 1: Deploy Automatizado (Recomendado)**
```bash
# Dar permissão de execução
chmod +x deploy.sh

# Executar deploy
./deploy.sh
```

### **Opção 2: Deploy Manual**
```bash
# 1. Build da imagem
docker build -t gcr.io/SEU_PROJETO_ID/unisafe-backend .

# 2. Push para Container Registry
docker push gcr.io/SEU_PROJETO_ID/unisafe-backend

# 3. Deploy no Cloud Run
gcloud run deploy unisafe-backend \
    --image gcr.io/SEU_PROJETO_ID/unisafe-backend \
    --platform managed \
    --region us-central1 \
    --allow-unauthenticated \
    --port 3000 \
    --memory 1Gi \
    --cpu 1 \
    --max-instances 10
```

### **Opção 3: Cloud Build (CI/CD)**
```bash
# Configurar trigger no Cloud Build
# Ou executar manualmente:
gcloud builds submit --config cloudbuild.yaml
```

## 🔍 Verificação

### 1. **Status do Serviço**
```bash
# Ver status
gcloud run services describe unisafe-backend \
    --region=us-central1

# Ver logs
gcloud logs tail --service=unisafe-backend \
    --region=us-central1
```

### 2. **Teste de Funcionamento**
```bash
# Obter URL do serviço
SERVICE_URL=$(gcloud run services describe unisafe-backend \
    --region=us-central1 \
    --format="value(status.url)")

# Testar health check
curl $SERVICE_URL/api/health

# Testar autenticação
curl -X POST $SERVICE_URL/api/auth/register \
    -H "Content-Type: application/json" \
    -d '{"name":"Teste","email":"teste@teste.com","password":"Teste123!"}'
```

## 🔒 Segurança

### 1. **Configurar IAM**
```bash
# Criar service account para Cloud Run
gcloud iam service-accounts create unisafe-runner \
    --display-name="UniSafe Cloud Run Service Account"

# Dar permissões necessárias
gcloud projects add-iam-policy-binding SEU_PROJETO_ID \
    --member="serviceAccount:unisafe-runner@SEU_PROJETO_ID.iam.gserviceaccount.com" \
    --role="roles/cloudsql.client"
```

### 2. **Configurar VPC Connector (se necessário)**
```bash
# Criar VPC connector para acessar Cloud SQL
gcloud compute networks vpc-access connectors create unisafe-connector \
    --region=us-central1 \
    --range=10.8.0.0/28
```

## 📊 Monitoramento

### 1. **Cloud Monitoring**
```bash
# Habilitar Cloud Monitoring
gcloud services enable monitoring.googleapis.com

# Ver métricas
gcloud monitoring metrics list --filter="metric.type:run.googleapis.com"
```

### 2. **Logs Estruturados**
```bash
# Ver logs em tempo real
gcloud logs tail --service=unisafe-backend \
    --region=us-central1 \
    --format="table(timestamp,severity,textPayload)"
```

## 🔄 Atualizações

### **Deploy de Nova Versão**
```bash
# Atualizar código
git pull origin main

# Fazer deploy
./deploy.sh
```

### **Rollback**
```bash
# Listar revisões
gcloud run revisions list --service=unisafe-backend \
    --region=us-central1

# Fazer rollback
gcloud run services update-traffic unisafe-backend \
    --to-revisions=REVISION_NAME=100 \
    --region=us-central1
```

## 🚨 Troubleshooting

### **Problemas Comuns**

1. **Erro de conexão com banco**
   - Verificar DATABASE_URL
   - Verificar permissões do Cloud SQL
   - Verificar VPC connector

2. **Erro de autenticação**
   - Verificar JWT_SECRET
   - Verificar variáveis de ambiente

3. **Erro de CORS**
   - Verificar CORS_ORIGIN
   - Verificar configuração do frontend

### **Comandos Úteis**
```bash
# Ver variáveis de ambiente
gcloud run services describe unisafe-backend \
    --region=us-central1 \
    --format="value(spec.template.spec.containers[0].env[].name,spec.template.spec.containers[0].env[].value)"

# Ver logs de erro
gcloud logs read --filter="resource.type=cloud_run_revision AND severity>=ERROR" \
    --limit=50
```

## 📞 Suporte

Para problemas específicos:
1. Verificar logs do Cloud Run
2. Verificar status do Cloud SQL
3. Verificar configurações de IAM
4. Consultar documentação do Google Cloud

---

**⚠️ IMPORTANTE**: Sempre teste em ambiente de desenvolvimento antes de fazer deploy em produção!
