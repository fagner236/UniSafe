import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { User, Shield, Save, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';


const Profile = () => {
  const { user, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Inicializar dados do formulário quando o usuário carregar
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.nome || '',
        email: user.email || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      // Validações
      if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
        setMessage({ type: 'error', text: 'As senhas não coincidem' });
        setIsLoading(false);
        return;
      }

      if (formData.newPassword && formData.newPassword.length < 6) {
        setMessage({ type: 'error', text: 'A nova senha deve ter pelo menos 6 caracteres' });
        setIsLoading(false);
        return;
      }

      // Preparar dados para envio
      const updateData: any = {};
      if (formData.name !== user?.nome) updateData.nome = formData.name;
      if (formData.email !== user?.email) updateData.email = formData.email;
      if (formData.newPassword) {
        updateData.currentPassword = formData.currentPassword;
        updateData.newPassword = formData.newPassword;
      }

      // Se não há alterações, não enviar requisição
      if (Object.keys(updateData).length === 0) {
        setMessage({ type: 'error', text: 'Nenhuma alteração foi feita' });
        setIsLoading(false);
        return;
      }

      const token = localStorage.getItem('token');
      const response = await fetch('${config.apiUrl}/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });

      const result = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' });
        
        // Limpar campos de senha
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }));

        // Atualizar dados do usuário no contexto
        if (user) {
          // Atualizar o contexto com os novos dados
          // Aqui você pode implementar uma função para atualizar o contexto
          // Por enquanto, vamos manter o modo de edição ativo para permitir mais alterações
          // setIsEditing(false); // Comentado para permitir edição contínua
        }
        
        // Redirecionar para login se a senha foi alterada
        if (formData.newPassword) {
          setTimeout(() => {
            logout();
          }, 2000);
        }
      } else {
        setMessage({ type: 'error', text: result.message || 'Erro ao atualizar perfil' });
      }
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      setMessage({ type: 'error', text: 'Erro interno do servidor' });
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleCancel = () => {
    setIsEditing(false);
    setMessage(null);
    // Restaurar dados originais
    setFormData({
      name: user?.nome || '',
      email: user?.email || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  const handleFinishEditing = () => {
    setIsEditing(false);
    // Manter a mensagem de sucesso se existir
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Perfil</h1>
        <p className="text-gray-600">Gerencie suas informações pessoais</p>
      </div>

      {/* Mensagens de feedback */}
      {message && (
        <div className={`p-4 rounded-lg border ${
          message.type === 'success' 
            ? 'bg-green-50 border-green-200 text-green-800' 
            : 'bg-red-50 text-red-800'
        }`} style={message.type === 'error' ? { borderColor: '#c9504c' } : {}}>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Info */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Informações Pessoais</h3>
            </div>
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nome Completo
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#c9504c] focus:border-[#c9504c] disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      E-mail
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      disabled={!isEditing}
                      autoComplete="email"
                      autoCorrect="off"
                      autoCapitalize="off"
                      spellCheck="false"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#c9504c] focus:border-[#c9504c] disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>
                </div>

                {isEditing && (
                  <div className="space-y-4 pt-4 border-t border-gray-200">
                    <h4 className="text-md font-medium text-gray-900 flex items-center">
                      <Shield className="h-4 w-4 mr-2" />
                      Alterar Senha
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Senha Atual
                        </label>
                        <div className="relative">
                          <input
                            type={showPasswords.current ? "text" : "password"}
                            value={formData.currentPassword}
                            onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#c9504c] focus:border-[#c9504c]"
                            placeholder="Digite sua senha atual"
                            autoComplete="current-password"
                          />
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility('current')}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                          >
                            {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nova Senha
                        </label>
                        <div className="relative">
                          <input
                            type={showPasswords.new ? "text" : "password"}
                            value={formData.newPassword}
                            onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#c9504c] focus:border-[#c9504c]"
                            placeholder="Mínimo 6 caracteres"
                            autoComplete="new-password"
                          />
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility('new')}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                          >
                            {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Confirmar Nova Senha
                        </label>
                        <div className="relative">
                          <input
                            type={showPasswords.confirm ? "text" : "password"}
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#c9504c] focus:border-[#c9504c]"
                            placeholder="Confirme a nova senha"
                            autoComplete="new-password"
                          />
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility('confirm')}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                          >
                            {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-600 p-3 rounded-md border" style={{ backgroundColor: '#ffe8e6', borderColor: '#c9504c' }}>
                      <p><strong>Dica:</strong> Para alterar apenas o nome ou email, deixe os campos de senha em branco.</p>
                      <p className="mt-1">Após alterar a senha, você será redirecionado para fazer login novamente.</p>
                    </div>
                  </div>
                )}

                <div className="flex space-x-3 pt-4">
                  {isEditing ? (
                    <>
                      <button 
                        type="submit" 
                        disabled={isLoading}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ backgroundColor: '#c9504c' }}
                      >
                        {isLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Salvando...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Salvar Alterações
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={handleFinishEditing}
                        disabled={isLoading}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#c9504c] disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Finalizar Edição
                      </button>
                      <button
                        type="button"
                        onClick={handleCancel}
                        disabled={isLoading}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#c9504c] disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Cancelar
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      style={{ backgroundColor: '#c9504c' }}
                    >
                      Editar Perfil
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Profile Summary */}
        <div className="space-y-6">
          <div className="bg-white shadow rounded-lg border border-gray-200">
            <div className="p-6">
              <div className="text-center">
                <div className="mx-auto h-20 w-20 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: '#c9504c' }}>
                  <User className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">{user?.nome}</h3>
                <p className="text-sm text-gray-500">{user?.email}</p>
                <div className="mt-4 flex items-center justify-center space-x-2">
                  <Shield className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-500 capitalize">{user?.perfil}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Estatísticas</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Membro desde</span>
                  <span className="text-sm font-medium text-gray-900">
                    {user?.data_criacao ? new Date(user.data_criacao).toLocaleDateString('pt-BR') + ' às ' + new Date(user.data_criacao).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '-'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Último acesso</span>
                  <span className="text-sm font-medium text-gray-900">Hoje</span>
                </div>
              </div>
            </div>
          </div>
        </div>


      </div>
    </div>
  );
};

export default Profile;
