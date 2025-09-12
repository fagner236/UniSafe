import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types';
import { clearCacheOnLogin, clearCacheOnLogout, clearAuthCache } from '@/utils/cacheCleaner';
import { logger } from '@/utils/logger';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetchUserProfile();
    } else {
      setIsLoading(false);
    }
  }, [token]);

  const fetchUserProfile = async () => {
    try {
      logger.log('Buscando perfil do usuário com token:', token?.substring(0, 20) + '...');
      const response = await fetch('http://localhost:3000/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      logger.log('Status da resposta do perfil:', response.status);
      const userData = await response.json();
      logger.log('Dados do perfil:', userData);

      if (response.ok) {
        setUser(userData.data);
        logger.log('Perfil carregado com sucesso');
      } else {
        logger.log('Erro ao carregar perfil, removendo token');
        clearAuthCache();
        setToken(null);
        setUser(null);
      }
    } catch (error) {
      logger.error('Erro ao buscar perfil:', error);
      clearAuthCache();
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      logger.log('🔑 Iniciando processo de login...');
      
      // Limpar cache antes do login para garantir estado limpo
      clearCacheOnLogin();
      
      logger.log('Tentando fazer login com:', email);
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      logger.log('Resposta do servidor:', response.status);
      const data = await response.json();
      logger.log('Dados da resposta:', data);

      if (!response.ok) {
        // Capturar a mensagem específica do backend
        const errorMessage = data.message || 'Erro no login';
        throw new Error(errorMessage);
      }

      setToken(data.data.token);
      setUser(data.data.user);
      localStorage.setItem('token', data.data.token);
              logger.log('✅ Login realizado com sucesso');
      } catch (error) {
        logger.error('❌ Erro no login:', error);
      throw error;
    }
  };

  const logout = () => {
    logger.log('🔒 Executando logout...');
    
    // Limpar dados de autenticação
    setToken(null);
    setUser(null);
    
    // Limpeza completa de cache e memória
    clearCacheOnLogout();
    
    logger.log('✅ Logout completo - Cache e memória limpos');
  };

  const value = {
    user,
    token,
    login,
    logout,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
