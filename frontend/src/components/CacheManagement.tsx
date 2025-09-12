import React, { useState } from 'react';
import { Trash2, RefreshCw, Shield, Database, User, Settings } from 'lucide-react';
import { useCacheCleaner } from '@/hooks/useCacheCleaner';

interface CacheManagementProps {
  showAdvanced?: boolean;
  className?: string;
}

const CacheManagement: React.FC<CacheManagementProps> = ({ 
  showAdvanced = false, 
  className = '' 
}) => {
  const [isClearing, setIsClearing] = useState(false);
  const [lastCleared, setLastCleared] = useState<Date | null>(null);
  const { 
    clearAllCache, 
    clearUserCache, 
    clearAuthenticationCache, 
    clearCacheByCategory 
  } = useCacheCleaner();

  const handleClearCache = async (type: 'all' | 'user' | 'auth' | 'system') => {
    try {
      setIsClearing(true);
      
      switch (type) {
        case 'all':
          await clearAllCache();
          break;
        case 'user':
          await clearUserCache();
          break;
        case 'auth':
          await clearAuthenticationCache();
          break;
        case 'system':
          await clearCacheByCategory('system');
          break;
      }
      
      setLastCleared(new Date());
      
      // Feedback visual
      setTimeout(() => {
        setIsClearing(false);
      }, 1000);
      
    } catch (error) {
      console.error('Erro ao limpar cache:', error);
      setIsClearing(false);
    }
  };

  const getCacheInfo = () => {
    const localStorageSize = new Blob(
      Object.keys(localStorage).map(key => localStorage.getItem(key)).filter((value): value is string => value !== null)
    ).size;
    
    const sessionStorageSize = new Blob(
      Object.keys(sessionStorage).map(key => sessionStorage.getItem(key)).filter((value): value is string => value !== null)
    ).size;
    
    return {
      localStorage: (localStorageSize / 1024).toFixed(2),
      sessionStorage: (sessionStorageSize / 1024).toFixed(2),
      total: ((localStorageSize + sessionStorageSize) / 1024).toFixed(2)
    };
  };

  const cacheInfo = getCacheInfo();

  return (
    <div className={`bg-white rounded-lg border shadow-sm ${className}`}>
      <div className="p-4 border-b">
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-medium text-gray-900">Gerenciamento de Cache</h3>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          Gerencie o cache e memória do sistema
        </p>
      </div>

      <div className="p-4">
        {/* Informações do Cache */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <Database className="h-6 w-6 text-blue-600 mx-auto mb-2" />
            <div className="text-sm font-medium text-blue-900">
              {cacheInfo.localStorage} KB
            </div>
            <div className="text-xs text-blue-600">Local Storage</div>
          </div>
          
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <User className="h-6 w-6 text-green-600 mx-auto mb-2" />
            <div className="text-sm font-medium text-green-900">
              {cacheInfo.sessionStorage} KB
            </div>
            <div className="text-xs text-green-600">Session Storage</div>
          </div>
          
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <Shield className="h-6 w-6 text-purple-600 mx-auto mb-2" />
            <div className="text-sm font-medium text-purple-900">
              {cacheInfo.total} KB
            </div>
            <div className="text-xs text-purple-600">Total</div>
          </div>
        </div>

        {/* Botões de Limpeza */}
        <div className="space-y-3">
          <button
            onClick={() => handleClearCache('user')}
            disabled={isClearing}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            {isClearing ? 'Limpando...' : 'Limpar Dados do Usuário'}
          </button>

          <button
            onClick={() => handleClearCache('auth')}
            disabled={isClearing}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Shield className="h-4 w-4" />
            {isClearing ? 'Limpando...' : 'Limpar Cache de Autenticação'}
          </button>

          {showAdvanced && (
            <>
              <button
                onClick={() => handleClearCache('system')}
                disabled={isClearing}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Database className="h-4 w-4" />
                {isClearing ? 'Limpando...' : 'Limpar Cache do Sistema'}
              </button>

              <button
                onClick={() => handleClearCache('all')}
                disabled={isClearing}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                {isClearing ? 'Limpando...' : 'Limpeza Completa'}
              </button>
            </>
          )}
        </div>

        {/* Status da Última Limpeza */}
        {lastCleared && (
          <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 text-green-800">
              <RefreshCw className="h-4 w-4" />
              <span className="text-sm font-medium">
                Cache limpo em {lastCleared.toLocaleTimeString('pt-BR')}
              </span>
            </div>
          </div>
        )}

        {/* Informações Adicionais */}
        <div className="mt-4 text-xs text-gray-500 space-y-1">
          <p>• <strong>Dados do Usuário:</strong> Dashboard, funcionários, uploads</p>
          <p>• <strong>Autenticação:</strong> Tokens, perfil, permissões</p>
          {showAdvanced && (
            <>
              <p>• <strong>Sistema:</strong> Cache do navegador, memória</p>
              <p>• <strong>Completa:</strong> Tudo + cookies, timeouts</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CacheManagement;
