import React, { useState, useEffect } from 'react';

interface DashboardLoadingProps {
  isLoading: boolean;
  progress: number;
  currentStep: string;
  totalSteps: number;
}

const DashboardLoading: React.FC<DashboardLoadingProps> = ({ 
  isLoading, 
  progress, 
  currentStep, 
  totalSteps 
}) => {
  const [displayProgress, setDisplayProgress] = useState(0);

  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setDisplayProgress(prev => {
          if (prev < progress) {
            return Math.min(prev + 2, progress);
          }
          return prev;
        });
      }, 50);

      return () => clearInterval(interval);
    } else {
      setDisplayProgress(0);
    }
  }, [isLoading, progress]);

  if (!isLoading) return null;


  return (
    <div className="fixed inset-0 bg-white bg-opacity-95 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md mx-4 border-2" 
           style={{ borderColor: '#ffc9c0' }}>
        
        {/* Logo/Ícone */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
               style={{ backgroundColor: '#1d335b' }}>
            <svg className="w-8 h-8 text-white animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <h2 className="text-2xl font-bold" style={{ color: '#1d335b' }}>
            Carregando Dashboard
          </h2>
          <p className="text-gray-600 mt-2">
            Preparando os dados para análise...
          </p>
        </div>

        {/* Barra de Progresso */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Progresso</span>
            <span className="text-sm font-medium" style={{ color: '#1d335b' }}>
              {Math.round(displayProgress)}%
            </span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div 
              className="h-full rounded-full transition-all duration-300 ease-out relative"
              style={{ 
                backgroundColor: '#1d335b',
                width: `${displayProgress}%`
              }}
            >
              <div 
                className="absolute inset-0 rounded-full"
                style={{
                  background: 'linear-gradient(90deg, #1d335b 0%, #ffc9c0 50%, #1d335b 100%)',
                  animation: 'shimmer 2s infinite'
                }}
              />
            </div>
          </div>
        </div>

        {/* Etapa Atual */}
        <div className="text-center">
          <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium"
               style={{ backgroundColor: '#ffc9c0', color: '#1d335b' }}>
            <div className="w-2 h-2 rounded-full mr-2 animate-pulse"
                 style={{ backgroundColor: '#1d335b' }}></div>
            {currentStep}
          </div>
          
          <div className="mt-4 text-xs text-gray-500">
            Etapa {Math.min(Math.ceil((displayProgress / 100) * totalSteps), totalSteps)} de {totalSteps}
          </div>
        </div>

        {/* Dicas de Carregamento */}
        <div className="mt-6 text-center">
          <div className="text-xs text-gray-400 space-y-1">
            <p>💡 Dica: Os dados são carregados diretamente da base de dados</p>
            <p>⚡ Processamento otimizado para melhor performance</p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default DashboardLoading;
