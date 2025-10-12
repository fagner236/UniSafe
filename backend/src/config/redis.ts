import { createClient } from 'redis';

// Cache em memória como fallback
class MemoryCache {
  private cache: Map<string, { value: any; expires: number }> = new Map();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Limpeza automática de itens expirados a cada 5 minutos
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  private cleanup() {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (item.expires < now) {
        this.cache.delete(key);
      }
    }
  }

  async set(key: string, value: any, ttlSeconds: number = 3600): Promise<void> {
    const expires = Date.now() + (ttlSeconds * 1000);
    this.cache.set(key, { value, expires });
  }

  async get(key: string): Promise<any | null> {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (item.expires < Date.now()) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value;
  }

  async del(key: string): Promise<void> {
    this.cache.delete(key);
  }

  async delPattern(pattern: string): Promise<void> {
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  async exists(key: string): Promise<boolean> {
    const item = this.cache.get(key);
    return item ? item.expires > Date.now() : false;
  }

  async getTTL(key: string): Promise<number> {
    const item = this.cache.get(key);
    if (!item) return -1;
    return Math.max(0, Math.floor((item.expires - Date.now()) / 1000));
  }

  async getSize(key: string): Promise<number> {
    const item = this.cache.get(key);
    return item ? JSON.stringify(item.value).length : 0;
  }

  async getKeys(pattern: string): Promise<string[]> {
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    return Array.from(this.cache.keys()).filter(key => regex.test(key));
  }

  async delMany(keys: string[]): Promise<void> {
    keys.forEach(key => this.cache.delete(key));
  }

  destroy() {
    clearInterval(this.cleanupInterval);
    this.cache.clear();
  }
}

// Instância do cache em memória
const memoryCache = new MemoryCache();

// Configuração do cliente Redis (opcional)
let redisClient: any = null;
let redisConnected = false;

// Tentar conectar ao Redis se as variáveis estiverem configuradas
if (process.env.REDIS_HOST && process.env.REDIS_HOST !== 'localhost') {
  try {
    redisClient = createClient({
      socket: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT || '6379'),
        connectTimeout: 5000,
      },
      password: process.env.REDIS_PASSWORD,
    });

    // Event listeners
    redisClient.on('connect', () => {
      console.log('✅ Redis conectado com sucesso');
      redisConnected = true;
    });

    redisClient.on('error', (err: any) => {
      console.log('⚠️ Redis error:', err.message);
      redisConnected = false;
    });

    redisClient.on('ready', () => {
      console.log('🚀 Redis pronto para uso');
      redisConnected = true;
    });

    // Conectar ao Redis
    redisClient.connect().catch((err: any) => {
      console.log('⚠️ Falha ao conectar Redis, usando cache em memória:', err.message);
      redisConnected = false;
    });
  } catch (error) {
    console.log('⚠️ Erro ao inicializar Redis, usando cache em memória');
    redisConnected = false;
  }
}

// Funções utilitárias para cache com fallback automático
export const cacheService = {
  // Salvar no cache com TTL
  async set(key: string, value: any, ttlSeconds: number = 3600): Promise<void> {
    try {
      if (redisConnected && redisClient) {
        await redisClient.setEx(key, ttlSeconds, JSON.stringify(value));
      } else {
        await memoryCache.set(key, value, ttlSeconds);
      }
    } catch (error) {
      console.log('⚠️ Erro ao salvar no cache, usando memória:', error);
      await memoryCache.set(key, value, ttlSeconds);
    }
  },

  // Buscar do cache
  async get(key: string): Promise<any | null> {
    try {
      if (redisConnected && redisClient) {
        const value = await redisClient.get(key);
        return value ? JSON.parse(value) : null;
      } else {
        return await memoryCache.get(key);
      }
    } catch (error) {
      console.log('⚠️ Erro ao buscar do cache, usando memória:', error);
      return await memoryCache.get(key);
    }
  },

  // Deletar do cache
  async del(key: string): Promise<void> {
    try {
      if (redisConnected && redisClient) {
        await redisClient.del(key);
      } else {
        await memoryCache.del(key);
      }
    } catch (error) {
      console.log('⚠️ Erro ao deletar do cache, usando memória:', error);
      await memoryCache.del(key);
    }
  },

  // Deletar múltiplas chaves com padrão
  async delPattern(pattern: string): Promise<void> {
    try {
      if (redisConnected && redisClient) {
        const keys = await redisClient.keys(pattern);
        if (keys.length > 0) {
          await redisClient.del(keys);
          console.log(`🗑️ Deletadas ${keys.length} chaves com padrão: ${pattern}`);
        }
      } else {
        await memoryCache.delPattern(pattern);
        console.log(`🗑️ Deletadas chaves com padrão: ${pattern} (memória)`);
      }
    } catch (error) {
      console.log('⚠️ Erro ao deletar padrão do cache, usando memória:', error);
      await memoryCache.delPattern(pattern);
    }
  },

  // Verificar se existe
  async exists(key: string): Promise<boolean> {
    try {
      if (redisConnected && redisClient) {
        const result = await redisClient.exists(key);
        return result === 1;
      } else {
        return await memoryCache.exists(key);
      }
    } catch (error) {
      console.log('⚠️ Erro ao verificar existência no cache, usando memória:', error);
      return await memoryCache.exists(key);
    }
  },

  // Obter TTL de uma chave
  async getTTL(key: string): Promise<number> {
    try {
      if (redisConnected && redisClient) {
        return await redisClient.ttl(key);
      } else {
        return await memoryCache.getTTL(key);
      }
    } catch (error) {
      console.log(`⚠️ Erro ao obter TTL da chave ${key}, usando memória:`, error);
      return await memoryCache.getTTL(key);
    }
  },

  // Obter tamanho de uma chave
  async getSize(key: string): Promise<number> {
    try {
      if (redisConnected && redisClient) {
        return await redisClient.strLen(key);
      } else {
        return await memoryCache.getSize(key);
      }
    } catch (error) {
      console.log(`⚠️ Erro ao obter tamanho da chave ${key}, usando memória:`, error);
      return await memoryCache.getSize(key);
    }
  },

  // Obter todas as chaves com padrão
  async getKeys(pattern: string): Promise<string[]> {
    try {
      if (redisConnected && redisClient) {
        return await redisClient.keys(pattern);
      } else {
        return await memoryCache.getKeys(pattern);
      }
    } catch (error) {
      console.log(`⚠️ Erro ao obter chaves com padrão ${pattern}, usando memória:`, error);
      return await memoryCache.getKeys(pattern);
    }
  },

  // Deletar múltiplas chaves
  async delMany(keys: string[]): Promise<void> {
    try {
      if (redisConnected && redisClient) {
        if (keys.length > 0) {
          await redisClient.del(keys);
          console.log(`🗑️ Deletadas ${keys.length} chaves`);
        }
      } else {
        await memoryCache.delMany(keys);
        console.log(`🗑️ Deletadas ${keys.length} chaves (memória)`);
      }
    } catch (error) {
      console.log('⚠️ Erro ao deletar múltiplas chaves, usando memória:', error);
      await memoryCache.delMany(keys);
    }
  },

  // Obter status do cache
  getStatus(): { redis: boolean; memory: boolean } {
    return {
      redis: redisConnected,
      memory: true
    };
  }
};

export default redisClient;