import React from 'react';
import { CheckCircle, AlertCircle, Loader2, Database, Users } from 'lucide-react';

interface ImportProgressProps {
  isVisible: boolean;
  progress: {
    current: number;
    total: number;
    percentage: number;
  };
  status: 'idle' | 'importing' | 'completed' | 'imported' | 'imported_with_errors' | 'error';
  result?: {
    totalRecords: number;
    importedRecords: number;
    errorCount: number;
    errors: string[];
  };
  onClose: () => void;
}

const ImportProgress: React.FC<ImportProgressProps> = ({
  isVisible,
  progress,
  status,
  result,
  onClose
}) => {
  if (!isVisible) return null;

  const getStatusIcon = () => {
    switch (status) {
      case 'importing':
        return <Loader2 className="h-8 w-8 animate-spin text-blue-600" />;
      case 'completed':
        return <CheckCircle className="h-8 w-8 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-8 w-8 text-red-600" />;
      default:
        return <Database className="h-8 w-8 text-gray-600" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'importing':
        return 'Importando dados para base_dados...';
      case 'completed':
        return 'Importação concluída com sucesso!';
      case 'imported':
        return 'Importação para base_dados concluída!';
      case 'imported_with_errors':
        return 'Importação para base_dados concluída com erros';
      case 'error':
        return 'Erro durante a importação';
      default:
        return 'Pronto para importar';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'importing':
        return 'text-blue-600';
      case 'completed':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getStatusIcon()}
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Importação para Base de Dados
                </h3>
                <p className={`text-sm ${getStatusColor()}`}>
                  {getStatusText()}
                </p>
              </div>
            </div>
            {status !== 'importing' && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          {status === 'importing' && (
            <div className="space-y-4">
              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Progresso da importação</span>
                  <span>{progress.percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-blue-600 h-3 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${progress.percentage}%` }}
                  ></div>
                </div>
                <div className="text-center text-sm text-gray-500">
                  {progress.current} de {progress.total} registros processados
                </div>
              </div>

              {/* Status Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 text-blue-800">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm font-medium">
                    Processando registros...
                  </span>
                </div>
                <p className="text-sm text-blue-700 mt-1">
                  Os dados estão sendo importados para a tabela base_dados. 
                  Este processo pode levar alguns minutos dependendo do volume de dados.
                </p>
              </div>
            </div>
          )}

          {status === 'completed' && result && (
            <div className="space-y-4">
              {/* Success Summary */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 text-green-800">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">Importação concluída com sucesso!</span>
                </div>
              </div>

              {/* Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">
                    {result.totalRecords.toLocaleString('pt-BR')}
                  </div>
                  <div className="text-sm text-gray-600">Total de registros</div>
                </div>
                
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-900">
                    {result.importedRecords.toLocaleString('pt-BR')}
                  </div>
                  <div className="text-sm text-green-700">Importados com sucesso</div>
                </div>
                
                <div className="bg-red-50 rounded-lg p-4 text-center">
                  <AlertCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-red-900">
                    {result.errorCount.toLocaleString('pt-BR')}
                  </div>
                  <div className="text-sm text-red-700">Erros encontrados</div>
                </div>
              </div>

              {/* Errors (if any) */}
              {result.errorCount > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 text-yellow-800 mb-2">
                    <AlertCircle className="h-5 w-5" />
                    <span className="font-medium">Atenção: {result.errorCount} erros encontrados</span>
                  </div>
                  <div className="text-sm text-yellow-700 mb-3">
                    Alguns registros não puderam ser importados. Verifique os erros abaixo:
                  </div>
                  <div className="max-h-32 overflow-y-auto">
                    {result.errors.map((error, index) => (
                      <div key={index} className="text-xs text-yellow-700 bg-yellow-100 px-2 py-1 rounded mb-1">
                        {error}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Next Steps */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 text-blue-800 mb-2">
                  <Database className="h-5 w-5" />
                  <span className="font-medium">Próximos passos</span>
                </div>
                <div className="text-sm text-blue-700 space-y-1">
                  <p>• Os dados foram importados para a tabela base_dados</p>
                  <p>• Você pode agora visualizar e analisar os dados no dashboard</p>
                  <p>• Os dados estão disponíveis para consultas e relatórios</p>
                </div>
              </div>
            </div>
          )}

          {(status === 'imported' || status === 'imported_with_errors') && result && (
            <div className="space-y-4">
              {/* Success Summary */}
              <div className={`border rounded-lg p-4 ${
                status === 'imported' 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-yellow-50 border-yellow-200'
              }`}>
                <div className={`flex items-center space-x-2 ${
                  status === 'imported' ? 'text-green-800' : 'text-yellow-800'
                }`}>
                  {status === 'imported' ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <AlertCircle className="h-5 w-5" />
                  )}
                  <span className="font-medium">
                    {status === 'imported' 
                      ? 'Importação para base_dados concluída com sucesso!' 
                      : 'Importação para base_dados concluída com erros'
                    }
                  </span>
                </div>
              </div>

              {/* Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">
                    {result.totalRecords.toLocaleString('pt-BR')}
                  </div>
                  <div className="text-sm text-gray-600">Total de registros</div>
                </div>
                
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-900">
                    {result.importedRecords.toLocaleString('pt-BR')}
                  </div>
                  <div className="text-sm text-green-700">Importados com sucesso</div>
                </div>
                
                <div className="bg-red-50 rounded-lg p-4 text-center">
                  <AlertCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-red-900">
                    {result.errorCount.toLocaleString('pt-BR')}
                  </div>
                  <div className="text-sm text-red-700">Erros encontrados</div>
                </div>
              </div>

              {/* Errors (if any) */}
              {result.errorCount > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 text-yellow-800 mb-2">
                    <AlertCircle className="h-5 w-5" />
                    <span className="font-medium">Atenção: {result.errorCount} erros encontrados</span>
                  </div>
                  <div className="text-sm text-yellow-700 mb-3">
                    Alguns registros não puderam ser importados para base_dados. Verifique os erros abaixo:
                  </div>
                  <div className="max-h-32 overflow-y-auto">
                    {result.errors.map((error, index) => (
                      <div key={index} className="text-xs text-yellow-700 bg-yellow-100 px-2 py-1 rounded mb-1">
                        {error}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Next Steps */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 text-blue-800 mb-2">
                  <Database className="h-5 w-5" />
                  <span className="font-medium">Próximos passos</span>
                </div>
                <div className="text-sm text-blue-700 space-y-1">
                  <p>• Os dados foram importados para a tabela base_dados</p>
                  <p>• Você pode agora visualizar e analisar os dados no dashboard</p>
                  <p>• Os dados estão disponíveis para consultas e relatórios</p>
                  {status === 'imported_with_errors' && (
                    <p>• Recomenda-se verificar os erros antes de prosseguir</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 text-red-800">
                  <AlertCircle className="h-5 w-5" />
                  <span className="font-medium">Erro durante a importação</span>
                </div>
                <p className="text-sm text-red-700 mt-1">
                  Ocorreu um erro durante o processo de importação. 
                  Verifique se o arquivo está no formato correto e tente novamente.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-end space-x-3">
            {(status === 'completed' || status === 'imported' || status === 'imported_with_errors') && (
              <button
                onClick={onClose}
                className="px-4 py-2 text-white rounded-lg transition-colors"
                style={{ backgroundColor: '#c9504c' }}
              >
                Fechar
              </button>
            )}
            {status === 'error' && (
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Fechar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportProgress;
