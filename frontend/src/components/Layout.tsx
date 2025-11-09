import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import Footer from './Footer';
// import VersionNotification from './VersionNotification';
import GuestUserMessage from './GuestUserMessage';
import { useAuth } from '@/contexts/AuthContext';
import { useSidebar } from '@/contexts/SidebarContext';

const Layout = () => {
  const { user } = useAuth();
  const { isCollapsed } = useSidebar();
  const location = useLocation();
  const isGuestUser = user?.perfil === 'guest';
  
  // Verificar se estamos na página Dashboard (rota raiz), Base de Dados, Perfil, Configurações ou páginas administrativas
  const isDashboard = location.pathname === '/';
  const isEmployees = location.pathname === '/employees';
  const isProfile = location.pathname === '/profile';
  const isSettings = location.pathname === '/settings';
  const isAdmin = location.pathname.startsWith('/admin');
  const shouldHideFooter = isDashboard || isEmployees || isProfile || isSettings || isAdmin;

  // Se for usuário Guest, exibir apenas a mensagem de autorização pendente
  if (isGuestUser) {
    return <GuestUserMessage />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Sidebar />
      <div className={`flex flex-col flex-1 transition-all duration-300 ${
        isCollapsed ? 'lg:pl-20' : 'lg:pl-64'
      }`}>
        <Header />
        <main className="py-6 flex-1">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
        {/* Ocultar Footer nas páginas Dashboard, Base de Dados, Perfil, Configurações e páginas administrativas */}
        {!shouldHideFooter && <Footer />}
      </div>
      {/* <VersionNotification /> */}
    </div>
  );
};

export default Layout;
