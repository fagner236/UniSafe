import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Database, 
  Shield, 
  Settings,
  FileText,
  UserCheck
} from 'lucide-react';

const Admin = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  // Funcionalidades administrativas disponíveis
  const adminFeatures = [
    {
      title: 'Gestão de Usuários',
      description: 'Gerenciar permissões e acessos dos usuários do sistema',
      icon: Users,
      href: '/admin/users',
      color: 'bg-blue-600'
    },

    {
      title: 'Backup e Restauração',
      description: 'Gerenciar backups do banco de dados e restaurações',
      icon: Database,
      href: '/admin/backup',
      color: 'bg-purple-600'
    },
    {
      title: 'Logs do Sistema',
      description: 'Visualizar logs de atividades e auditoria',
      icon: FileText,
      href: '/admin/logs',
      color: 'bg-orange-600'
    },
    {
      title: 'Configurações Gerais',
      description: 'Configurar parâmetros globais do sistema',
      icon: Settings,
      href: '/admin/settings',
      color: 'bg-gray-600'
    },
    {
      title: 'Relatórios Avançados',
      description: 'Acessar relatórios detalhados e análises',
      icon: Users, // Changed from BarChart3 to Users as per new_code
      href: '/admin/reports',
      color: 'bg-indigo-600'
    },
    {
      title: 'Segurança',
      description: 'Configurações de segurança e políticas de acesso',
      icon: Shield,
      href: '/admin/security',
      color: 'bg-red-600'
    },
    {
      title: 'Validação de Dados',
      description: 'Ferramentas para validação e correção de dados',
      icon: UserCheck,
      href: '/admin/validation',
      color: 'bg-teal-600'
    }
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8fafc' }}>
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <div className="p-3 rounded-lg mr-4" style={{ backgroundColor: '#ffc9c0' }}>
              <Settings className="h-8 w-8" style={{ color: '#1d335b' }} />
            </div>
            <div>
              <h1 className="text-3xl font-bold" style={{ color: '#1d335b' }}>
                Administração do Sistema
              </h1>
              <p className="text-gray-600 mt-1">
                Painel de controle para administradores da Evia UniSafe
              </p>
            </div>
          </div>
          <div className="p-4 rounded-lg" style={{ backgroundColor: '#ffc9c0', borderLeft: '4px solid #c9504c' }}>
            <div className="flex">
              <div className="flex-shrink-0">
                <Shield className="h-5 w-5" style={{ color: '#1d335b' }} />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium" style={{ color: '#1d335b' }}>
                  <strong>Atenção:</strong> Esta área é restrita aos administradores do sistema. 
                  Todas as ações realizadas aqui são registradas para auditoria.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Funcionalidades Administrativas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminFeatures.map((feature, index) => (
            <div
              key={index}
              onClick={() => navigate(feature.href)}
              className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 cursor-pointer group hover:border-gray-300"
            >
              <div className="p-6">
                <div className={`inline-flex p-3 rounded-lg ${feature.color} mb-4`}>
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2 transition-colors" style={{ color: '#1d335b' }} onMouseEnter={(e) => (e.target as HTMLHeadingElement).style.color = '#c9504c'} onMouseLeave={(e) => (e.target as HTMLHeadingElement).style.color = '#1d335b'}>
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {feature.description}
                </p>
                <div className="mt-4 flex items-center text-sm font-medium transition-colors" style={{ color: '#1d335b' }} onMouseEnter={(e) => (e.target as HTMLDivElement).style.color = '#c9504c'} onMouseLeave={(e) => (e.target as HTMLDivElement).style.color = '#1d335b'}>
                  Acessar
                  <svg className="ml-1 h-4 w-4 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Ações Rápidas */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="flex items-center justify-center px-4 py-2 rounded-lg text-white transition-colors" style={{ backgroundColor: '#1d335b' }} onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#2a4a7a'} onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#1d335b'}>
              <Database className="h-4 w-4 mr-2" />
              Backup Manual
            </button>
            <button className="flex items-center justify-center px-4 py-2 rounded-lg text-white transition-colors" style={{ backgroundColor: '#c9504c' }} onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#d65a56'} onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#c9504c'}>
              <Users className="h-4 w-4 mr-2" />
              Novo Usuário
            </button>
            <button className="flex items-center justify-center px-4 py-2 rounded-lg text-white transition-colors" style={{ backgroundColor: '#6b7280' }} onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#7c8a9a'} onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#6b7280'}>
              <FileText className="h-4 w-4 mr-2" />
              Gerar Relatório
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
