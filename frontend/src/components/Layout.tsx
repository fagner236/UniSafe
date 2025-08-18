import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import GhostUserMessage from './GhostUserMessage';
import { useAuth } from '@/contexts/AuthContext';

const Layout = () => {
  const { user } = useAuth();
  const isGhostUser = user?.perfil === 'ghost';

  // Se for usuário Ghost, exibir apenas a mensagem de autorização pendente
  if (isGhostUser) {
    return <GhostUserMessage />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="lg:pl-64">
        <Header />
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
