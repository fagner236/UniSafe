import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Bell, User, LogOut, Settings } from 'lucide-react';

const Header = () => {
  const { user, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <header className="shadow-sm border-b border-gray-200" style={{ backgroundColor: '#ffc9c0' }}>
      <div className="px-4 sm:px-6 lg:px-8">
                <div className="flex justify-end items-center h-20" style={{ height: '79.5px' }}>
          
                      <div className="flex items-center space-x-4">
              {/* Notifications */}
              <button className="p-2 relative hover:opacity-70 transition-opacity" style={{ color: '#1d335b' }}>
                <Bell className="h-5 w-5" />
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full" style={{ backgroundColor: '#c9504c' }}></span>
              </button>

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:opacity-80 transition-opacity"
                  style={{ backgroundColor: '#1d335b', color: '#ffffff' }}
                >
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#c9504c' }}>
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <span className="hidden md:block text-sm font-medium" style={{ color: '#ffffff' }}>
                    {user?.name}
                  </span>
                </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg py-1 z-50" style={{ backgroundColor: '#1d335b', border: '1px solid #c9504c' }}>
                  <a
                    href="/profile"
                    className="flex items-center px-4 py-2 text-sm hover:opacity-80 transition-opacity"
                    style={{ color: '#ffffff' }}
                  >
                    <User className="h-4 w-4 mr-2" />
                    Perfil
                  </a>
                  <a
                    href="/settings"
                    className="flex items-center px-4 py-2 text-sm hover:opacity-80 transition-opacity"
                    style={{ color: '#ffffff' }}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Configurações
                  </a>
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
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
