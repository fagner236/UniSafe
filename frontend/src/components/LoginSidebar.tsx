import React from 'react';
import { Building2, Upload, BarChart3 } from 'lucide-react';

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
            <div className="bg-red-100 rounded-full p-3 shadow-sm">
              <Building2 className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h3 className="font-bold text-[#2f4a8c] tracking-wide">Gestão Completa</h3>
              <p className="text-gray-600 text-sm">Gerencie base de dados de forma eficiente</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <div className="bg-red-100 rounded-full p-3 shadow-sm">
              <Upload className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h3 className="font-bold text-[#2f4a8c] tracking-wide">Upload de Arquivos</h3>
              <p className="text-gray-600 text-sm">Importe dados via Excel (.xlsx, .xls) e CSV de forma simples</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 animate-slide-up" style={{ animationDelay: '0.6s' }}>
            <div className="bg-red-100 rounded-full p-3 shadow-sm">
              <BarChart3 className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h3 className="font-bold text-[#2f4a8c] tracking-wide">Relatórios Avançados</h3>
              <p className="text-gray-600 text-sm">Visualize estatísticas e gere relatórios</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginSidebar;
