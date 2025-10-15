// Teste de conexão Redis Cloud
import { createClient } from 'redis';

const redisClient = createClient({
  socket: {
    host: 'redis-16285.c228.us-central1-1.gce.redns.redis-cloud.com',
    port: 16285,
    connectTimeout: 10000,
  },
  password: 'EviaRedis2025!',
  database: 0,
});

redisClient.on('connect', () => {
  console.log('✅ Redis Cloud conectado com sucesso!');
});

redisClient.on('error', (err) => {
  console.log('❌ Erro Redis Cloud:', err.message);
});

redisClient.on('ready', () => {
  console.log('🚀 Redis Cloud pronto para uso!');
});

async function testRedis() {
  try {
    await redisClient.connect();
    console.log('🔗 Conectando ao Redis Cloud...');
    
    // Teste básico
    await redisClient.set('test:connection', 'Redis Cloud funcionando!', { EX: 60 });
    const value = await redisClient.get('test:connection');
    console.log('📝 Valor recuperado:', value);
    
    // Teste de cache
    await redisClient.set('cache:test', JSON.stringify({ 
      message: 'Cache Redis Cloud ativo',
      timestamp: new Date().toISOString()
    }), { EX: 300 });
    
    const cached = await redisClient.get('cache:test');
    console.log('💾 Cache recuperado:', JSON.parse(cached || '{}'));
    
    console.log('✅ Teste Redis Cloud concluído com sucesso!');
    
  } catch (error) {
    console.log('❌ Erro no teste Redis Cloud:', error);
  } finally {
    await redisClient.disconnect();
    console.log('🔌 Desconectado do Redis Cloud');
  }
}

testRedis();
