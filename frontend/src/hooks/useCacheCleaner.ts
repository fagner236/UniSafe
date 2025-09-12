import { useCallback } from 'react';
import { 
  clearSystemCache, 
  clearUserDataCache, 
  clearAuthCache, 
  clearCacheOnLogin, 
  clearCacheOnLogout 
} from '@/utils/cacheCleaner';

/**
 * Hook personalizado para limpeza de cache do sistema
 */
export const useCacheCleaner = () => {
  
  /**
   * Limpa completamente o cache e memória do sistema
   */
  const clearAllCache = useCallback((options?: {
    clearLocalStorage?: boolean;
    clearSessionStorage?: boolean;
    clearCookies?: boolean;
    clearMemory?: boolean;
    clearAxiosCache?: boolean;
  }) => {
    clearSystemCache(options);
  }, []);

  /**
   * Limpa apenas o cache de dados do usuário
   */
  const clearUserCache = useCallback(() => {
    clearUserDataCache();
  }, []);

  /**
   * Limpa apenas o cache de autenticação
   */
  const clearAuthenticationCache = useCallback(() => {
    clearAuthCache();
  }, []);

  /**
   * Limpa o cache ao fazer login
   */
  const clearCacheForLogin = useCallback(() => {
    clearCacheOnLogin();
  }, []);

  /**
   * Limpa o cache ao fazer logout
   */
  const clearCacheForLogout = useCallback(() => {
    clearCacheOnLogout();
  }, []);

  /**
   * Limpa cache específico por categoria
   */
  const clearCacheByCategory = useCallback((category: 'auth' | 'user' | 'system' | 'all') => {
    switch (category) {
      case 'auth':
        clearAuthCache();
        break;
      case 'user':
        clearUserDataCache();
        break;
      case 'system':
        clearSystemCache();
        break;
      case 'all':
        clearSystemCache();
        break;
    }
  }, []);

  return {
    clearAllCache,
    clearUserCache,
    clearAuthenticationCache,
    clearCacheForLogin,
    clearCacheForLogout,
    clearCacheByCategory
  };
};
