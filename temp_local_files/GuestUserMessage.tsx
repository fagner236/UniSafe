import { AlertCircle, Shield, User } from 'lucide-react';
import { getVersionString } from '../config/version';
import { clearCacheOnLogout } from '@/utils/cacheCleaner';

const GuestUserMessage = () => {
  const handleLogout = () => {
    console.log('🚪 Usuário guest fazendo logout...');
    
    // Limpeza completa de cache e memória
    clearCacheOnLogout();
    
    // Redirecionar para login
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full rounded-lg shadow-lg border p-8 text-center" style={{ backgroundColor: '#ffc9c0', borderColor: '#c9504c', borderWidth: '2px' }}>
        {/* Logo e Nome do Sistema */}
        <div className="mb-8">
          <div className="relative flex items-center justify-center mb-4">
            <img src="/logo.svg.png" alt="evia Logo" className="h-16 w-auto" style={{ objectFit: 'contain' }} />
            <h1 className="absolute text-lg font-light tracking-wide ml-10 mt-16" style={{ color: '#1d335b' }}>UniSafe</h1>
          </div>
        </div>
        
        {/* Ícone de usuário Guest */}
        <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <User className="h-8 w-8" style={{ color: '#c9504c' }} />
        </div>
        
        {/* Título */}
        <h1 className="text-2xl font-bold mb-4" style={{ color: '#1d335b' }}>
          Acesso Pendente
        </h1>
        
        {/* Mensagem principal */}
        <div className="bg-white border rounded-lg p-4 mb-6" style={{ borderColor: '#c9504c' }}>
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 mt-0.5 mr-3 flex-shrink-0" style={{ color: '#c9504c' }} />
            <p className="text-sm leading-relaxed" style={{ color: '#1d335b' }}>
              Seu perfil aguarda autorização para acesso. Entre em contato com o administrador do sistema de sua empresa!
            </p>
          </div>
        </div>
        
        {/* Informações adicionais */}
        <div className="space-y-3 text-sm" style={{ color: '#1d335b' }}>
          <div className="flex items-center justify-center">
            <Shield className="h-4 w-4 mr-2" style={{ color: '#c9504c' }} />
            <span>Perfil: Guest</span>
          </div>
          <p className="text-xs" style={{ color: '#1d335b', opacity: 0.8 }}>
            Este status é temporário e será atualizado pelo administrador
          </p>
        </div>
        
        {/* Botão de logout */}
        <div className="mt-8 pt-6 border-t" style={{ borderColor: '#c9504c' }}>
          <button
            onClick={handleLogout}
            className="w-full text-white py-2 px-4 rounded-md transition-colors duration-200 hover:opacity-80"
            style={{ backgroundColor: '#c9504c' }}
          >
            Sair do Sistema
          </button>
        </div>
        
        {/* Versão do Sistema e Copyright */}
        <div className="mt-6 pt-4 border-t" style={{ borderColor: '#c9504c' }}>
          <p className="text-xs tracking-wide mb-2" style={{ color: '#1d335b', opacity: 0.8 }}>
            Versão {getVersionString()}
          </p>
          <p className="text-xs tracking-wide" style={{ color: '#1d335b', opacity: 0.6 }}>
            © 2025 Evia - Todos os direitos reservados.
          </p>
        </div>
      </div>
    </div>
  );
};

export default GuestUserMessage;
