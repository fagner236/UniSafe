#!/bin/bash

# 🚀 UniSafe - Script de Deploy para Produção
# Versão: 1.9.4
# Data: 16 de Novembro de 2025

echo "🚀 Iniciando deploy do UniSafe v1.9.4 para produção..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para log
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERRO]${NC} $1"
    exit 1
}

success() {
    echo -e "${GREEN}[SUCESSO]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[AVISO]${NC} $1"
}

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    error "Execute este script no diretório raiz do projeto UniSafe"
fi

log "📋 Verificando pré-requisitos..."

# Verificar se o gcloud está instalado
if ! command -v gcloud &> /dev/null; then
    error "Google Cloud CLI não encontrado. Instale em: https://cloud.google.com/sdk/docs/install"
fi

# Verificar se estamos logados no gcloud
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
    error "Não está logado no Google Cloud. Execute: gcloud auth login"
fi

# Verificar se o projeto está configurado
PROJECT_ID=$(gcloud config get-value project)
if [ -z "$PROJECT_ID" ]; then
    error "Projeto Google Cloud não configurado. Execute: gcloud config set project SEU_PROJECT_ID"
fi

log "📦 Compilando frontend..."
cd frontend
if ! npm run build; then
    error "Falha na compilação do frontend"
fi
cd ..

log "📦 Compilando backend..."
cd backend
if ! npm run build; then
    error "Falha na compilação do backend"
fi
cd ..

log "🔍 Verificando builds..."
if [ ! -d "frontend/dist" ]; then
    error "Diretório frontend/dist não encontrado"
fi

if [ ! -d "backend/dist" ]; then
    error "Diretório backend/dist não encontrado"
fi

log "🚀 Fazendo deploy do backend..."
cd backend
if ! gcloud app deploy app.yaml --quiet; then
    error "Falha no deploy do backend"
fi
cd ..

log "🚀 Fazendo deploy do frontend..."
cd frontend
if ! gcloud app deploy app.yaml --quiet; then
    error "Falha no deploy do frontend"
fi
cd ..

log "🔍 Verificando deploys..."
BACKEND_URL="https://unisafe-api-dot-${PROJECT_ID}.ue.r.appspot.com"
FRONTEND_URL="https://unisafe-dot-${PROJECT_ID}.ue.r.appspot.com"

log "🌐 URLs de produção:"
log "   Frontend: $FRONTEND_URL"
log "   Backend:  $BACKEND_URL"

log "✅ Deploy concluído com sucesso!"
log "📊 Versão: 1.9.4"
log "📅 Data: $(date +'%d/%m/%Y %H:%M:%S')"

success "🎉 UniSafe v1.9.4 está online em produção!"

