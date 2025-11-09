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

// Configuração do cliente Redis (obrigatório)
let redisClient: any = null;
let redisConnected = false;

// Função para inicializar e conectar ao Redis
async function initializeRedis(): Promise<void> {
  const maxRetries = 5;
  const retryDelay = 2000; // 2 segundos
  
  if (!process.env.REDIS_HOST || process.env.REDIS_HOST === 'localhost') {
    throw new Error('REDIS_HOST não configurado. Redis é obrigatório para o funcionamento do sistema.');
  }

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 Tentativa ${attempt}/${maxRetries} de conectar ao Redis...`);
      
    redisClient = createClient({
      username: process.env.REDIS_USERNAME,
      password: process.env.REDIS_PASSWORD,
      socket: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT || '6379'),
          connectTimeout: 15000,
          reconnectStrategy: (retries) => {
            if (retries > 10) {
              console.log('⚠️ Redis: Muitas tentativas de reconexão, tentando reconectar...');
              return false;
            }
            return Math.min(retries * 200, 5000);
          }
      },
      database: parseInt(process.env.REDIS_DB || '0'),
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

      redisClient.on('reconnecting', () => {
        console.log('🔄 Redis reconectando...');
      });

      redisClient.on('end', () => {
        console.log('⚠️ Redis desconectado');
        redisConnected = false;
      });

      // Conectar ao Redis
        await redisClient.connect();
      
      // Verificar conexão com um ping
      const pong = await redisClient.ping();
      if (pong === 'PONG') {
        console.log('✅ Redis conectado e respondendo corretamente!');
        redisConnected = true;
        return; // Sucesso, sair da função
      }
    } catch (error: any) {
      console.log(`❌ Tentativa ${attempt}/${maxRetries} falhou:`, error.message);
        redisConnected = false;
      redisClient = null;
      
      if (attempt < maxRetries) {
        console.log(`⏳ Aguardando ${retryDelay}ms antes da próxima tentativa...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      } else {
        throw new Error(`Falha ao conectar ao Redis após ${maxRetries} tentativas: ${error.message}`);
      }
    }
  }
}

// Inicializar Redis em background (não bloqueia o servidor)
let redisInitialization: Promise<void> | null = null;

if (process.env.REDIS_HOST && process.env.REDIS_HOST !== 'localhost') {
  // Iniciar conexão em background sem bloquear
  redisInitialization = initializeRedis().catch((error) => {
    console.error('❌ ERRO: Não foi possível conectar ao Redis:', error.message);
    console.error('⚠️ O sistema continuará tentando reconectar em background...');
    redisConnected = false;
    // Não encerrar o processo, apenas logar o erro
  });
} else {
  console.warn('⚠️ AVISO: REDIS_HOST não configurado. Redis é recomendado para melhor performance.');
  console.warn('⚠️ O sistema funcionará, mas sem cache Redis.');
}

