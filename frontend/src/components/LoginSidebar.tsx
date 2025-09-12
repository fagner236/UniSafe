import React from 'react';
import { Building2, BarChart3, Shield, Zap, Database } from 'lucide-react';
import { getVersionString } from '../config/version';

const LoginSidebar = () => {
  // Preload da imagem para evitar piscar
  React.useEffect(() => {
    const img = new Image();
    img.src = '/logo-large.svg.png';
  }, []);

  return (
    <div className="hidden lg:flex lg:w-1/2 bg-white items-center justify-center">
      <div className="text-center text-gray-900 px-8 -mt-16 animate-fade-in">
        <div className="mb-8 relative">
          <img 
            src="/logo-large.svg.png" 
            alt="evia Logo" 
            className="mx-auto h-64 w-auto animate-slide-up" 
          />
          <h1 className="absolute bottom-14 left-1/2 transform translate-x-12 text-base font-light text-gray-600 tracking-wide animate-fade-in">
            UniSafe
          </h1>
        </div>
        

        
        <div className="space-y-6 text-left max-w-md mx-auto">
          <div className="flex items-center space-x-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-full p-3 shadow-sm">
              <Zap className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-[#2f4a8c] tracking-wide">Uploads Ultra-Rápidos</h3>
              <p className="text-gray-600 text-sm">Processamento 2.5x mais rápido com sistema 100% em memória</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <div className="bg-gradient-to-r from-green-100 to-blue-100 rounded-full p-3 shadow-sm">
              <Shield className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-bold text-[#2f4a8c] tracking-wide">Segurança Máxima</h3>
              <p className="text-gray-600 text-sm">Eliminação completa de arquivos físicos expostos</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 animate-slide-up" style={{ animationDelay: '0.6s' }}>
            <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-full p-3 shadow-sm">
              <Database className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-bold text-[#2f4a8c] tracking-wide">Escalabilidade Ilimitada</h3>
              <p className="text-gray-600 text-sm">Sem restrições de espaço em disco</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 animate-slide-up" style={{ animationDelay: '0.8s' }}>
            <div className="bg-gradient-to-r from-orange-100 to-red-100 rounded-full p-3 shadow-sm">
              <Building2 className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <h3 className="font-bold text-[#2f4a8c] tracking-wide">Gestão Completa</h3>
              <p className="text-gray-600 text-sm">Gerencie base de dados de forma eficiente</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 animate-slide-up" style={{ animationDelay: '1.0s' }}>
            <div className="bg-gradient-to-r from-indigo-100 to-blue-100 rounded-full p-3 shadow-sm">
              <BarChart3 className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <h3 className="font-bold text-[#2f4a8c] tracking-wide">Relatórios Avançados</h3>
              <p className="text-gray-600 text-sm">Visualize estatísticas e gere relatórios</p>
            </div>
          </div>
        </div>
        
        {/* Versão do Sistema e Copyright */}
        <div className="mt-8 pt-6 border-t border-gray-200 animate-fade-in" style={{ animationDelay: '1.2s' }}>
          <p className="text-xs text-gray-500 tracking-wide mb-2">
            Versão {getVersionString()}
          </p>
          <p className="text-xs text-gray-400 tracking-wide">
            © 2025 Evia - Todos os direitos reservados.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginSidebar;
