import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  FileText,
  Zap,
  Settings,
  Shield
} from 'lucide-react';

const Admin = () => {
  const navigate = useNavigate();

  // Funcionalidades administrativas disponíveis
  const adminFeatures = [
    {
      title: 'Gestão de Usuários',
      description: 'Gerenciar permissões e acessos dos usuários do sistema',
      icon: Users,
      href: '/admin/users'
    },
    {
      title: 'Logs do Sistema',
      description: 'Visualizar logs de atividades e auditoria',
      icon: FileText,
      href: '/admin/logs'
    },
    {
      title: 'Administração de Cache',
      description: 'Gerenciar cache Redis e limpeza manual',
      icon: Zap,
      href: '/admin/cache'
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
          <div className="p-4 rounded-lg" style={{ backgroundColor: '#fff5f5', borderColor: '#ffc9c0', borderWidth: '1px', borderStyle: 'solid' }}>
            <div className="flex">
              <div className="flex-shrink-0">
                <Shield className="h-5 w-5" style={{ color: '#1d335b' }} />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium" style={{ color: '#8b5a5a' }}>
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
                <div className="inline-flex p-3 rounded-lg mb-4" style={{ backgroundColor: '#ffc9c0' }}>
                  <feature.icon className="h-6 w-6" style={{ color: '#1d335b' }} />
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
      </div>
    </div>
  );
};

export default Admin;
