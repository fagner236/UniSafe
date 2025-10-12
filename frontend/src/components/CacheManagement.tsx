import React, { useState, useEffect } from 'react';
import { 
  RefreshCw, 
  Trash2, 
  Database, 
  Users, 
  UserCheck, 
  Clock,
  CheckCircle,
  AlertCircle,
  Info,
  Shield
} from 'lucide-react';
import config from '@/config/environment';

interface CacheStats {
  redis: {
    connected: boolean;
    totalKeys: number;
    memoryUsage: string;
  };
  keys: {
    dashboard: number;
    users: number;
    empregados: number;
    total: number;
  };
  sampleKeys: Array<{
    key: string;
    ttl: number;
  }>;
  lastUpdated: string;
  admin: {
    name: string;
    email: string;
    baseSindical: string;
  };
}

interface CacheClearResponse {
  success: boolean;
  message: string;
  data: {
    type: string;
    clearedKeys: number;
    clearedAt: string;
    admin: {
      name: string;
      email: string;
    };
  };
}

const CacheManagement: React.FC = () => {
  const [cacheStats, setCacheStats] = useState<CacheStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  const fetchCacheStatus = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${config.apiUrl}/cache-admin/status`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao obter status do cache');
      }

      const data = await response.json();
      setCacheStats(data.data);
      setMessage({ type: 'success', text: 'Status do cache atualizado com sucesso!' });
    } catch (error) {
      console.error('Erro ao buscar status do cache:', error);
      setMessage({ type: 'error', text: 'Erro ao obter status do cache' });
    } finally {
      setLoading(false);
    }
  };

  const clearCache = async (type: string, baseSindical?: string) => {
    try {
      setClearing(type);
      const token = localStorage.getItem('token');
      const response = await fetch(`${config.apiUrl}/cache-admin/clear`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ type, baseSindical })
      });

      if (!response.ok) {
        throw new Error('Erro ao limpar cache');
      }

      const data: CacheClearResponse = await response.json();
      setMessage({ type: 'success', text: data.message });
      
      // Atualizar status após limpeza
      setTimeout(() => {
        fetchCacheStatus();
      }, 1000);
    } catch (error) {
      console.error('Erro ao limpar cache:', error);
      setMessage({ type: 'error', text: 'Erro ao limpar cache' });
    } finally {
      setClearing(null);
    }
  };

  const formatTTL = (ttl: number): string => {
    if (ttl === -1) return 'Sem expiração';
    if (ttl === -2) return 'Chave não existe';
    
    const days = Math.floor(ttl / 86400);
    const hours = Math.floor((ttl % 86400) / 3600);
    const minutes = Math.floor((ttl % 3600) / 60);
    const seconds = ttl % 60;

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  useEffect(() => {
    fetchCacheStatus();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '256px' }}>
        <RefreshCw style={{ height: '32px', width: '32px', animation: 'spin 1s linear infinite', color: '#2563eb' }} />
        <span style={{ marginLeft: '8px', fontSize: '18px' }}>Carregando status do cache...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8fafc' }}>
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <div className="p-3 rounded-lg mr-4" style={{ backgroundColor: '#ffc9c0' }}>
              <Database className="h-8 w-8" style={{ color: '#1d335b' }} />
            </div>
            <div>
              <h1 className="text-3xl font-bold" style={{ color: '#1d335b' }}>
                Administração de Cache
              </h1>
              <p className="text-gray-600 mt-1">
                Gerencie o cache Redis do sistema UniSafe de forma centralizada e segura. Acesso restrito a administradores.
              </p>
            </div>
          </div>
          
          {/* Aviso de Segurança */}
          <div className="p-4 rounded-lg" style={{ backgroundColor: '#fff5f5', borderColor: '#ffc9c0', borderWidth: '1px', borderStyle: 'solid' }}>
            <div className="flex">
              <div className="flex-shrink-0">
                <Shield className="h-5 w-5" style={{ color: '#1d335b' }} />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium" style={{ color: '#8b5a5a' }}>
                  <strong>Segurança:</strong> Todas as ações são registradas para auditoria. 
                  Esta página é restrita a administradores e permite gerenciar o cache Redis do sistema.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Botão de Atualização */}
        <div className="mb-6">
          <button 
            onClick={fetchCacheStatus} 
            disabled={loading}
            className="px-4 py-2 text-white rounded-md transition-colors h-10"
            style={{ backgroundColor: '#1d335b' }}
            onMouseEnter={(e) => !e.currentTarget.disabled && (e.currentTarget.style.backgroundColor = '#2a4a7a')}
            onMouseLeave={(e) => !e.currentTarget.disabled && (e.currentTarget.style.backgroundColor = '#1d335b')}
          >
            <RefreshCw className="h-4 w-4 inline mr-2" style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            Atualizar Status
          </button>
        </div>

        {/* Message Alert */}
        {message && (
          <div className={`p-4 rounded-lg border mb-6 ${
            message.type === 'success' 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : message.type === 'error'
              ? 'bg-red-50 border-red-200 text-red-800'
              : 'bg-blue-50 border-blue-200 text-blue-800'
          }`}>
            <div className="flex items-center">
              {message.type === 'success' ? (
                <CheckCircle className="h-5 w-5 mr-2" />
              ) : message.type === 'error' ? (
                <AlertCircle className="h-5 w-5 mr-2" />
              ) : (
                <Info className="h-5 w-5 mr-2" />
              )}
              {message.text}
            </div>
          </div>
        )}

        {/* Cache Status Overview */}
        {cacheStats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
            {/* Redis Status */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6">
              <div className="flex items-center">
                <div className="p-2 rounded-lg mr-3" style={{ backgroundColor: '#ffc9c0' }}>
                  <Database className="h-5 w-5" style={{ color: '#1d335b' }} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Status Redis
                  </p>
                  <p className="text-2xl font-semibold" style={{ color: '#1d335b' }}>
                    {cacheStats.redis.connected ? 'Conectado' : 'Desconectado'}
                  </p>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Total de chaves: {cacheStats.redis.totalKeys}
              </p>
            </div>

            {/* Total Keys */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6">
              <div className="flex items-center">
                <div className="p-2 rounded-lg mr-3" style={{ backgroundColor: '#ffc9c0' }}>
                  <Users className="h-5 w-5" style={{ color: '#1d335b' }} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total de Chaves
                  </p>
                  <p className="text-2xl font-semibold" style={{ color: '#1d335b' }}>
                    {cacheStats.keys.total.toLocaleString('pt-BR')}
                  </p>
                </div>
              </div>
            </div>

            {/* Dashboard Keys */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6">
              <div className="flex items-center">
                <div className="p-2 rounded-lg mr-3" style={{ backgroundColor: '#ffc9c0' }}>
                  <UserCheck className="h-5 w-5" style={{ color: '#1d335b' }} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Cache Dashboard
                  </p>
                  <p className="text-2xl font-semibold" style={{ color: '#1d335b' }}>
                    {cacheStats.keys.dashboard.toLocaleString('pt-BR')}
                  </p>
                </div>
              </div>
            </div>

            {/* Users Keys */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6">
              <div className="flex items-center">
                <div className="p-2 rounded-lg mr-3" style={{ backgroundColor: '#ffc9c0' }}>
                  <Clock className="h-5 w-5" style={{ color: '#1d335b' }} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Cache Usuários
                  </p>
                  <p className="text-2xl font-semibold" style={{ color: '#1d335b' }}>
                    {cacheStats.keys.users.toLocaleString('pt-BR')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Cache Management Actions */}
        <div className="bg-white shadow rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Trash2 className="h-5 w-5 mr-2" />
              Limpeza Manual de Cache
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {/* Clear Dashboard Cache */}
              <button
                onClick={() => clearCache('dashboard')}
                disabled={clearing === 'dashboard'}
                className="flex flex-col items-center gap-2 p-4 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                onMouseEnter={(e) => !e.currentTarget.disabled && (e.currentTarget.style.borderColor = '#c9504c')}
                onMouseLeave={(e) => !e.currentTarget.disabled && (e.currentTarget.style.borderColor = '#d1d5db')}
              >
                <Database className="h-6 w-6" />
                <span className="text-sm font-medium">Limpar Dashboard</span>
                {clearing === 'dashboard' && <RefreshCw className="h-4 w-4 animate-spin" />}
              </button>

              {/* Clear Users Cache */}
              <button
                onClick={() => clearCache('users')}
                disabled={clearing === 'users'}
                className="flex flex-col items-center gap-2 p-4 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                onMouseEnter={(e) => !e.currentTarget.disabled && (e.currentTarget.style.borderColor = '#c9504c')}
                onMouseLeave={(e) => !e.currentTarget.disabled && (e.currentTarget.style.borderColor = '#d1d5db')}
              >
                <Users className="h-6 w-6" />
                <span className="text-sm font-medium">Limpar Usuários</span>
                {clearing === 'users' && <RefreshCw className="h-4 w-4 animate-spin" />}
              </button>

              {/* Clear Empregados Cache */}
              <button
                onClick={() => clearCache('empregados')}
                disabled={clearing === 'empregados'}
                className="flex flex-col items-center gap-2 p-4 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                onMouseEnter={(e) => !e.currentTarget.disabled && (e.currentTarget.style.borderColor = '#c9504c')}
                onMouseLeave={(e) => !e.currentTarget.disabled && (e.currentTarget.style.borderColor = '#d1d5db')}
              >
                <UserCheck className="h-6 w-6" />
                <span className="text-sm font-medium">Limpar Empregados</span>
                {clearing === 'empregados' && <RefreshCw className="h-4 w-4 animate-spin" />}
              </button>

              {/* Clear All Cache */}
              <button
                onClick={() => clearCache('all')}
                disabled={clearing === 'all'}
                className="flex flex-col items-center gap-2 p-4 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                style={{ backgroundColor: '#c9504c' }}
                onMouseEnter={(e) => !e.currentTarget.disabled && (e.currentTarget.style.backgroundColor = '#d65a56')}
                onMouseLeave={(e) => !e.currentTarget.disabled && (e.currentTarget.style.backgroundColor = '#c9504c')}
              >
                <Trash2 className="h-6 w-6" />
                <span className="text-sm font-medium">Limpar Tudo</span>
                {clearing === 'all' && <RefreshCw className="h-4 w-4 animate-spin" />}
              </button>
        </div>

            {/* Aviso de Atenção */}
            <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 flex items-center gap-2">
              <Info className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-blue-800">
                <strong>Atenção:</strong> A limpeza manual do cache fará com que os próximos acessos sejam mais lentos 
                até que o cache seja reconstruído. Use com moderação.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Sample Keys Information */}
      {cacheStats && cacheStats.sampleKeys.length > 0 && (
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <Clock style={{ height: '20px', width: '20px' }} />
            <h3 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>Chaves de Cache (Amostra)</h3>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {cacheStats.sampleKeys.slice(0, 10).map((keyInfo, index) => (
              <div key={index} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px',
                backgroundColor: '#f9fafb',
                borderRadius: '4px'
              }}>
                <code style={{ fontSize: '14px', fontFamily: 'monospace' }}>{keyInfo.key}</code>
                <span style={{
                  padding: '4px 8px',
                  backgroundColor: '#e5e7eb',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: '500'
                }}>
                  TTL: {formatTTL(keyInfo.ttl)}
                </span>
              </div>
            ))}
          </div>
          
          <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '16px', margin: '16px 0 0 0' }}>
            Última atualização: {formatDate(cacheStats.lastUpdated)}
          </p>
        </div>
      )}
    </div>
  );
};

export default CacheManagement;