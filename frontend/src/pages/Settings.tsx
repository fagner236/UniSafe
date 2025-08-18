import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Users, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  Shield, 
  User, 
  Building2, 
  AlertCircle, 
  CheckCircle,
  Search
} from 'lucide-react';
import api from '../config/axios';

interface CompanyUser {
  id_usuario: string;
  nome: string;
  email: string;
  perfil: 'admin' | 'user' | 'ghost';
  data_criacao: string;
  data_atualizacao: string;
}

const Settings = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<CompanyUser[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    nome: '',
    email: '',
    perfil: 'ghost' as 'admin' | 'user' | 'ghost'
  });
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // Carregar usuários da empresa
  const loadUsers = async () => {
    try {
      setIsLoading(true);
      console.log('🔍 Tentando carregar usuários...');
      console.log('🔑 Token no localStorage:', localStorage.getItem('token') ? 'Existe' : 'Não existe');
      
      const response = await api.get('/api/users/company');
      console.log('📡 Resposta da API:', response.data);
      
      if (response.data.success) {
        setUsers(response.data.data);
        setTotalUsers(response.data.totalUsers || 0);
        console.log('✅ Usuários carregados com sucesso. Total:', response.data.totalUsers);
      } else {
        setMessage({ type: 'error', text: 'Erro ao carregar usuários' });
        console.log('❌ Erro na resposta da API');
      }
    } catch (error: any) {
      console.error('❌ Erro ao carregar usuários:', error);
      console.error('❌ Status da resposta:', error.response?.status);
      console.error('❌ Dados da resposta:', error.response?.data);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Erro ao carregar usuários' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // Iniciar edição de usuário
  const startEditing = (user: CompanyUser) => {
    setEditingUser(user.id_usuario);
    setEditForm({
      nome: user.nome,
      email: user.email,
      perfil: user.perfil
    });
  };

  // Cancelar edição
  const cancelEditing = () => {
    setEditingUser(null);
    setEditForm({ nome: '', email: '', perfil: 'ghost' });
  };

  // Salvar alterações do usuário
  const saveUser = async (userId: string) => {
    try {
      const response = await api.put(`/api/users/${userId}`, editForm);
      
      if (response.data.success) {
        setMessage({ type: 'success', text: 'Usuário atualizado com sucesso!' });
        setEditingUser(null);
        setEditForm({ nome: '', email: '', perfil: 'ghost' });
        loadUsers(); // Recarregar lista e total
      } else {
        setMessage({ type: 'error', text: 'Erro ao atualizar usuário' });
      }
    } catch (error: any) {
      console.error('Erro ao atualizar usuário:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Erro ao atualizar usuário' 
      });
    }
  };

  // Remover usuário
  const deleteUser = async (userId: string) => {
    if (!confirm('Tem certeza que deseja remover este usuário? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      setIsDeleting(userId);
      const response = await api.delete(`/api/users/${userId}`);
      
      if (response.data.success) {
        setMessage({ type: 'success', text: 'Usuário removido com sucesso!' });
        loadUsers(); // Recarregar lista e total
      } else {
        setMessage({ type: 'error', text: 'Erro ao remover usuário' });
      }
    } catch (error: any) {
      console.error('Erro ao remover usuário:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Erro ao remover usuário' 
      });
    } finally {
      setIsDeleting(null);
    }
  };

  // Filtrar usuários por busca e ordenar alfabeticamente pelo nome
  const filteredUsers = users
    .filter(user => 
      user.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.perfil.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR', { sensitivity: 'base' }));

  // Formatar data
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Verificar se pode editar/remover usuário
  const canModifyUser = (targetUser: CompanyUser) => {
    // Não pode modificar a si mesmo
    if (targetUser.id_usuario === user?.id_usuario) {
      return false;
    }
    
    // Não pode modificar outros admins se for o único admin
    if (targetUser.perfil === 'admin') {
      const adminCount = users.filter(u => u.perfil === 'admin').length;
      return adminCount > 1;
    }
    
    // Usuários ghost podem ser modificados por admins
    if (targetUser.perfil === 'ghost') {
      return true;
    }
    
    return true;
  };

  if (!user || user.perfil !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Shield className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Acesso Negado</h2>
          <p className="text-gray-600">Apenas administradores podem acessar esta página.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
        <p className="text-gray-600">Gerencie usuários e configurações da empresa</p>
      </div>

      {/* Mensagens de feedback */}
      {message && (
        <div className={`p-4 rounded-lg border ${
          message.type === 'success' 
            ? 'bg-green-50 border-green-200 text-green-800' 
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <div className="flex items-center">
            {message.type === 'success' ? (
              <CheckCircle className="h-5 w-5 mr-2" />
            ) : (
              <AlertCircle className="h-5 w-5 mr-2" />
            )}
            {message.text}
          </div>
        </div>
      )}

      {/* Informações da empresa */}
      <div className="bg-white shadow rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <Building2 className="h-5 w-5 mr-2" />
            Informações da Empresa
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome Fantasia
              </label>
              <p className="text-gray-900">{user.empresa?.nome_fantasia || 'Não informado'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Razão Social
              </label>
              <p className="text-gray-900">{user.empresa?.razao_social}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CNPJ
              </label>
              <p className="text-gray-900">{user.empresa?.cnpj}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total de Usuários da Empresa
              </label>
              <p className="text-gray-900">{totalUsers}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Gerenciamento de Usuários */}
      <div className="bg-white shadow rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Gerenciar Usuários da Empresa
          </h3>
        </div>
        <div className="p-6">
          {/* Barra de busca */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar usuários por nome, email ou perfil..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#c9504c] focus:border-[#c9504c]"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#c9504c] mx-auto"></div>
              <p className="text-gray-500 mt-2">Carregando usuários...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500">
                {searchTerm ? 'Nenhum usuário encontrado para esta busca.' : 'Nenhum usuário encontrado.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usuário
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Perfil
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data de Criação
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((userItem) => (
                    <tr key={userItem.id_usuario} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {userItem.nome}
                          </div>
                          <div className="text-sm text-gray-500">
                            {userItem.email}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          userItem.perfil === 'admin' 
                            ? 'bg-purple-100 text-purple-800' 
                            : userItem.perfil === 'ghost'
                            ? 'bg-gray-100 text-gray-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {userItem.perfil === 'admin' ? (
                            <Shield className="h-3 w-3 mr-1" />
                          ) : userItem.perfil === 'ghost' ? (
                            <User className="h-3 w-3 mr-1" />
                          ) : (
                            <User className="h-3 w-3 mr-1" />
                          )}
                          {userItem.perfil === 'admin' ? 'Admin' : userItem.perfil === 'ghost' ? 'Ghost' : 'User'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(userItem.data_criacao)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {editingUser === userItem.id_usuario ? (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => saveUser(userItem.id_usuario)}
                              className="text-green-600 hover:text-green-900"
                            >
                              <Save className="h-4 w-4" />
                            </button>
                            <button
                              onClick={cancelEditing}
                              className="text-gray-600 hover:text-gray-900"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex space-x-2">
                            {canModifyUser(userItem) && (
                              <>
                                <button
                                  onClick={() => startEditing(userItem)}
                                  className="text-blue-600 hover:text-blue-900"
                                  title="Editar usuário"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => deleteUser(userItem.id_usuario)}
                                  disabled={isDeleting === userItem.id_usuario}
                                  className="text-red-600 hover:text-red-900 disabled:opacity-50"
                                  title="Remover usuário"
                                >
                                  {isDeleting === userItem.id_usuario ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                                  ) : (
                                    <Trash2 className="h-4 w-4" />
                                  )}
                                </button>
                              </>
                            )}
                            {!canModifyUser(userItem) && (
                              <span className="text-gray-400 text-xs">
                                {userItem.id_usuario === user?.id_usuario 
                                  ? 'Você mesmo' 
                                  : userItem.perfil === 'admin'
                                  ? 'Único admin'
                                  : 'Sem permissão'
                                }
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Edição */}
      {editingUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 w-96 shadow-lg rounded-md bg-white" style={{ border: '2px solid #c9504c' }}>
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Editar Usuário</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    value={editForm.nome}
                    onChange={(e) => setEditForm({ ...editForm, nome: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#c9504c] focus:border-[#c9504c] text-base"
                    style={{ height: '42px' }}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    E-mail
                  </label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#c9504c] focus:border-[#c9504c] text-base"
                    style={{ height: '42px' }}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Perfil
                  </label>
                  <select
                    value={editForm.perfil}
                    onChange={(e) => setEditForm({ ...editForm, perfil: e.target.value as 'admin' | 'user' | 'ghost' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#c9504c] focus:border-[#c9504c] text-base"
                    style={{ 
                      height: '42px',
                      backgroundColor: 'white',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="user" className="py-2">User</option>
                    <option value="admin" className="py-2">Admin</option>
                    <option value="ghost" className="py-2">Ghost</option>
                  </select>
                </div>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => saveUser(editingUser)}
                  className="flex-1 bg-[#c9504c] text-white py-2 px-4 rounded-md hover:bg-[#b03d3a] focus:outline-none focus:ring-2 focus:ring-[#c9504c] focus:ring-offset-2"
                >
                  Salvar
                </button>
                <button
                  onClick={cancelEditing}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
