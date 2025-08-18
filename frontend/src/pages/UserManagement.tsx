import { useState, useEffect } from 'react';
import { 
  Search, 
  Download, 
  Eye, 
  Edit, 
  Trash, 
  Filter, 
  ChevronUp, 
  ChevronDown,
  Plus,
  Users,
  Shield,
  User,
  Ghost,
  Calendar,
  Mail,
  Building2,
  Lock,
  AlertTriangle,
  XCircle
} from 'lucide-react';
import api from '@/config/axios';
import { useAuth } from '@/contexts/AuthContext';

interface User {
  id_usuario: string;
  nome: string;
  email: string;
  perfil: 'admin' | 'user' | 'ghost';
  data_criacao: string;
  data_atualizacao: string;
  id_empresa?: string;
  empresa?: {
    razao_social: string;
    nome_fantasia?: string;
    cnpj: string;
  };
}

interface UserStats {
  totalUsers: number;
  adminUsers: number;
  userUsers: number;
  ghostUsers: number;
  newUsersThisMonth: number;
  lastActivity: string;
}

interface UserFilters {
  search: string;
  profile: string;
  status: string;
  dateFrom: string;
  dateTo: string;
  company: string;
}

const UserManagement = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<UserFilters>({
    search: '',
    profile: '',
    status: '',
    dateFrom: '',
    dateTo: '',
    company: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortColumn, setSortColumn] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  // Estados dos modais
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    perfil: 'user' as 'admin' | 'user' | 'ghost'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Buscar usuários
  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      
      console.log('🔍 === UserManagement: fetchUsers iniciado ===');
      console.log('🔍 Usuário logado:', user);
      console.log('🔍 ID da empresa do usuário:', user?.id_empresa);
      console.log('🔍 Perfil do usuário:', user?.perfil);
      
      // UserManagement é acessado pelo link Sistema, então sempre usa a rota system
      // (apenas admins podem acessar)
      const response = await api.get('/api/users/system');
      console.log('📡 Resposta da API /api/users/system:', response.data);
      
      if (response.data.success) {
        setUsers(response.data.data);
        console.log('✅ Usuários carregados:', response.data.data.length);
        
        // Atualizar estatísticas
        setStats({
          totalUsers: response.data.totalUsers,
          adminUsers: response.data.data.filter((u: User) => u.perfil === 'admin').length,
          userUsers: response.data.data.filter((u: User) => u.perfil === 'user').length,
          ghostUsers: response.data.data.filter((u: User) => u.perfil === 'ghost').length,
          newUsersThisMonth: response.data.data.filter((u: User) => {
            const userDate = new Date(u.data_criacao);
            const now = new Date();
            return userDate.getMonth() === now.getMonth() && userDate.getFullYear() === now.getFullYear();
          }).length,
          lastActivity: new Date().toISOString()
        });
      } else {
        console.log('❌ Resposta da API não foi bem-sucedida:', response.data);
      }
    } catch (error: any) {
      console.error('❌ Erro ao buscar usuários:', error);
      console.error('❌ Status da resposta:', error.response?.status);
      console.error('❌ Dados da resposta:', error.response?.data);
    } finally {
      setIsLoading(false);
    }
  };

  // Buscar estatísticas
  const fetchStats = async () => {
    try {
      const response = await api.get('/api/users/stats');
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, []);

  // Função para ordenar dados
  const sortData = (data: User[], column: string, direction: 'asc' | 'desc') => {
    return [...data].sort((a, b) => {
      let valueA = (a as any)[column];
      let valueB = (b as any)[column];

      if (typeof valueA === 'string' && typeof valueB === 'string') {
        const comparison = valueA.localeCompare(valueB, 'pt-BR', { numeric: true });
        return direction === 'asc' ? comparison : -comparison;
      }

      const strA = String(valueA || '');
      const strB = String(valueB || '');
      const comparison = strA.localeCompare(strB, 'pt-BR', { numeric: true });
      return direction === 'asc' ? comparison : -comparison;
    });
  };

  // Função para lidar com ordenação
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  // Filtrar usuários
  const filteredUsers = users.filter(userItem => {
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      if (!userItem.nome.toLowerCase().includes(searchLower) && 
          !userItem.email.toLowerCase().includes(searchLower) &&
          !(userItem.empresa?.razao_social?.toLowerCase().includes(searchLower) || 
            userItem.empresa?.nome_fantasia?.toLowerCase().includes(searchLower))) {
        return false;
      }
    }

    if (filters.profile && userItem.perfil !== filters.profile) {
      return false;
    }

    if (filters.company && userItem.empresa?.cnpj !== filters.company) {
      return false;
    }

    if (filters.dateFrom || filters.dateTo) {
      const userDate = new Date(userItem.data_criacao);
      if (filters.dateFrom && userDate < new Date(filters.dateFrom)) {
        return false;
      }
      if (filters.dateTo && userDate > new Date(filters.dateTo)) {
        return false;
      }
    }

    return true;
  });

  // Aplicar ordenação
  const sortedUsers = sortColumn 
    ? sortData(filteredUsers, sortColumn, sortDirection)
    : filteredUsers;

  // Paginação
  const totalPages = Math.ceil(sortedUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUsers = sortedUsers.slice(startIndex, endIndex);

  // Limpar filtros
  const clearFilters = () => {
    setFilters({
      search: '',
      profile: '',
      status: '',
      dateFrom: '',
      dateTo: '',
      company: ''
    });
    setCurrentPage(1);
  };

  // Aplicar filtros
  const applyFilters = () => {
    setCurrentPage(1);
  };



  // Editar usuário
  const handleEditUser = async () => {
    if (!selectedUser) return;
    
    try {
      setIsSubmitting(true);
      const response = await api.put(`/api/users/${selectedUser.id_usuario}`, formData);
      
      if (response.data.success) {
        // Atualizar lista de usuários
        await fetchUsers();
        setShowEditModal(false);
        setSelectedUser(null);
        setFormData({ nome: '', email: '', perfil: 'user' });
        
        // Mostrar mensagem de sucesso
        alert('Usuário atualizado com sucesso!');
      }
    } catch (error: any) {
      console.error('Erro ao editar usuário:', error);
      const message = error.response?.data?.message || 'Erro ao editar usuário';
      alert(`Erro: ${message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Excluir usuário
  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    
    try {
      setIsSubmitting(true);
      const response = await api.delete(`/api/users/${selectedUser.id_usuario}`);
      
      if (response.data.success) {
        // Atualizar lista de usuários
        await fetchUsers();
        setShowDeleteModal(false);
        setSelectedUser(null);
        
        // Mostrar mensagem de sucesso
        alert('Usuário excluído com sucesso!');
      }
    } catch (error: any) {
      console.error('Erro ao excluir usuário:', error);
      const message = error.response?.data?.message || 'Erro ao excluir usuário';
      alert(`Erro: ${message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset de senha
  const handleResetPassword = async (userId: string) => {
    try {
      const response = await api.post(`/api/users/${userId}/reset-password`);
      
      if (response.data.success) {
        const newPassword = response.data.newPassword;
        alert(`Senha resetada com sucesso! Nova senha: ${newPassword}`);
      }
    } catch (error: any) {
      console.error('Erro ao resetar senha:', error);
      const message = error.response?.data?.message || 'Erro ao resetar senha';
      alert(`Erro: ${message}`);
    }
  };

  // Criar novo usuário
  const handleCreateUser = async () => {
    try {
      setIsSubmitting(true);
      const response = await api.post('/api/users', formData);
      
      if (response.data.success) {
        // Atualizar lista de usuários
        await fetchUsers();
        setShowCreateModal(false);
        setFormData({ nome: '', email: '', perfil: 'user' });
        
        // Mostrar mensagem de sucesso com senha temporária
        const tempPassword = response.data.tempPassword;
        alert(`Usuário criado com sucesso! Senha temporária: ${tempPassword}`);
      }
    } catch (error: any) {
      console.error('Erro ao criar usuário:', error);
      const message = error.response?.data?.message || 'Erro ao criar usuário';
      alert(`Erro: ${message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Função para obter ícone do perfil
  const getProfileIcon = (profile: string) => {
    switch (profile) {
      case 'admin': return <Shield className="h-4 w-4" />;
      case 'user': return <User className="h-4 w-4" />;
      case 'ghost': return <Ghost className="h-4 w-4" />;
      default: return <User className="h-4 w-4" />;
    }
  };

  // Função para obter cor do perfil
  const getProfileColor = (profile: string) => {
    switch (profile) {
      case 'admin': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'user': return 'text-green-600 bg-green-50 border-green-200';
      case 'ghost': return 'text-gray-600 bg-gray-50 border-gray-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  // Função para obter nome do perfil
  const getProfileName = (profile: string) => {
    switch (profile) {
      case 'admin': return 'Admin';
      case 'user': return 'User';
      case 'ghost': return 'Ghost';
      default: return profile;
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8fafc' }}>
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <div className="p-3 rounded-lg mr-4" style={{ backgroundColor: '#ffc9c0' }}>
              <Users className="h-8 w-8" style={{ color: '#1d335b' }} />
            </div>
            <div>
              <h1 className="text-3xl font-bold" style={{ color: '#1d335b' }}>
                Gestão de Usuários do Sistema (Admin)
              </h1>
              <p className="text-gray-600 mt-1">
                Gerencie todos os usuários de todas as empresas do sistema de forma centralizada e segura. Acesso restrito a administradores.
              </p>
            </div>
          </div>
          
          {/* Aviso de Segurança */}
          <div className="p-4 rounded-lg" style={{ backgroundColor: '#ffc9c0', borderLeft: '4px solid #c9504c' }}>
            <div className="flex">
              <div className="flex-shrink-0">
                <Shield className="h-5 w-5" style={{ color: '#1d335b' }} />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium" style={{ color: '#1d335b' }}>
                  <strong>Segurança:</strong> Todas as ações são registradas para auditoria. 
                  Esta página é restrita a administradores e mostra TODOS os usuários de TODAS as empresas do sistema para gestão completa.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Estatísticas */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6">
              <div className="flex items-center">
                <div className="p-2 rounded-lg mr-3" style={{ backgroundColor: '#ffc9c0' }}>
                  <Users className="h-5 w-5" style={{ color: '#1d335b' }} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total de Usuários de Todas as Empresas (Admin)
                  </p>
                  <p className="text-2xl font-semibold" style={{ color: '#1d335b' }}>
                    {stats.totalUsers.toLocaleString('pt-BR')}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6">
              <div className="flex items-center">
                <div className="p-2 rounded-lg mr-3" style={{ backgroundColor: '#ffc9c0' }}>
                  <Shield className="h-5 w-5" style={{ color: '#1d335b' }} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Admin de Todas as Empresas (Admin)
                  </p>
                  <p className="text-2xl font-semibold" style={{ color: '#1d335b' }}>
                    {stats.adminUsers.toLocaleString('pt-BR')}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6">
              <div className="flex items-center">
                <div className="p-2 rounded-lg mr-3" style={{ backgroundColor: '#ffc9c0' }}>
                  <User className="h-5 w-5" style={{ color: '#1d335b' }} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total User de Todas as Empresas (Admin)
                  </p>
                  <p className="text-2xl font-semibold" style={{ color: '#1d335b' }}>
                    {stats.userUsers.toLocaleString('pt-BR')}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6">
              <div className="flex items-center">
                <div className="p-2 rounded-lg mr-3" style={{ backgroundColor: '#ffc9c0' }}>
                  <Ghost className="h-5 w-5" style={{ color: '#1d335b' }} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Ghost de Todas as Empresas (Admin)
                  </p>
                  <p className="text-2xl font-semibold" style={{ color: '#1d335b' }}>
                    {stats.ghostUsers.toLocaleString('pt-BR')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Filtros de Busca</h3>
          
          {/* Primeira linha - Filtros principais */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Buscar (Nome, E-mail ou Empresa)</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Nome, e-mail ou empresa..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 h-10 transition-colors"
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = '#c9504c'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = '#d1d5db'}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Perfil</label>
              <select
                value={filters.profile}
                onChange={(e) => setFilters(prev => ({ ...prev, profile: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-10"
              >
                <option value="">Todos os perfis</option>
                <option value="admin">Admin</option>
                <option value="user">User</option>
                <option value="ghost">Ghost</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Empresa
              </label>
              <select
                value={filters.company}
                onChange={(e) => setFilters(prev => ({ ...prev, company: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-10"
              >
                <option value="">Todas as empresas</option>
                {Array.from(new Set(users.map(u => u.empresa?.cnpj).filter(Boolean)))
                  .map(cnpj => {
                    const userItem = users.find(u => u.empresa?.cnpj === cnpj);
                    return {
                      cnpj,
                      nomeFantasia: userItem?.empresa?.nome_fantasia || userItem?.empresa?.razao_social || ''
                    };
                  })
                  .filter(item => item.nomeFantasia)
                  .sort((a, b) => a.nomeFantasia.localeCompare(b.nomeFantasia, 'pt-BR'))
                  .map(({ cnpj, nomeFantasia }) => (
                    <option key={cnpj} value={cnpj}>
                      {nomeFantasia}
                    </option>
                  ))}
              </select>
            </div>
          </div>
          
          {/* Segunda linha - Datas, paginação e botões */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Data Inicial</label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 h-10 transition-colors"
                onMouseEnter={(e) => e.currentTarget.style.borderColor = '#c9504c'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = '#d1d5db'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Data Final</label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 h-10 transition-colors"
                onMouseEnter={(e) => e.currentTarget.style.borderColor = '#c9504c'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = '#d1d5db'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Itens por página</label>
              <select
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-10"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={applyFilters}
                className="px-4 py-2 text-white rounded-md transition-colors h-10 w-full"
                style={{ backgroundColor: '#1d335b' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2a4a7a'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1d335b'}
              >
                <Search className="h-4 w-4 inline mr-2" />
                Aplicar
              </button>
            </div>

            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-white rounded-md transition-colors h-10 w-full"
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

        {/* Header da Tabela */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Usuários de Todas as Empresas (Admin)
              </h3>
              <p className="text-sm text-gray-600">
                Mostrando {currentUsers.length} de {filteredUsers.length} usuários de todas as empresas do sistema. Acesso restrito a administradores.
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  setFormData({ nome: '', email: '', perfil: 'user' });
                  setShowCreateModal(true);
                }}
                className="px-4 py-2 text-white rounded-md transition-colors h-10"
                style={{ backgroundColor: '#1d335b' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2a4a7a'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1d335b'}
              >
                <Plus className="h-4 w-4 inline mr-2" />
                Novo Usuário
              </button>
              <button
                onClick={() => {/* TODO: Implementar exportação */}}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors h-10"
              >
                <Download className="h-4 w-4 inline mr-2" />
                Exportar
              </button>
            </div>
          </div>
        </div>

        {/* Tabela de Usuários */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Carregando usuários...</p>
            </div>
          ) : currentUsers.length === 0 ? (
            <div className="p-8 text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                Nenhum usuário encontrado em todas as empresas do sistema com os filtros aplicados. Acesso restrito a administradores.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort('nome')}
                    >
                      <div className="flex items-center justify-between">
                        <span>Nome</span>
                        <div className="flex flex-col ml-2">
                          {sortColumn === 'nome' ? (
                            sortDirection === 'asc' ? (
                              <ChevronUp className="h-3 w-3 text-red-600" />
                            ) : (
                              <ChevronDown className="h-3 w-3 text-red-600" />
                            )
                          ) : (
                            <div className="flex flex-col">
                              <ChevronUp className="h-3 w-3 text-gray-400" />
                              <ChevronDown className="h-3 w-3 text-gray-400" />
                            </div>
                          )}
                        </div>
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort('email')}
                    >
                      <div className="flex items-center justify-between">
                        <span>E-mail</span>
                        <div className="flex flex-col ml-2">
                          {sortColumn === 'email' ? (
                            sortDirection === 'asc' ? (
                              <ChevronUp className="h-3 w-3 text-red-600" />
                            ) : (
                              <ChevronDown className="h-3 w-3 text-red-600" />
                            )
                          ) : (
                            <div className="flex flex-col">
                              <ChevronUp className="h-3 w-3 text-gray-400" />
                              <ChevronDown className="h-3 w-3 text-gray-400" />
                            </div>
                          )}
                        </div>
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort('perfil')}
                    >
                      <div className="flex items-center justify-between">
                        <span>Perfil</span>
                        <div className="flex flex-col ml-2">
                          {sortColumn === 'perfil' ? (
                            sortDirection === 'asc' ? (
                              <ChevronUp className="h-3 w-3 text-red-600" />
                            ) : (
                              <ChevronDown className="h-3 w-3 text-red-600" />
                            )
                          ) : (
                            <div className="flex flex-col">
                              <ChevronUp className="h-3 w-3 text-gray-400" />
                              <ChevronDown className="h-3 w-3 text-gray-400" />
                            </div>
                          )}
                        </div>
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort('data_criacao')}
                    >
                      <div className="flex items-center justify-between">
                        <span>Data de Criação</span>
                        <div className="flex flex-col ml-2">
                          {sortColumn === 'data_criacao' ? (
                            sortDirection === 'asc' ? (
                              <ChevronUp className="h-3 w-3 text-red-600" />
                            ) : (
                              <ChevronDown className="h-3 w-3 text-red-600" />
                            )
                          ) : (
                            <div className="flex flex-col">
                              <ChevronUp className="h-3 w-3 text-gray-400" />
                              <ChevronDown className="h-3 w-3 text-gray-400" />
                            </div>
                          )}
                        </div>
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort('empresa')}
                    >
                      <div className="flex items-center justify-between">
                        <span>Empresa</span>
                        <div className="flex flex-col ml-2">
                          {sortColumn === 'empresa' ? (
                            sortDirection === 'asc' ? (
                              <ChevronUp className="h-3 w-3 text-red-600" />
                            ) : (
                              <ChevronDown className="h-3 w-3 text-red-600" />
                            )
                          ) : (
                            <div className="flex flex-col">
                              <ChevronUp className="h-3 w-3 text-gray-400" />
                              <ChevronDown className="h-3 w-3 text-gray-400" />
                            </div>
                          )}
                        </div>
                      </div>
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentUsers.map((user) => (
                    <tr key={user.id_usuario} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-700">
                                {user.nome.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{user.nome}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">{user.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getProfileColor(user.perfil)}`}>
                          {getProfileIcon(user.perfil)}
                          <span className="ml-1">{getProfileName(user.perfil)}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">
                            {new Date(user.data_criacao).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Building2 className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">
                            {user.empresa ? (
                              <div>
                                <div className="font-medium">{user.empresa.nome_fantasia || user.empresa.razao_social}</div>
                                <div className="text-xs text-gray-500">{user.empresa.cnpj}</div>
                              </div>
                            ) : (
                              <span className="text-gray-400">Sem empresa</span>
                            )}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                                                     <button 
                             className="text-blue-600 hover:text-blue-900"
                             title="Visualizar detalhes"
                             onClick={() => {
                               setSelectedUser(user);
                               // TODO: Implementar modal de visualização
                               console.log('Visualizar usuário:', user);
                             }}
                           >
                             <Eye className="h-4 w-4" />
                           </button>
                           <button 
                             className="text-green-600 hover:text-green-900"
                             title="Editar usuário"
                             onClick={() => {
                               setSelectedUser(user);
                               setFormData({
                                 nome: user.nome,
                                 email: user.email,
                                 perfil: user.perfil
                               });
                               setShowEditModal(true);
                             }}
                           >
                             <Edit className="h-4 w-4" />
                           </button>
                           <button 
                             className="text-red-600 hover:text-red-900"
                             title="Excluir usuário"
                             onClick={() => {
                               setSelectedUser(user);
                               setShowDeleteModal(true);
                             }}
                           >
                             <Trash className="h-4 w-4" />
                           </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Paginação */}
          {filteredUsers.length > 0 && (
            <div className="mt-6 flex items-center justify-between px-6 py-4 border-t border-gray-200">
              <div className="text-sm text-gray-700">
                Página {currentPage} de {totalPages} ({filteredUsers.length.toLocaleString('pt-BR')} usuários de todas as empresas - Admin)
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Primeira página"
                >
                  ««
                </button>
                
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Página anterior"
                >
                  «
                </button>
                
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNumber;
                    if (totalPages <= 5) {
                      pageNumber = i + 1;
                    } else if (currentPage <= 3) {
                      pageNumber = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNumber = totalPages - 4 + i;
                    } else {
                      pageNumber = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => setCurrentPage(pageNumber)}
                        className={`px-3 py-1 text-sm border rounded-md transition-colors ${
                          currentPage === pageNumber
                            ? 'text-white border-red-600'
                            : 'border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                        }`}
                        style={{
                          backgroundColor: currentPage === pageNumber ? '#c9504c' : undefined,
                          borderColor: currentPage === pageNumber ? '#c9504c' : undefined
                        }}
                      >
                        {pageNumber}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Próxima página"
                >
                  »
                </button>
                
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Última página"
                >
                  »»
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal de Criação */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Criar Novo Usuário
                  </h3>
                  <button
                    onClick={() => {
                      setShowCreateModal(false);
                      setFormData({ nome: '', email: '', perfil: 'user' });
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="h-6 w-6" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nome Completo *
                    </label>
                    <input
                      type="text"
                      value={formData.nome}
                      onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Nome completo do usuário"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      E-mail *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e-mail@exemplo.com"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Perfil *
                    </label>
                    <select
                      value={formData.perfil}
                      onChange={(e) => setFormData(prev => ({ ...prev, perfil: e.target.value as 'admin' | 'user' | 'ghost' }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="user">Usuário</option>
                      <option value="admin">Administrador</option>
                      <option value="ghost">Fantasma</option>
                    </select>
                  </div>
                  
                  <div className="bg-blue-50 p-3 rounded-md">
                    <p className="text-sm text-blue-700">
                      <strong>Nota:</strong> Uma senha temporária será gerada automaticamente e exibida após a criação.

                    </p>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2 mt-6">
                  <button
                    onClick={() => {
                      setShowCreateModal(false);
                      setFormData({ nome: '', email: '', perfil: 'user' });
                    }}
                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 font-medium"
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleCreateUser}
                    disabled={isSubmitting || !formData.nome || !formData.email}
                    className="px-4 py-2 text-sm text-white font-medium rounded-md transition-colors disabled:opacity-50"
                    style={{ backgroundColor: '#1d335b' }}
                    onMouseEnter={(e) => !e.currentTarget.disabled && (e.currentTarget.style.backgroundColor = '#2a4a7a')}
                    onMouseLeave={(e) => !e.currentTarget.disabled && (e.currentTarget.style.backgroundColor = '#1d335b')}
                  >
                    {isSubmitting ? 'Criando...' : 'Criar Usuário'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Edição */}
        {showEditModal && selectedUser && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white" style={{ borderColor: '#c9504c' }}>
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Editar Usuário
                  </h3>
                  <button
                    onClick={() => {
                      setShowEditModal(false);
                      setSelectedUser(null);
                      setFormData({ nome: '', email: '', perfil: 'user' });
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="h-6 w-6" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nome Completo
                    </label>
                    <input
                      type="text"
                      value={formData.nome}
                      onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
                      placeholder="Nome completo do usuário"
                      onFocus={(e) => e.currentTarget.style.borderColor = '#c9504c'}
                      onBlur={(e) => e.currentTarget.style.borderColor = '#d1d5db'}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      E-mail
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
                      placeholder="e-mail@exemplo.com"
                      onFocus={(e) => e.currentTarget.style.borderColor = '#c9504c'}
                      onBlur={(e) => e.currentTarget.style.borderColor = '#d1d5db'}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Perfil
                    </label>
                    <select
                      value={formData.perfil}
                      onChange={(e) => setFormData(prev => ({ ...prev, perfil: e.target.value as 'admin' | 'user' | 'ghost' }))}
                      className="w-full px-3 py-5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
                      onFocus={(e) => e.currentTarget.style.borderColor = '#c9504c'}
                      onBlur={(e) => e.currentTarget.style.borderColor = '#d1d5db'}
                    >
                      <option value="admin">Admin</option>
                      <option value="user">User</option>
                      <option value="ghost">Ghost</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex items-center justify-center mt-6 space-x-4">
                  <button
                    onClick={() => handleResetPassword(selectedUser.id_usuario)}
                    className="px-2 py-2 text-sm font-medium rounded-md transition-colors"
                    style={{ backgroundColor: '#ffc9c0', color: '#1d335b' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#ffd1c8'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffc9c0'}
                    title="Resetar senha"
                  >
                    Resetar Senha
                  </button>
                  
                  <button
                    onClick={handleEditUser}
                    disabled={isSubmitting}
                    className="px-1 py-2 text-sm text-white font-medium rounded-md transition-colors"
                    style={{ backgroundColor: '#1d335b' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2a4a7a'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1d335b'}
                  >
                    {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
                  </button>
                  
                  <button
                    onClick={() => {
                      setShowEditModal(false);
                      setSelectedUser(null);
                      setFormData({ nome: '', email: '', perfil: 'user' });
                    }}
                    className="px-4 py-4 text-sm text-white font-medium rounded-md transition-colors"
                    style={{ 
                      backgroundColor: '#c9504c',
                      paddingTop: '18px',
                      paddingBottom: '18px'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#d65a56'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#c9504c'}
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Exclusão */}
        {showDeleteModal && selectedUser && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-red-600">
                    Confirmar Exclusão
                  </h3>
                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setSelectedUser(null);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="h-6 w-6" />
                  </button>
                </div>
                
                <div className="mb-6">
                  <div className="flex items-center mb-4">
                    <AlertTriangle className="h-12 w-12 text-red-500 mr-3" />
                    <div>
                      <h4 className="text-lg font-medium text-gray-900">Atenção!</h4>
                      <p className="text-sm text-gray-600">Esta ação não pode ser desfeita.</p>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-md">
                    <p className="text-sm text-gray-700 mb-2">
                      <strong>Usuário:</strong> {selectedUser.nome}
                    </p>
                    <p className="text-sm text-gray-700 mb-2">
                      <strong>E-mail:</strong> {selectedUser.email}
                    </p>
                    <p className="text-sm text-gray-700 mb-2">
                      <strong>Perfil:</strong> {getProfileName(selectedUser.perfil)}
                    </p>
                    {selectedUser.empresa && (
                      <p className="text-sm text-gray-700">
                        <strong>Empresa:</strong> {selectedUser.empresa.nome_fantasia || selectedUser.empresa.razao_social}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setSelectedUser(null);
                    }}
                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 font-medium"
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleDeleteUser}
                    disabled={isSubmitting}
                    className="px-4 py-2 text-sm text-white font-medium rounded-md transition-colors"
                    style={{ backgroundColor: '#c9504c' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#d65a56'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#c9504c'}
                  >
                    {isSubmitting ? 'Excluindo...' : 'Confirmar Exclusão'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;
