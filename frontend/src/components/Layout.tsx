import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import Footer from './Footer';
// import VersionNotification from './VersionNotification';
import GhostUserMessage from './GhostUserMessage';
import { useAuth } from '@/contexts/AuthContext';

const Layout = () => {
  const { user } = useAuth();
  const location = useLocation();
  const isGhostUser = user?.perfil === 'ghost';
  
  // Verificar se estamos na página Dashboard (rota raiz), Base de Dados, Upload, Perfil, Configurações ou páginas administrativas
  const isDashboard = location.pathname === '/';
  const isEmployees = location.pathname === '/employees';
  const isUpload = location.pathname === '/upload';
  const isProfile = location.pathname === '/profile';
  const isSettings = location.pathname === '/settings';
  const isAdmin = location.pathname.startsWith('/admin');
  const shouldHideFooter = isDashboard || isEmployees || isUpload || isProfile || isSettings || isAdmin;

  // Se for usuário Ghost, exibir apenas a mensagem de autorização pendente
  if (isGhostUser) {
    return <GhostUserMessage />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Sidebar />
      <div className="lg:pl-64 flex flex-col flex-1">
        <Header />
        <main className="py-6 flex-1">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
        {/* Ocultar Footer nas páginas Dashboard, Base de Dados, Upload, Perfil, Configurações e páginas administrativas */}
        {!shouldHideFooter && <Footer />}
      </div>
      {/* <VersionNotification /> */}
    </div>
  );
};

export default Layout;
