import { NavLink } from 'react-router-dom';
import { 
  Home, 
  Users, 
  Upload, 
  Menu,
  X,
  Settings
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getVersionString } from '../config/version';

const Sidebar = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();

  // Verificar se o usuário é da empresa dona do sistema
  const isSystemOwner = user?.empresa?.cnpj === '41.115.030/0001-20';
  
  // Verificar se o usuário é admin da empresa dona do sistema
  const isSystemAdmin = isSystemOwner && user?.perfil === 'admin';
  
  // Verificar se o usuário é Ghost (não deve ver a sidebar)
  const isGhostUser = user?.perfil === 'ghost';
  
  // Se for usuário Ghost, não renderizar nada
  if (isGhostUser) {
    return null;
  }

  // Navegação base para todos os usuários
  const baseNavigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Base de Dados', href: '/employees', icon: Users },
  ];

  // Adicionar menu Upload apenas para usuários Admin da empresa dona do sistema
  const navigation = isSystemAdmin
    ? [
        ...baseNavigation.slice(0, 1), // Dashboard
        { name: 'Upload', href: '/upload', icon: Upload },
        ...baseNavigation.slice(1) // Base de Dados
      ]
    : baseNavigation;

  return (
    <>
      {/* Mobile sidebar */}
      <div className={`lg:hidden fixed inset-0 z-50 ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col" style={{ backgroundColor: '#1d335b' }}>
          <div className="flex h-16 items-center justify-between px-4 -pt-3" style={{ backgroundColor: '#ffc9c0' }}>
            <div className="relative flex items-center">
              <img src="/logo.svg.png" alt="evia Logo" className="h-12 w-auto" style={{ objectFit: 'contain' }} />
              <h1 className="absolute text-sm font-light tracking-wide ml-12 mt-10" style={{ color: '#1d335b' }}>UniSafe</h1>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="hover:opacity-70 transition-opacity"
              style={{ color: '#1d335b' }}
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isActive ? 'shadow-md' : 'hover:shadow-sm'
                  }`
                }
                style={({ isActive }) => ({
                  backgroundColor: isActive ? '#ffc9c0' : 'transparent',
                  color: isActive ? '#1d335b' : '#ffffff',
                  borderLeft: isActive ? '4px solid #c9504c' : '4px solid transparent'
                })}
              >
                {({ isActive }) => (
                  <>
                    <item.icon 
                      className="mr-3 h-5 w-5" 
                      style={{ color: isActive ? '#1d335b' : '#ffffff' }} 
                    />
                    {item.name}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
          
          {/* Menu de Administração do Sistema - Apenas para empresa dona do sistema */}
          {isSystemAdmin && (
            <div className="px-2 py-4 border-t border-b" style={{ borderColor: '#c9504c' }}>
              <NavLink
                to="/admin"
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isActive ? 'shadow-md' : 'hover:shadow-sm'
                  }`
                }
                style={({ isActive }) => ({
                  backgroundColor: isActive ? '#ffc9c0' : 'transparent',
                  color: isActive ? '#1d335b' : '#ffc9c0',
                  borderLeft: isActive ? '4px solid #c9504c' : '4px solid transparent'
                })}
              >
                {({ isActive }) => (
                  <>
                    <Settings 
                      className="mr-3 h-4 w-4" 
                      style={{ color: isActive ? '#1d335b' : '#ffc9c0' }} 
                    />
                    Sistema
                  </>
                )}
              </NavLink>
            </div>
          )}
          
          {/* Footer com versão dinâmica */}
          <div className="px-4 py-3 border-t" style={{ borderColor: '#c9504c' }}>
            <p className="text-xs text-center" style={{ color: '#ffc9c0' }}>
              {getVersionString()}
            </p>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow" style={{ backgroundColor: '#1d335b' }}>
          <div className="flex items-center justify-center px-4 -pt-2 pb-6" style={{ backgroundColor: '#ffc9c0' }}>
            <div className="relative flex items-center">
              <img src="/logo.svg.png" alt="evia Logo" className="h-14 w-auto -ml-8" style={{ objectFit: 'contain' }} />
              <h1 className="absolute text-sm font-light tracking-wide ml-1 mt-12" style={{ color: '#1d335b' }}>UniSafe</h1>
            </div>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isActive ? 'shadow-md' : 'hover:shadow-sm'
                  }`
                }
                style={({ isActive }) => ({
                  backgroundColor: isActive ? '#ffc9c0' : 'transparent',
                  color: isActive ? '#1d335b' : '#ffffff',
                  borderLeft: isActive ? '4px solid #c9504c' : '4px solid transparent'
                })}
              >
                {({ isActive }) => (
                  <>
                    <item.icon 
                      className="mr-3 h-5 w-5" 
                      style={{ color: isActive ? '#1d335b' : '#ffffff' }} 
                    />
                    {item.name}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
          
          {/* Menu de Administração do Sistema - Apenas para empresa dona do sistema */}
          {isSystemAdmin && (
            <div className="px-2 py-4 border-t border-b" style={{ borderColor: '#c9504c' }}>
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isActive ? 'shadow-md' : 'hover:shadow-sm'
                  }`
                }
                style={({ isActive }) => ({
                  backgroundColor: isActive ? '#ffc9c0' : 'transparent',
                  color: isActive ? '#1d335b' : '#ffc9c0',
                  borderLeft: isActive ? '4px solid #c9504c' : '4px solid transparent'
                })}
              >
                {({ isActive }) => (
                  <>
                    <Settings 
                      className="mr-3 h-4 w-4" 
                      style={{ color: isActive ? '#1d335b' : '#ffc9c0' }} 
                    />
                    Sistema
                  </>
                )}
              </NavLink>
            </div>
          )}
          
          {/* Footer com versão dinâmica */}
          <div className="px-4 py-3 border-t" style={{ borderColor: '#c9504c' }}>
            <p className="text-xs text-center" style={{ color: '#ffc9c0' }}>
              {getVersionString()}
            </p>
          </div>
        </div>
      </div>

      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-40">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 rounded-md hover:bg-opacity-20 transition-all duration-200"
          style={{ backgroundColor: '#ffc9c0', color: '#1d335b' }}
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>
    </>
  );
};

export default Sidebar;
