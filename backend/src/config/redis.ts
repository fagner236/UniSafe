import { createClient } from 'redis';

// Configuração do cliente Redis
const redisClient = createClient({
  socket: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
  },
  password: process.env.REDIS_PASSWORD,
});

// Event listeners
redisClient.on('connect', () => {
  console.log('✅ Redis conectado com sucesso');
});

redisClient.on('error', (err) => {
  console.log('⚠️ Redis error:', err.message);
  // Não vamos falhar a aplicação se Redis não estiver disponível
});

redisClient.on('ready', () => {
  console.log('🚀 Redis pronto para uso');
});

// Conectar ao Redis
redisClient.connect().catch((err) => {
  console.log('⚠️ Falha ao conectar Redis:', err.message);
});

// Funções utilitárias para cache
export const cacheService = {
  // Salvar no cache com TTL
  async set(key: string, value: any, ttlSeconds: number = 3600): Promise<void> {
    try {
      await redisClient.setEx(key, ttlSeconds, JSON.stringify(value));
    } catch (error) {
      console.log('⚠️ Erro ao salvar no cache:', error);
    }
  },

  // Buscar do cache
  async get(key: string): Promise<any | null> {
    try {
      const value = await redisClient.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.log('⚠️ Erro ao buscar do cache:', error);
      return null;
    }
  },

  // Deletar do cache
  async del(key: string): Promise<void> {
    try {
      await redisClient.del(key);
    } catch (error) {
      console.log('⚠️ Erro ao deletar do cache:', error);
    }
  },

  // Deletar múltiplas chaves com padrão
  async delPattern(pattern: string): Promise<void> {
    try {
      const keys = await redisClient.keys(pattern);
      if (keys.length > 0) {
        await redisClient.del(keys);
        console.log(`🗑️ Deletadas ${keys.length} chaves com padrão: ${pattern}`);
      }
    } catch (error) {
      console.log('⚠️ Erro ao deletar padrão do cache:', error);
    }
  },

  // Verificar se existe
  async exists(key: string): Promise<boolean> {
    try {
      const result = await redisClient.exists(key);
      return result === 1;
    } catch (error) {
      console.log('⚠️ Erro ao verificar existência no cache:', error);
      return false;
    }
  },

  // Obter TTL de uma chave
  async getTTL(key: string): Promise<number> {
    try {
      return await redisClient.ttl(key);
    } catch (error) {
      console.log(`⚠️ Erro ao obter TTL da chave ${key}:`, error);
      return -1;
    }
  },

  // Obter tamanho de uma chave
  async getSize(key: string): Promise<number> {
    try {
      return await redisClient.strLen(key);
    } catch (error) {
      console.log(`⚠️ Erro ao obter tamanho da chave ${key}:`, error);
      return 0;
    }
  },

  // Obter todas as chaves com padrão
  async getKeys(pattern: string): Promise<string[]> {
    try {
      return await redisClient.keys(pattern);
    } catch (error) {
      console.log(`⚠️ Erro ao obter chaves com padrão ${pattern}:`, error);
      return [];
    }
  },

  // Deletar múltiplas chaves
  async delMany(keys: string[]): Promise<void> {
    try {
      if (keys.length > 0) {
        await redisClient.del(keys);
        console.log(`🗑️ Deletadas ${keys.length} chaves`);
      }
    } catch (error) {
      console.log('⚠️ Erro ao deletar múltiplas chaves:', error);
    }
  }
};

export default redisClient;
