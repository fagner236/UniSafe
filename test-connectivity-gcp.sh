#!/bin/bash

# 🧪 Teste de Conectividade Redis Cloud no GCP
# Script simplificado para Google Cloud Shell

echo "🔍 Teste de Conectividade Redis Cloud no GCP"
echo "📅 Data/Hora: $(date)"
echo "🌐 Projeto: $(gcloud config get-value project)"
echo ""

# Teste 1: Conectividade de rede básica
echo "🌐 Teste 1: Conectividade de rede"
echo "Testando conectividade com Redis Cloud..."

if timeout 10 bash -c "</dev/tcp/redis-16285.c228.us-central1-1.gce.redns.redis-cloud.com/16285"; then
    echo "✅ Porta 16285 está acessível"
else
    echo "❌ Porta 16285 não está acessível"
    echo "🔍 Verificando conectividade geral..."
    ping -c 3 redis-16285.c228.us-central1-1.gce.redns.redis-cloud.com
fi

echo ""

# Teste 2: DNS Resolution
echo "🔍 Teste 2: Resolução DNS"
echo "Resolvendo hostname Redis Cloud..."
nslookup redis-16285.c228.us-central1-1.gce.redns.redis-cloud.com

echo ""

# Teste 3: Telnet (se disponível)
echo "🔗 Teste 3: Conexão TCP"
echo "Testando conexão TCP com Redis Cloud..."
if command -v telnet &> /dev/null; then
    echo "Tentando conexão telnet (timeout 5s)..."
    timeout 5 telnet redis-16285.c228.us-central1-1.gce.redns.redis-cloud.com 16285 || echo "Telnet timeout ou falhou"
else
    echo "Telnet não disponível, usando nc (netcat)..."
    if command -v nc &> /dev/null; then
        timeout 5 nc -zv redis-16285.c228.us-central1-1.gce.redns.redis-cloud.com 16285 || echo "Netcat timeout ou falhou"
    else
        echo "Netcat não disponível"
    fi
fi

echo ""

# Teste 4: Verificar APIs do GCP
echo "🔧 Teste 4: APIs do GCP"
echo "Verificando APIs habilitadas..."
gcloud services list --enabled --filter="name:redis" --format="table(name,title)"

echo ""

# Teste 5: Informações do projeto
echo "📊 Teste 5: Informações do Projeto"
echo "Projeto atual: $(gcloud config get-value project)"
echo "Região padrão: $(gcloud config get-value compute/region)"
echo "Zona padrão: $(gcloud config get-value compute/zone)"

echo ""

# Teste 6: Verificar conectividade externa
echo "🌍 Teste 6: Conectividade Externa"
echo "Testando conectividade geral..."
ping -c 2 8.8.8.8 > /dev/null 2>&1 && echo "✅ Conectividade externa OK" || echo "❌ Problema de conectividade externa"

echo ""
echo "🏁 Teste de conectividade concluído"
echo ""
echo "📋 Interpretação dos resultados:"
echo "   ✅ Se todos os testes passaram: Redis Cloud está acessível"
echo "   ❌ Se algum teste falhou: Verificar configurações de rede"
echo ""
echo "🚀 Próximos passos:"
echo "   1. Se conectividade OK: Prosseguir com deploy"
echo "   2. Se falhou: Verificar firewall/VPC do projeto"
echo "   3. Testar deploy em ambiente de desenvolvimento primeiro"
