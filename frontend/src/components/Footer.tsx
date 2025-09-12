
import { Zap, Shield, Database, TrendingUp } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Informações da Empresa */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <img src="/logo.svg.png" alt="evia Logo" className="h-8 w-auto" />
              <span className="text-lg font-semibold text-gray-900">UniSafe</span>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Sistema de Gestão de Funcionários e Empresas - 
              Soluções inteligentes para gestão de recursos humanos.
            </p>
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <span>© 2025 Via Eletrônica Ltda.</span>
              <span>•</span>
              <span>Todos os direitos reservados</span>
            </div>
          </div>



          {/* Funcionalidades */}
          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Funcionalidades</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-xs text-gray-600">
                <Shield className="h-3 w-3 text-green-500" />
                <span>Segurança Máxima</span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-gray-600">
                <Zap className="h-3 w-3 text-blue-500" />
                <span>2.5x Mais Rápido</span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-gray-600">
                <Database className="h-3 w-3 text-purple-500" />
                <span>Sem Limites de Disco</span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-gray-600">
                <TrendingUp className="h-3 w-3 text-orange-500" />
                <span>70% Menos Manutenção</span>
              </div>
            </div>
          </div>
        </div>

        {/* Linha de separação */}
        <div className="border-t border-gray-200 mt-6 pt-6">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <span>Sistema de Uploads em Memória</span>
              <span>•</span>
              <span>Performance Otimizada</span>
            </div>
            <div className="flex items-center space-x-2 text-xs text-gray-400">
              <span>Desenvolvido com ❤️ pela</span>
              <span className="font-medium text-gray-600">Equipe UniSafe</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
