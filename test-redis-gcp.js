// Teste de Conexão Redis Cloud no GCP
// Este script pode ser executado no Google Cloud Shell

const { createClient } = require('redis');

console.log('🔍 Testando conexão Redis Cloud no GCP...');
console.log('📅 Data/Hora:', new Date().toISOString());

// Configurações Redis Cloud
const redisConfig = {
  username: 'default',
  password: 'aM9sEh4J97B2yQy8eTemqLT2i5UtT63x',
  socket: {
    host: 'redis-16285.c228.us-central1-1.gce.redns.redis-cloud.com',
    port: 16285,
    connectTimeout: 15000,
    commandTimeout: 10000,
  },
  database: 0,
};

console.log('🔧 Configurações:');
console.log('   Host:', redisConfig.socket.host);
console.log('   Porta:', redisConfig.socket.port);
console.log('   Usuário:', redisConfig.username);
console.log('   Database:', redisConfig.database);

const redisClient = createClient(redisConfig);

// Event listeners
redisClient.on('connect', () => {
  console.log('✅ Redis Cloud conectado com sucesso!');
});

redisClient.on('error', (err) => {
  console.log('❌ Erro Redis Cloud:', err.message);
  console.log('🔍 Tipo do erro:', err.code);
});

redisClient.on('ready', () => {
  console.log('🚀 Redis Cloud pronto para uso!');
});

redisClient.on('end', () => {
  console.log('🔌 Conexão Redis Cloud encerrada');
});

async function testRedisConnection() {
  try {
    console.log('\n🔗 Iniciando teste de conexão...');
    
    // Conectar
    await redisClient.connect();
    console.log('✅ Conexão estabelecida');
    
    // Teste básico de escrita/leitura
    console.log('\n📝 Teste 1: Escrita e Leitura básica');
    await redisClient.set('test:gcp:connection', 'Redis Cloud funcionando no GCP!', { EX: 300 });
    const value1 = await redisClient.get('test:gcp:connection');
    console.log('   Valor salvo e recuperado:', value1);
    
    // Teste de cache JSON
    console.log('\n💾 Teste 2: Cache JSON');
    const testData = {
      message: 'Cache Redis Cloud ativo no GCP',
      timestamp: new Date().toISOString(),
      environment: 'Google Cloud Platform',
      version: '1.9.2'
    };
    
    await redisClient.set('cache:gcp:test', JSON.stringify(testData), { EX: 600 });
    const cachedData = await redisClient.get('cache:gcp:test');
    const parsedData = JSON.parse(cachedData || '{}');
    console.log('   Dados em cache:', parsedData);
    
    // Teste de informações do Redis
    console.log('\n📊 Teste 3: Informações do Redis');
    const info = await redisClient.info('server');
    const lines = info.split('\r\n').slice(0, 10);
    console.log('   Informações do servidor:');
    lines.forEach(line => {
      if (line && !line.startsWith('#')) {
        console.log('     ', line);
      }
    });
    
    // Teste de performance
    console.log('\n⚡ Teste 4: Performance');
    const startTime = Date.now();
    for (let i = 0; i < 10; i++) {
      await redisClient.set(`perf:test:${i}`, `valor-${i}`, { EX: 60 });
    }
    const endTime = Date.now();
    console.log(`   Tempo para 10 operações: ${endTime - startTime}ms`);
    
    // Limpeza
    console.log('\n🧹 Limpeza dos dados de teste');
    const keys = await redisClient.keys('test:*');
    const cacheKeys = await redisClient.keys('cache:gcp:*');
    const perfKeys = await redisClient.keys('perf:*');
    const allKeys = [...keys, ...cacheKeys, ...perfKeys];
    
    if (allKeys.length > 0) {
      await redisClient.del(allKeys);
      console.log(`   ${allKeys.length} chaves de teste removidas`);
    }
    
    console.log('\n✅ Todos os testes concluídos com sucesso!');
    console.log('🎉 Redis Cloud está funcionando perfeitamente no GCP!');
    
  } catch (error) {
    console.log('\n❌ Erro durante os testes:', error.message);
    console.log('🔍 Detalhes do erro:', error);
  } finally {
    try {
      await redisClient.disconnect();
      console.log('\n🔌 Desconectado do Redis Cloud');
    } catch (disconnectError) {
      console.log('⚠️ Erro ao desconectar:', disconnectError.message);
    }
  }
}

// Executar teste
testRedisConnection().then(() => {
  console.log('\n🏁 Teste finalizado');
  process.exit(0);
}).catch((error) => {
  console.log('\n💥 Erro fatal:', error);
  process.exit(1);
});
