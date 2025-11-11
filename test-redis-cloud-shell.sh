#!/bin/bash

# 🧪 Teste Redis Cloud para Google Cloud Shell
echo "🔍 Teste Redis Cloud - Google Cloud Shell"
echo "📅 Data/Hora: $(date)"
echo "🌐 Projeto: $(gcloud config get-value project)"
echo ""

# Instalar Node.js se necessário
if ! command -v node &> /dev/null; then
    echo "📦 Instalando Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Instalar Redis client
if ! npm list redis &> /dev/null; then
    echo "📦 Instalando cliente Redis..."
    npm install redis
fi

# Criar teste Node.js
cat > test-redis.js << 'NODEJS'
const { createClient } = require('redis');

const redisConfig = {
  username: 'default',
  password: 'aM9sEh4J97B2yQy8eTemqLT2i5UtT63x',
  socket: {
    host: 'redis-16285.c228.us-central1-1.gce.redns.redis-cloud.com',
    port: 16285,
    connectTimeout: 15000,
  },
  database: 0,
};

const redisClient = createClient(redisConfig);

redisClient.on('connect', () => {
  console.log('✅ Redis Cloud conectado com sucesso!');
});

redisClient.on('error', (err) => {
  console.log('❌ Erro Redis Cloud:', err.message);
});

redisClient.on('ready', () => {
  console.log('🚀 Redis Cloud pronto para uso!');
});

async function testConnection() {
  try {
    console.log('🔗 Conectando ao Redis Cloud...');
    await redisClient.connect();
    
    console.log('📝 Testando escrita/leitura...');
    await redisClient.set('test:gcp:shell', 'Redis Cloud funcionando no Cloud Shell!', { EX: 60 });
    const value = await redisClient.get('test:gcp:shell');
    console.log('✅ Valor recuperado:', value);
    
    console.log('🧹 Limpando dados de teste...');
    await redisClient.del('test:gcp:shell');
    
    console.log('🎉 Teste concluído com sucesso!');
    
  } catch (error) {
    console.log('❌ Erro:', error.message);
  } finally {
    await redisClient.disconnect();
    console.log('🔌 Desconectado');
  }
}

testConnection();
NODEJS

echo "🚀 Executando teste Redis Cloud..."
node test-redis.js

# Limpeza
rm -f test-redis.js

echo ""
echo "🏁 Teste finalizado"
