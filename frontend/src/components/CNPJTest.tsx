import React, { useState } from 'react';
import { Search, CheckCircle, XCircle, AlertCircle, Building2 } from 'lucide-react';
import api from '../config/axios';

const CNPJTest: React.FC = () => {
  const [cnpj, setCnpj] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [result, setResult] = useState<{
    exists: boolean;
    message: string;
    data?: any;
  } | null>(null);
  const [error, setError] = useState('');

  const formatCNPJ = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
  };

  const handleCNPJChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= 18) {
      setCnpj(formatCNPJ(value));
    }
  };

  const testCNPJ = async () => {
    if (cnpj.length !== 18) {
      setError('CNPJ deve ter 18 caracteres');
      return;
    }

    setIsChecking(true);
    setError('');
    setResult(null);

    try {
      const cleanCNPJ = cnpj.replace(/\D/g, '');
      console.log('🧪 Testando CNPJ:', cleanCNPJ);
      
      const response = await api.get(`/companies/check-cnpj/${cleanCNPJ}`);
      console.log('📡 Resposta do teste:', response.data);
      
      if (response.data.success) {
        const resultData = {
          exists: response.data.exists,
          message: response.data.message,
          data: response.data.data
        };
        
        setResult(resultData);
      } else {
        setError('Erro na resposta da API');
      }
    } catch (err: any) {
      console.error('❌ Erro no teste:', err);
      if (err.response?.status === 404) {
        setError('Serviço de verificação não disponível');
      } else if (err.response?.status === 500) {
        setError('Erro interno do servidor');
      } else {
        setError('Erro ao verificar CNPJ. Verifique sua conexão.');
      }
    } finally {
      setIsChecking(false);
    }
  };

  const clearTest = () => {
    setCnpj('');
    setResult(null);
    setError('');
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="text-center mb-6">
        <Building2 className="mx-auto h-12 w-12 text-blue-600 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Teste de Verificação de CNPJ
        </h2>
        <p className="text-gray-600">
          Teste a funcionalidade de verificação de CNPJ implementada no sistema
        </p>
      </div>
      
      <div className="space-y-6">
        {/* Campo CNPJ */}
        <div>
          <label htmlFor="cnpj-test" className="block text-sm font-medium text-gray-700 mb-2">
            CNPJ para Teste
          </label>
          <div className="flex space-x-3">
            <input
              id="cnpj-test"
              type="text"
              value={cnpj}
              onChange={handleCNPJChange}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="00.000.000/0000-00"
              maxLength={18}
            />
            <button
              onClick={testCNPJ}
              disabled={isChecking || cnpj.length !== 18}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isChecking ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <Search className="inline-block w-5 h-5 mr-2" />
                  Verificar
                </>
              )}
            </button>
            <button
              onClick={clearTest}
              className="px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-colors"
            >
              Limpar
            </button>
          </div>
        </div>

        {/* CNPJs de Exemplo */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 mb-2">CNPJs para Teste:</h3>
          <div className="space-y-2">
            <button
              onClick={() => setCnpj('41.115.030/0001-20')}
              className="block w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded border border-blue-200 hover:border-blue-300 transition-colors"
            >
              <strong>41.115.030/0001-20</strong> - Via Eletrônica Ltda. (Evia) - Já cadastrado
            </button>
            <button
              onClick={() => setCnpj('12.345.678/0001-90')}
              className="block w-full text-left px-3 py-2 text-sm text-green-600 hover:bg-green-50 rounded border border-green-200 hover:border-green-300 transition-colors"
            >
              <strong>12.345.678/0001-90</strong> - CNPJ de teste (não cadastrado)
            </button>
          </div>
        </div>

        {/* Status da Verificação */}
        {isChecking && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-yellow-500"></div>
              <span className="text-yellow-700 font-medium">Verificando CNPJ...</span>
            </div>
          </div>
        )}

        {/* Erro */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <span className="text-red-700">{error}</span>
            </div>
          </div>
        )}

        {/* Resultado */}
        {result && (
          <div className={`p-6 border rounded-lg ${
            result.exists 
              ? 'bg-red-50 border-red-200' 
              : 'bg-green-50 border-green-200'
          }`}>
            <div className="flex items-center space-x-3 mb-4">
              {result.exists ? (
                <XCircle className="h-6 w-6 text-red-500" />
              ) : (
                <CheckCircle className="h-6 w-6 text-green-500" />
              )}
              <div>
                <h3 className={`text-lg font-semibold ${
                  result.exists ? 'text-red-800' : 'text-green-800'
                }`}>
                  {result.exists ? 'CNPJ Já Cadastrado' : 'CNPJ Disponível'}
                </h3>
                <p className={`text-sm ${
                  result.exists ? 'text-red-600' : 'text-green-600'
                }`}>
                  {result.message}
                </p>
              </div>
            </div>
            
            {result.exists && result.data && (
              <div className="bg-white p-4 rounded border border-gray-200">
                <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                  <Building2 className="h-4 w-4 mr-2 text-gray-600" />
                  Dados da Empresa Encontrada:
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600"><strong>Razão Social:</strong></p>
                    <p className="text-gray-900 font-medium">{result.data.razao_social}</p>
                  </div>
                  <div>
                    <p className="text-gray-600"><strong>Nome Fantasia:</strong></p>
                    <p className="text-gray-900 font-medium">{result.data.nome_fantasia || 'Não informado'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600"><strong>CNPJ:</strong></p>
                    <p className="text-gray-900 font-medium">{result.data.cnpj}</p>
                  </div>
                  <div>
                    <p className="text-gray-600"><strong>Localização:</strong></p>
                    <p className="text-gray-900 font-medium">{result.data.cidade} - {result.data.estado}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-gray-600"><strong>Endereço:</strong></p>
                    <p className="text-gray-900 font-medium">{result.data.endereco}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Instruções */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h3 className="text-sm font-medium text-blue-800 mb-2">Como Funciona:</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Digite um CNPJ completo (18 caracteres)</li>
            <li>• O sistema verifica automaticamente na base de dados</li>
            <li>• Se existir: mostra dados da empresa e impede cadastro</li>
            <li>• Se não existir: permite prosseguir com o cadastro</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CNPJTest;
