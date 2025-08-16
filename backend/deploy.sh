#!/bin/bash

# Script de Deploy para Google Cloud
# UniSafe Backend

set -e

echo "🚀 Iniciando deploy do UniSafe Backend para Google Cloud..."

# Verificar se gcloud está instalado
if ! command -v gcloud &> /dev/null; then
    echo "❌ Google Cloud SDK não encontrado. Instale em: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Verificar se está logado
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
    echo "❌ Não está logado no Google Cloud. Execute: gcloud auth login"
    exit 1
fi

# Configurações
PROJECT_ID=$(gcloud config get-value project)
REGION="us-central1"
SERVICE_NAME="unisafe-backend"
IMAGE_NAME="gcr.io/$PROJECT_ID/$SERVICE_NAME"

echo "📋 Configurações:"
echo "   Projeto: $PROJECT_ID"
echo "   Região: $REGION"
echo "   Serviço: $SERVICE_NAME"
echo "   Imagem: $IMAGE_NAME"

# Confirmar deploy
read -p "🤔 Continuar com o deploy? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Deploy cancelado"
    exit 1
fi

echo "🔨 Construindo imagem Docker..."
docker build -t $IMAGE_NAME .

echo "📤 Enviando imagem para Container Registry..."
docker push $IMAGE_NAME

echo "🚀 Deployando no Cloud Run..."
gcloud run deploy $SERVICE_NAME \
    --image $IMAGE_NAME \
    --platform managed \
    --region $REGION \
    --allow-unauthenticated \
    --port 3000 \
    --memory 1Gi \
    --cpu 1 \
    --max-instances 10 \
    --set-env-vars NODE_ENV=production

echo "✅ Deploy concluído com sucesso!"
echo "🌐 URL do serviço:"
gcloud run services describe $SERVICE_NAME --region $REGION --format="value(status.url)"

echo ""
echo "📊 Para ver logs: gcloud logs tail --service=$SERVICE_NAME --region=$REGION"
echo "🔧 Para atualizar: ./deploy.sh"
