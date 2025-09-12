import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { clearUserDataCache } from '@/utils/cacheCleaner';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) {
    // Limpar cache de dados do usuário ao redirecionar para login
    clearUserDataCache();
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Componente para rotas que só podem ser acessadas por usuários administradores
interface AdminRouteProps {
  children: React.ReactNode;
}

export const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) {
    // Limpar cache de dados do usuário ao redirecionar para login
    clearUserDataCache();
    return <Navigate to="/login" replace />;
  }

  // Verificar se o usuário é admin da empresa dona do sistema
  const isSystemOwnerAdmin = user?.perfil === 'admin' && user?.empresa?.cnpj === '41.115.030/0001-20';

  if (!isSystemOwnerAdmin) {
    // Limpar cache de dados do usuário antes de definir mensagem de erro
    clearUserDataCache();
    
    // Redirecionar para o dashboard com uma mensagem de erro
    localStorage.setItem('accessError', 'Você não tem permissão para acessar esta funcionalidade. Apenas administradores da empresa dona do sistema podem acessar o Upload.');
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
