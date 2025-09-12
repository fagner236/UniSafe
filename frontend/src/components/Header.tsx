import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { User, LogOut, Settings, Building2, Shield } from 'lucide-react';

const Header = () => {
  const { user, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Função para tratar o nome da empresa, garantindo que caracteres especiais sejam exibidos corretamente
  const formatCompanyName = (companyName: string) => {
    if (!companyName) return '';
    
    // Garante que o nome seja exibido como texto puro
    // Preserva barras e outros caracteres válidos
    return companyName.trim();
  };

  // Fechar dropdown quando clicar fora dele
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    // Adicionar event listener apenas quando o dropdown estiver aberto
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    // Cleanup do event listener
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  return (
    <header className="shadow-sm border-b border-gray-200" style={{ backgroundColor: '#ffc9c0' }}>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20" style={{ height: '79.5px' }}>
          
          {/* Lado esquerdo - Espaço reservado para futuras funcionalidades */}
          <div className="flex items-center space-x-3">
            {/* Espaço disponível para futuras implementações */}
          </div>
          
          <div className="flex items-center space-x-4">
            {/* User Menu */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-2 p-2 rounded-lg hover:opacity-80 transition-opacity"
                style={{ backgroundColor: '#1d335b', color: '#ffffff' }}
              >
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#c9504c' }}>
                  <User className="h-4 w-4 text-white" />
                </div>
                <span className="hidden md:block text-sm font-medium" style={{ color: '#ffffff' }}>
                  {user?.nome}
                </span>
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-lg shadow-lg py-2 z-50" style={{ backgroundColor: '#1d335b', border: '1px solid #c9504c' }}>
                  {/* Informações do usuário */}
                  <div className="px-4 py-3 border-b border-gray-600">
                    <div className="text-sm font-medium text-white mb-1">{user?.nome}</div>
                    <div className="text-xs text-gray-300 mb-2">{user?.email}</div>
                    
                    {/* Perfil do usuário */}
                    <div className="flex items-center text-xs text-gray-300">
                      <Shield className="h-3 w-3 mr-1" />
                      <span className="capitalize">{user?.perfil}</span>
                    </div>
                    
                    {/* Informações da empresa */}
                    {user?.empresa && (
                      <div className="mt-2 pt-2 border-t border-gray-600">
                        <div className="flex items-center text-xs text-gray-300 mb-1">
                          <Building2 className="h-3 w-3 mr-1" />
                          <span>Empresa</span>
                        </div>
                        <div 
                          className="text-xs text-white font-medium break-words whitespace-normal"
                          style={{ 
                            wordBreak: 'break-word',
                            whiteSpace: 'normal',
                            fontFamily: 'inherit'
                          }}
                        >
                          {formatCompanyName(user.empresa.nome_fantasia || user.empresa.razao_social)}
                        </div>
                        {user.empresa.cnpj && (
                          <div 
                            className="text-xs text-gray-300 break-words whitespace-normal mt-1"
                            style={{ 
                              wordBreak: 'break-word',
                              whiteSpace: 'normal',
                              fontFamily: 'inherit'
                            }}
                          >
                            {user.empresa.cnpj}
                          </div>
                        )}
                      </div>
                    )}
                    

                  </div>

                  {/* Opções do menu */}
                  <div className="py-1">
                    <a
                      href="/profile"
                      className="flex items-center px-4 py-2 text-sm hover:opacity-80 transition-opacity"
                      style={{ color: '#ffffff' }}
                    >
                      <User className="h-4 w-4 mr-2" />
                      Perfil
                    </a>
                    
                    {/* Menu Configurações - Apenas para usuários admin */}
                    {user?.perfil === 'admin' && (
                      <a
                        href="/settings"
                        className="flex items-center px-4 py-2 text-sm hover:opacity-80 transition-opacity"
                        style={{ color: '#ffffff' }}
                        onClick={(e) => {
                          e.preventDefault();
                          window.location.href = '/settings';
                        }}
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Configurações
                      </a>
                    )}
                    <hr className="my-1" style={{ borderColor: '#c9504c' }} />
                    <button
                      onClick={logout}
                      className="flex items-center w-full px-4 py-2 text-sm hover:opacity-80 transition-opacity"
                      style={{ color: '#ffffff' }}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sair
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
