import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { User, Shield, Save } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Implementar lógica de atualização do perfil
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Perfil</h1>
        <p className="text-gray-600">Gerencie suas informações pessoais</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Info */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900">Informações Pessoais</h3>
            </div>
            <div className="card-content">
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
                      className="input"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      disabled={!isEditing}
                      className="input"
                    />
                  </div>
                </div>

                {isEditing && (
                  <div className="space-y-4">
                    <h4 className="text-md font-medium text-gray-900">Alterar Senha</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Senha Atual
                        </label>
                        <input
                          type="password"
                          value={formData.currentPassword}
                          onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                          className="input"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nova Senha
                        </label>
                        <input
                          type="password"
                          value={formData.newPassword}
                          onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                          className="input"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Confirmar Nova Senha
                        </label>
                        <input
                          type="password"
                          value={formData.confirmPassword}
                          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                          className="input"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex space-x-3">
                  {isEditing ? (
                    <>
                      <button type="submit" className="btn btn-primary">
                        <Save className="h-4 w-4 mr-2" />
                        Salvar Alterações
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="btn btn-secondary"
                      >
                        Cancelar
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="btn btn-primary"
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
          <div className="card">
            <div className="card-content">
              <div className="text-center">
                <div className="mx-auto h-20 w-20 bg-primary-600 rounded-full flex items-center justify-center mb-4">
                  <User className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">{user?.name}</h3>
                <p className="text-sm text-gray-500">{user?.email}</p>
                <div className="mt-4 flex items-center justify-center space-x-2">
                  <Shield className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-500 capitalize">{user?.role}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900">Estatísticas</h3>
            </div>
            <div className="card-content">
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Membro desde</span>
                  <span className="text-sm font-medium text-gray-900">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('pt-BR') : '-'}
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
