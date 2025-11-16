import { useState, useEffect } from 'react';

import { 
  FileText, 
  AlertTriangle, 
  Info, 
  Shield, 
  Users, 
  Download,
  Search,
  Filter,
  Calendar,
  Clock,
  User,
  Building2,
  Eye,
  EyeOff
} from 'lucide-react';
import api from '../config/axios';
import { useDebounce } from '@/hooks/useDebounce';

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG' | 'AUDIT';
  category: string;
  message: string;
  userId?: string;
  userEmail?: string;
  userProfile?: string;
  companyId?: string;
  companyName?: string;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  action?: string;
  resource?: string;
  details?: any;
}

interface LogStats {
  totalLogs: number;
  logsToday: number;
  logsThisWeek: number;
  logsThisMonth: number;
  byLevel: {
    INFO: number;
    WARN: number;
    ERROR: number;
    DEBUG: number;
    AUDIT: number;
  };
  byCategory: {
    [key: string]: number;
  };
  topUsers: Array<{
    email: string;
    count: number;
  }>;
  topCompanies: Array<{
    name: string;
    count: number;
  }>;
}

const SystemLogs = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [stats, setStats] = useState<LogStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    level: '',
    category: '',
    dateFrom: '',
    dateTo: '',
    search: '',
    userId: '',
    companyId: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0
  });
  const [showDetails, setShowDetails] = useState<Set<string>>(new Set());
  
  // Debounce do filtro de busca para aplicar automaticamente após 500ms
  const debouncedSearch = useDebounce(filters.search, 500);

  // Buscar logs do sistema
  const fetchLogs = async () => {
    try {
      setIsLoading(true);
      console.log('🔍 Buscando logs do sistema...');
      
      // Construir parâmetros apenas com valores não vazios
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString()
      });
      
      // Adicionar filtros apenas se não estiverem vazios
      if (filters.level && filters.level.trim() !== '') {
        params.append('level', filters.level);
      }
      if (filters.category && filters.category.trim() !== '') {
        params.append('category', filters.category);
      }
      if (filters.dateFrom && filters.dateFrom.trim() !== '') {
        params.append('dateFrom', filters.dateFrom);
      }
      if (filters.dateTo && filters.dateTo.trim() !== '') {
        params.append('dateTo', filters.dateTo);
      }
      const searchValue = debouncedSearch || filters.search;
      if (searchValue && searchValue.trim() !== '') {
        params.append('search', searchValue);
      }
      if (filters.userId && filters.userId.trim() !== '') {
        params.append('userId', filters.userId);
      }
      if (filters.companyId && filters.companyId.trim() !== '') {
        params.append('companyId', filters.companyId);
      }

      console.log('🔍 Parâmetros da busca:', params.toString());
      console.log('🔍 URL da API:', `/admin/logs?${params}`);

      const response = await api.get(`/admin/logs?${params}`);
      console.log('📡 Resposta da API:', response);
      
      if (response.data.success) {
        console.log('✅ Logs recebidos com sucesso:', response.data.data);
        console.log('📊 Total de logs:', response.data.data.total);
        console.log('📋 Logs retornados:', response.data.data.logs.length);
        setLogs(response.data.data.logs || []);
        setPagination(prev => ({
          ...prev,
          total: response.data.data.total || 0
        }));
      } else {
        console.error('❌ API retornou erro:', response.data);
        setLogs([]);
        setPagination(prev => ({ ...prev, total: 0 }));
      }
    } catch (error: any) {
      console.error('❌ Erro ao buscar logs:', error);
      console.error('❌ Detalhes do erro:', error.response?.data || error.message);
      setLogs([]);
      setPagination(prev => ({ ...prev, total: 0 }));
    } finally {
      setIsLoading(false);
    }
  };

  // Buscar estatísticas dos logs
  const fetchLogStats = async () => {
    try {
      console.log('📊 Buscando estatísticas dos logs...');
      const response = await api.get('/admin/logs/stats');
      console.log('📡 Resposta das estatísticas:', response);
      
      if (response.data.success) {
        console.log('✅ Estatísticas recebidas com sucesso:', response.data.data);
        setStats(response.data.data);
      } else {
        console.error('❌ API de estatísticas retornou erro:', response.data);
      }
    } catch (error) {
      console.error('❌ Erro ao buscar estatísticas dos logs:', error);
    }
  };

  // Exportar logs
  const exportLogs = async (format: 'csv' | 'json') => {
    try {
      const params = new URLSearchParams({
        format,
        ...filters
      });
      
      const response = await api.get(`/admin/logs/export?${params}`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `system-logs-${new Date().toISOString().split('T')[0]}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao exportar logs:', error);
    }
  };

  // Alternar visibilidade dos detalhes
  const toggleDetails = (logId: string) => {
    const newShowDetails = new Set(showDetails);
    if (newShowDetails.has(logId)) {
      newShowDetails.delete(logId);
    } else {
      newShowDetails.add(logId);
    }
    setShowDetails(newShowDetails);
  };

  // Aplicar filtros
  const applyFilters = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchLogs();
  };

  // Aplicar filtros automaticamente quando o debouncedSearch mudar
  useEffect(() => {
    // Só aplicar se houver mudança no debouncedSearch e não estiver no carregamento inicial
    // Evitar aplicar no carregamento inicial (quando debouncedSearch é igual ao valor inicial)
    if (debouncedSearch !== undefined && debouncedSearch !== filters.search) {
      applyFilters();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  // Limpar filtros
  const clearFilters = () => {
    setFilters({
      level: '',
      category: '',
      dateFrom: '',
      dateTo: '',
      search: '',
      userId: '',
      companyId: ''
    });
    setPagination(prev => ({ ...prev, page: 1 }));
    // Buscar logs sem filtros após limpar
    setTimeout(() => {
      fetchLogs();
    }, 0);
  };

  useEffect(() => {
    fetchLogs();
    fetchLogStats();
  }, [pagination.page, pagination.limit]);

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'ERROR': return 'text-red-600 bg-red-50 border-red-200';
      case 'WARN': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'INFO': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'DEBUG': return 'text-gray-600 bg-gray-50 border-gray-200';
      case 'AUDIT': return 'text-purple-600 bg-purple-50 border-purple-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'ERROR': return <AlertTriangle className="h-4 w-4" />;
      case 'WARN': return <AlertTriangle className="h-4 w-4" />;
      case 'INFO': return <Info className="h-4 w-4" />;
      case 'DEBUG': return <FileText className="h-4 w-4" />;
      case 'AUDIT': return <Shield className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8fafc' }}>
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <div className="p-3 rounded-lg mr-4" style={{ backgroundColor: '#ffc9c0' }}>
              <FileText className="h-8 w-8" style={{ color: '#1d335b' }} />
            </div>
            <div>
              <h1 className="text-3xl font-bold" style={{ color: '#1d335b' }}>
                Logs do Sistema
              </h1>
              <p className="text-gray-600 mt-1">
                Monitoramento completo e auditoria de todas as atividades do sistema
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
                  <strong>Auditoria:</strong> Todos os logs são mantidos para fins de auditoria e conformidade. 
                  As informações são confidenciais e devem ser tratadas com segurança.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Estatísticas dos Logs */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6">
              <div className="flex items-center">
                <div className="p-2 rounded-lg mr-3" style={{ backgroundColor: '#ffc9c0' }}>
                  <FileText className="h-5 w-5" style={{ color: '#1d335b' }} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total de Logs</p>
                  <p className="text-2xl font-semibold" style={{ color: '#1d335b' }}>
                    {stats.totalLogs.toLocaleString('pt-BR')}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6">
              <div className="flex items-center">
                <div className="p-2 rounded-lg mr-3" style={{ backgroundColor: '#ffc9c0' }}>
                  <Clock className="h-5 w-5" style={{ color: '#1d335b' }} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Logs Hoje</p>
                  <p className="text-2xl font-semibold" style={{ color: '#1d335b' }}>
                    {stats.logsToday.toLocaleString('pt-BR')}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6">
              <div className="flex items-center">
                <div className="p-2 rounded-lg mr-3" style={{ backgroundColor: '#ffc9c0' }}>
                  <AlertTriangle className="h-5 w-5" style={{ color: '#1d335b' }} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Erros Hoje</p>
                  <p className="text-2xl font-semibold" style={{ color: '#1d335b' }}>
                    {stats.byLevel.ERROR.toLocaleString('pt-BR')}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6">
              <div className="flex items-center">
                <div className="p-2 rounded-lg mr-3" style={{ backgroundColor: '#ffc9c0' }}>
                  <Users className="h-5 w-5" style={{ color: '#1d335b' }} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Usuários Ativos</p>
                  <p className="text-2xl font-semibold" style={{ color: '#1d335b' }}>
                    {stats.topUsers.length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Filtros de Busca</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nível</label>
              <select
                value={filters.level}
                onChange={(e) => setFilters(prev => ({ ...prev, level: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-10"
              >
                <option value="">Todos os níveis</option>
                <option value="INFO">INFO</option>
                <option value="WARN">WARN</option>
                <option value="ERROR">ERROR</option>
                <option value="DEBUG">DEBUG</option>
                <option value="AUDIT">AUDIT</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Categoria</label>
              <select
                value={filters.category}
                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-10"
              >
                <option value="">Todas as categorias</option>
                <option value="AUTH">Autenticação</option>
                <option value="USER">Usuários</option>
                <option value="COMPANY">Empresas</option>
                <option value="UPLOAD">Upload</option>
                <option value="SYSTEM">Sistema</option>
                <option value="SECURITY">Segurança</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Data Inicial</label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-10"
                style={{ borderColor: '#c9504c' }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Data Final</label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-10"
                style={{ borderColor: '#c9504c' }}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Buscar</label>
              <input
                type="text"
                placeholder="Buscar por mensagem, usuário ou empresa..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-10"
              />
            </div>

            <div className="flex items-end space-x-2">
              <button
                onClick={applyFilters}
                className="px-4 py-2 text-white rounded-md transition-colors h-10"
                style={{ backgroundColor: '#1d335b' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2a4a7a'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1d335b'}
              >
                <Search className="h-4 w-4 inline mr-2" />
                Aplicar
              </button>
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-white rounded-md transition-colors h-10"
                style={{ backgroundColor: '#c9504c' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#d65a56'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#c9504c'}
              >
                <Filter className="h-4 w-4 inline mr-2" />
                Limpar
              </button>
            </div>
          </div>
        </div>

        {/* Ações */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Logs do Sistema</h3>
            <p className="text-sm text-gray-600">
              Mostrando {logs.length} de {pagination.total} logs
            </p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => exportLogs('csv')}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              <Download className="h-4 w-4 inline mr-2" />
              Exportar CSV
            </button>
            <button
              onClick={() => exportLogs('json')}
              className="px-4 py-2 bg-gray-400 text-white rounded-md hover:bg-gray-500 transition-colors"
            >
              <Download className="h-4 w-4 inline mr-2" />
              Exportar JSON
            </button>
          </div>
        </div>

        {/* Lista de Logs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Carregando logs...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="p-8 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Nenhum log encontrado com os filtros aplicados</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Timestamp
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nível
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Categoria
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mensagem
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usuário
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Empresa
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                          {new Date(log.timestamp).toLocaleString('pt-BR')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getLevelColor(log.level)}`}>
                          {getLevelIcon(log.level)}
                          <span className="ml-1">{log.level}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {log.category}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                        {log.message}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {log.userEmail ? (
                          <div className="flex items-center">
                            <User className="h-4 w-4 text-gray-400 mr-2" />
                            <div>
                              <div className="font-medium">{log.userEmail}</div>
                              <div className="text-xs text-gray-500">{log.userProfile}</div>
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {log.companyName ? (
                          <div className="flex items-center">
                            <Building2 className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="truncate max-w-32">{log.companyName}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => toggleDetails(log.id)}
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                        >
                          {showDetails.has(log.id) ? (
                            <Eye className="h-4 w-4" />
                          ) : (
                            <EyeOff className="h-4 w-4" />
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Detalhes dos Logs */}
        {logs.map((log) => (
          showDetails.has(log.id) && (
            <div key={`details-${log.id}`} className="mt-4 bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h4 className="font-medium text-gray-900 mb-3">Detalhes do Log</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>ID da Sessão:</strong> {log.sessionId || '-'}
                </div>
                <div>
                  <strong>Endereço IP:</strong> {log.ipAddress || '-'}
                </div>
                <div>
                  <strong>User Agent:</strong> {log.userAgent || '-'}
                </div>
                <div>
                  <strong>Ação:</strong> {log.action || '-'}
                </div>
                <div>
                  <strong>Recurso:</strong> {log.resource || '-'}
                </div>
                <div className="md:col-span-2">
                  <strong>Detalhes Adicionais:</strong>
                  <pre className="mt-2 p-2 bg-white rounded border text-xs overflow-x-auto">
                    {log.details ? JSON.stringify(log.details, null, 2) : '-'}
                  </pre>
                </div>
              </div>
            </div>
          )
        ))}

        {/* Paginação */}
        {pagination.total > pagination.limit && (
          <div className="mt-6 flex justify-between items-center">
            <div className="text-sm text-gray-700">
              Mostrando {((pagination.page - 1) * pagination.limit) + 1} a{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} de{' '}
              {pagination.total} resultados
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page === 1}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              <span className="px-3 py-2 text-sm text-gray-700">
                Página {pagination.page} de {Math.ceil(pagination.total / pagination.limit)}
              </span>
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page >= Math.ceil(pagination.total / pagination.limit)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Próxima
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SystemLogs;
