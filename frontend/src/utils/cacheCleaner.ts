/**
 * Utilitário para limpeza completa de cache e memória do sistema
 */

export interface CacheCleanerOptions {
  clearLocalStorage?: boolean;
  clearSessionStorage?: boolean;
  clearCookies?: boolean;
  clearMemory?: boolean;
  clearAxiosCache?: boolean;
}

/**
 * Limpa completamente o cache e memória do sistema
 */
export const clearSystemCache = (options: CacheCleanerOptions = {}) => {
  const {
    clearLocalStorage = true,
    clearSessionStorage = true,
    clearCookies = true,
    clearMemory = true,
    clearAxiosCache = true
  } = options;

  console.log('🧹 Iniciando limpeza completa do sistema...');

  // 1. Limpar localStorage
  if (clearLocalStorage) {
    try {
      // Lista de chaves específicas do sistema
      const systemKeys = [
        'token',
        'userData',
        'dashboardData',
        'employeeData',
        'uploadData',
        'processedData',
        'companyData',
        'version-notification-dismissed',
        'accessError',
        'rememberedEmail',
        'rememberedPassword',
        'rememberMe'
      ];

      // Remover chaves específicas do sistema
      systemKeys.forEach(key => {
        if (localStorage.getItem(key)) {
          localStorage.removeItem(key);
          console.log(`🗑️ Removido do localStorage: ${key}`);
        }
      });

      // Limpar todo o localStorage (opcional - comentado por segurança)
      // localStorage.clear();
      console.log('✅ localStorage limpo');
    } catch (error) {
      console.error('❌ Erro ao limpar localStorage:', error);
    }
  }

  // 2. Limpar sessionStorage
  if (clearSessionStorage) {
    try {
      sessionStorage.clear();
      console.log('✅ sessionStorage limpo');
    } catch (error) {
      console.error('❌ Erro ao limpar sessionStorage:', error);
    }
  }

  // 3. Limpar cookies
  if (clearCookies) {
    try {
      // Remover cookies específicos do sistema
      const cookies = document.cookie.split(';');
      cookies.forEach(cookie => {
        const eqPos = cookie.indexOf('=');
        const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
        
        // Remover cookies do sistema (ajustar domínio conforme necessário)
        if (name.startsWith('unisafe_') || name.startsWith('auth_')) {
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
          console.log(`🗑️ Cookie removido: ${name}`);
        }
      });
      console.log('✅ Cookies limpos');
    } catch (error) {
      console.error('❌ Erro ao limpar cookies:', error);
    }
  }

  // 4. Limpar cache de memória
  if (clearMemory) {
    try {
      // Forçar garbage collection se disponível
      if (window.gc) {
        window.gc();
        console.log('✅ Garbage collection forçado');
      }

      // Limpar variáveis globais do sistema
      if (window.unisafeCache) {
        delete window.unisafeCache;
        console.log('✅ Cache global removido');
      }

      // Limpar timeouts e intervals pendentes
      const highestTimeoutId = setTimeout(() => {}, 0);
      for (let i = 0; i < highestTimeoutId; i++) {
        clearTimeout(i);
      }
      console.log('✅ Timeouts limpos');

      const highestIntervalId = setInterval(() => {}, 0);
      for (let i = 0; i < highestIntervalId; i++) {
        clearInterval(i);
      }
      console.log('✅ Intervals limpos');
    } catch (error) {
      console.error('❌ Erro ao limpar memória:', error);
    }
  }

  // 5. Limpar cache do axios
  if (clearAxiosCache) {
    try {
      // Limpar cache de requisições pendentes
      if (window.axiosCache) {
        window.axiosCache.clear();
        console.log('✅ Cache do axios limpo');
      }
    } catch (error) {
      console.error('❌ Erro ao limpar cache do axios:', error);
    }
  }

  // 6. Limpar cache do navegador (se possível)
  try {
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          if (name.includes('unisafe') || name.includes('vite')) {
            caches.delete(name);
            console.log(`🗑️ Cache do navegador removido: ${name}`);
          }
        });
      });
    }
  } catch (error) {
    console.error('❌ Erro ao limpar cache do navegador:', error);
  }

  console.log('🎉 Limpeza completa do sistema concluída!');
};

/**
 * Limpa apenas o cache de dados do usuário (mantém configurações)
 */
export const clearUserDataCache = () => {
  console.log('🧹 Limpando cache de dados do usuário...');

  const userDataKeys = [
    'userData',
    'dashboardData',
    'employeeData',
    'uploadData',
    'processedData',
    'companyData'
  ];

  userDataKeys.forEach(key => {
    if (localStorage.getItem(key)) {
      localStorage.removeItem(key);
      console.log(`🗑️ Dados do usuário removidos: ${key}`);
    }
  });

  console.log('✅ Cache de dados do usuário limpo');
};

/**
 * Limpa apenas o cache de autenticação
 */
export const clearAuthCache = () => {
  console.log('🔒 Limpando cache de autenticação...');

  const authKeys = [
    'token',
    'userData',
    'accessError'
  ];

  authKeys.forEach(key => {
    if (localStorage.getItem(key)) {
      localStorage.removeItem(key);
      console.log(`🗑️ Dados de autenticação removidos: ${key}`);
    }
  });

  console.log('✅ Cache de autenticação limpo');
};

/**
 * Limpa o cache ao fazer login
 */
export const clearCacheOnLogin = () => {
  console.log('🔑 Limpando cache para novo login...');
  
  // Limpar dados antigos mas manter configurações
  clearUserDataCache();
  
  // Limpar dados de sessão
  if (sessionStorage.length > 0) {
    sessionStorage.clear();
    console.log('✅ Sessão limpa para novo login');
  }
  
  console.log('✅ Cache limpo para novo login');
};

/**
 * Limpa o cache ao fazer logout
 */
export const clearCacheOnLogout = () => {
  console.log('🚪 Limpando cache no logout...');
  
  // Limpeza completa no logout
  clearSystemCache({
    clearLocalStorage: true,
    clearSessionStorage: true,
    clearCookies: true,
    clearMemory: true,
    clearAxiosCache: true
  });
  
  console.log('✅ Cache completamente limpo no logout');
};

// Extensão da interface Window para cache global
declare global {
  interface Window {
    unisafeCache?: any;
    axiosCache?: any;
    gc?: () => void;
  }
}
