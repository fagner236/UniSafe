import { useState, useEffect } from 'react';
import { X, Zap, Shield, Database, TrendingUp, CheckCircle } from 'lucide-react';
import { getVersionString } from '../config/version';

const VersionNotification = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Verificar se a notificação já foi fechada
    const dismissed = localStorage.getItem('version-notification-dismissed');
    if (!dismissed) {
      // Mostrar a notificação após 1 segundo
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    localStorage.setItem('version-notification-dismissed', 'true');
  };

  if (!isVisible || isDismissed) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
      <div className="bg-white rounded-lg shadow-xl border border-gray-200 max-w-md">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-3 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Zap className="h-5 w-5" />
              <span className="font-semibold">Nova Versão Disponível!</span>
            </div>
            <button
              onClick={handleDismiss}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="mb-3">
            <div className="flex items-center space-x-2 mb-2">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                {getVersionString()}
              </span>
              <span className="text-xs text-green-600 font-medium">Produção Pronta</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">
              Interface Limpa e Otimizada
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              O UniSafe foi atualizado com uma interface completamente limpa e filtros 
              otimizados, tornando o sistema mais profissional e eficiente.
            </p>
          </div>

          {/* Features */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center space-x-2 text-xs">
              <Shield className="h-3 w-3 text-green-500" />
              <span className="text-gray-700">Interface 100% limpa e profissional</span>
            </div>
            <div className="flex items-center space-x-2 text-xs">
              <Zap className="h-3 w-3 text-blue-500" />
              <span className="text-gray-700">Filtros 2.5x mais rápidos</span>
            </div>
            <div className="flex items-center space-x-2 text-xs">
              <Database className="h-3 w-3 text-purple-500" />
              <span className="text-gray-700">Busca em tempo real</span>
            </div>
            <div className="flex items-center space-x-2 text-xs">
              <TrendingUp className="h-3 w-3 text-orange-500" />
              <span className="text-gray-700">Navegação consistente</span>
            </div>
          </div>

          {/* Action */}
          <div className="flex items-center justify-between">
            <button
              onClick={handleDismiss}
              className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
            >
              Não mostrar novamente
            </button>
            <div className="flex items-center space-x-2 text-xs text-green-600">
              <CheckCircle className="h-3 w-3" />
              <span>Sistema Atualizado</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VersionNotification;