// Funções utilitárias para cache usando Redis (obrigatório)
export const cacheService = {
  // Salvar no cache com TTL
  async set(key: string, value: any, ttlSeconds: number = 3600): Promise<void> {
    // Aguardar inicialização do Redis se ainda não estiver pronto (com timeout)
    if (!redisConnected && redisInitialization) {
      try {
        await Promise.race([
          redisInitialization,
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
        ]);
      } catch (error) {
        // Se timeout ou erro, usar cache em memória temporariamente
        console.warn('⚠️ Redis não disponível, usando cache em memória temporariamente');
        await memoryCache.set(key, value, ttlSeconds);
        return;
      }
    }
    
    if (!redisConnected || !redisClient) {
      // Usar cache em memória como fallback
      await memoryCache.set(key, value, ttlSeconds);
      return;
    }
    
    try {
      await redisClient.setEx(key, ttlSeconds, JSON.stringify(value));
    } catch (error: any) {
      console.error('❌ Erro ao salvar no Redis, usando memória:', error.message);
      // Fallback para memória em caso de erro
      await memoryCache.set(key, value, ttlSeconds);
    }
  },

  // Buscar do cache
  async get(key: string): Promise<any | null> {
    // Aguardar inicialização do Redis se ainda não estiver pronto (com timeout)
    if (!redisConnected && redisInitialization) {
      try {
        await Promise.race([
          redisInitialization,
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
        ]);
      } catch (error) {
        // Se timeout ou erro, usar cache em memória
        return await memoryCache.get(key);
      }
    }
    
    if (!redisConnected || !redisClient) {
      // Usar cache em memória como fallback
      return await memoryCache.get(key);
    }
    
    try {
      const value = await redisClient.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error: any) {
      console.error('❌ Erro ao buscar do Redis, usando memória:', error.message);
      // Fallback para memória em caso de erro
      return await memoryCache.get(key);
    }
  },

  // Deletar do cache
  async del(key: string): Promise<void> {
    // Aguardar inicialização do Redis se ainda não estiver pronto (com timeout)
    if (!redisConnected && redisInitialization) {
      try {
        await Promise.race([
          redisInitialization,
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
        ]);
      } catch (error) {
        // Se timeout ou erro, usar cache em memória
        await memoryCache.del(key);
        return;
      }
    }
    
    if (!redisConnected || !redisClient) {
      // Usar cache em memória como fallback
      await memoryCache.del(key);
      return;
    }
    
    try {
      await redisClient.del(key);
    } catch (error: any) {
      console.error('❌ Erro ao deletar do Redis, usando memória:', error.message);
      // Fallback para memória em caso de erro
      await memoryCache.del(key);
    }
  },

  // Deletar múltiplas chaves com padrão
  async delPattern(pattern: string): Promise<void> {
    // Aguardar inicialização do Redis se ainda não estiver pronto (com timeout)
    if (!redisConnected && redisInitialization) {
      try {
        await Promise.race([
          redisInitialization,
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
        ]);
      } catch (error) {
        // Se timeout ou erro, usar cache em memória
        await memoryCache.delPattern(pattern);
        return;
      }
    }
    
    if (!redisConnected || !redisClient) {
      // Usar cache em memória como fallback
      await memoryCache.delPattern(pattern);
      return;
    }
    
    try {
        const keys = await redisClient.keys(pattern);
        if (keys.length > 0) {
          await redisClient.del(keys);
          console.log(`🗑️ Deletadas ${keys.length} chaves com padrão: ${pattern}`);
        }
    } catch (error: any) {
      console.error('❌ Erro ao deletar padrão do Redis, usando memória:', error.message);
      // Fallback para memória em caso de erro
      await memoryCache.delPattern(pattern);
    }
  },

  // Verificar se existe
  async exists(key: string): Promise<boolean> {
    // Aguardar inicialização do Redis se ainda não estiver pronto (com timeout)
    if (!redisConnected && redisInitialization) {
      try {
        await Promise.race([
          redisInitialization,
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
        ]);
      } catch (error) {
        // Se timeout ou erro, usar cache em memória
        return await memoryCache.exists(key);
      }
    }
    
    if (!redisConnected || !redisClient) {
      // Usar cache em memória como fallback
      return await memoryCache.exists(key);
    }
    
    try {
      const result = await redisClient.exists(key);
      return result === 1;
    } catch (error: any) {
      console.error('❌ Erro ao verificar existência no Redis, usando memória:', error.message);
      // Fallback para memória em caso de erro
      return await memoryCache.exists(key);
    }
  },

  // Obter TTL de uma chave
  async getTTL(key: string): Promise<number> {
    // Aguardar inicialização do Redis se ainda não estiver pronto (com timeout)
    if (!redisConnected && redisInitialization) {
      try {
        await Promise.race([
          redisInitialization,
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
        ]);
      } catch (error) {
        // Se timeout ou erro, usar cache em memória
        return await memoryCache.getTTL(key);
      }
    }
    
    if (!redisConnected || !redisClient) {
      // Usar cache em memória como fallback
      return await memoryCache.getTTL(key);
    }
    
    try {
      return await redisClient.ttl(key);
    } catch (error: any) {
      console.error(`❌ Erro ao obter TTL da chave ${key} no Redis, usando memória:`, error.message);
      // Fallback para memória em caso de erro
      return await memoryCache.getTTL(key);
    }
  },

  // Obter tamanho de uma chave
  async getSize(key: string): Promise<number> {
    // Aguardar inicialização do Redis se ainda não estiver pronto (com timeout)
    if (!redisConnected && redisInitialization) {
      try {
        await Promise.race([
          redisInitialization,
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
        ]);
      } catch (error) {
        // Se timeout ou erro, usar cache em memória
        return await memoryCache.getSize(key);
      }
    }
    
    if (!redisConnected || !redisClient) {
      // Usar cache em memória como fallback
      return await memoryCache.getSize(key);
    }
    
    try {
      return await redisClient.strLen(key);
    } catch (error: any) {
      console.error(`❌ Erro ao obter tamanho da chave ${key} no Redis, usando memória:`, error.message);
      // Fallback para memória em caso de erro
      return await memoryCache.getSize(key);
    }
  },

  // Obter todas as chaves com padrão
  async getKeys(pattern: string): Promise<string[]> {
    // Aguardar inicialização do Redis se ainda não estiver pronto (com timeout)
    if (!redisConnected && redisInitialization) {
      try {
        await Promise.race([
          redisInitialization,
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
        ]);
      } catch (error) {
        // Se timeout ou erro, usar cache em memória
        return await memoryCache.getKeys(pattern);
      }
    }
    
    if (!redisConnected || !redisClient) {
      // Usar cache em memória como fallback
      return await memoryCache.getKeys(pattern);
    }
    
    try {
      return await redisClient.keys(pattern);
    } catch (error: any) {
      console.error(`❌ Erro ao obter chaves com padrão ${pattern} no Redis, usando memória:`, error.message);
      // Fallback para memória em caso de erro
      return await memoryCache.getKeys(pattern);
    }
  },

  // Deletar múltiplas chaves
  async delMany(keys: string[]): Promise<void> {
    // Aguardar inicialização do Redis se ainda não estiver pronto (com timeout)
    if (!redisConnected && redisInitialization) {
      try {
        await Promise.race([
          redisInitialization,
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
        ]);
      } catch (error) {
        // Se timeout ou erro, usar cache em memória
        await memoryCache.delMany(keys);
        return;
      }
    }
    
    if (!redisConnected || !redisClient) {
      // Usar cache em memória como fallback
      await memoryCache.delMany(keys);
      return;
    }
    
    try {
        if (keys.length > 0) {
          await redisClient.del(keys);
          console.log(`🗑️ Deletadas ${keys.length} chaves`);
        }
    } catch (error: any) {
      console.error('❌ Erro ao deletar múltiplas chaves do Redis, usando memória:', error.message);
      // Fallback para memória em caso de erro
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

// Exportar a promessa de inicialização para que o servidor aguarde
export { redisInitialization };

export default redisClient;