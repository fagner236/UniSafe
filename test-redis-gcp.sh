#!/bin/bash

# 🧪 Teste de Conectividade Redis Cloud no GCP
echo "🔍 Teste de Conectividade Redis Cloud no GCP"
echo "📅 Data/Hora: $(date)"
echo "🌐 Projeto: $(gcloud config get-value project)"
echo ""

# Configurações Redis Cloud
REDIS_HOST="redis-16285.c228.us-central1-1.gce.redns.redis-cloud.com"
REDIS_PORT="16285"

echo "🔧 Configurações Redis Cloud:"
echo "   Host: $REDIS_HOST"
echo "   Porta: $REDIS_PORT"
echo ""

# Teste 1: Conectividade de rede básica
echo "🌐 Teste 1: Conectividade de rede"
if timeout 10 bash -c "</dev/tcp/$REDIS_HOST/$REDIS_PORT"; then
    echo "✅ Porta $REDIS_PORT está acessível"
else
    echo "❌ Porta $REDIS_PORT não está acessível"
    echo "🔍 Verificando conectividade geral..."
    ping -c 3 $REDIS_HOST
fi

echo ""

# Teste 2: DNS Resolution
echo "🔍 Teste 2: Resolução DNS"
nslookup $REDIS_HOST

echo ""

# Teste 3: Informações do projeto
echo "📊 Teste 3: Informações do Projeto"
echo "Projeto atual: $(gcloud config get-value project)"

echo ""
echo "🏁 Teste concluído"
