import React, { useState } from 'react';
import { Search, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import api from '../config/axios';

interface CNPJCheckerProps {
  onCNPJResult: (exists: boolean, data?: any) => void;
}

const CNPJChecker: React.FC<CNPJCheckerProps> = ({ onCNPJResult }) => {
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

  const checkCNPJ = async () => {
    if (cnpj.length !== 18) {
      setError('CNPJ deve ter 18 caracteres');
      return;
    }

    setIsChecking(true);
    setError('');
    setResult(null);

    try {
      const cleanCNPJ = cnpj.replace(/\D/g, '');
      const response = await api.get(`/api/companies/check-cnpj/${cleanCNPJ}`);
      
      if (response.data.success) {
        const resultData = {
          exists: response.data.exists,
          message: response.data.message,
          data: response.data.data
        };
        
        setResult(resultData);
        onCNPJResult(response.data.exists, response.data.data);
      } else {
        setError('Erro na resposta da API');
      }
    } catch (err: any) {
      console.error('Erro ao verificar CNPJ:', err);
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

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Verificador de CNPJ
      </h3>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="cnpj-input" className="block text-sm font-medium text-gray-700 mb-2">
            CNPJ
          </label>
          <div className="flex space-x-2">
            <input
              id="cnpj-input"
              type="text"
              value={cnpj}
              onChange={handleCNPJChange}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="00.000.000/0000-00"
              maxLength={18}
            />
            <button
              onClick={checkCNPJ}
              disabled={isChecking || cnpj.length !== 18}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isChecking ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Search className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          </div>
        )}

        {result && (
          <div className={`p-3 border rounded-md ${
            result.exists 
              ? 'bg-red-50 border-red-200' 
              : 'bg-green-50 border-green-200'
          }`}>
            <div className="flex items-center space-x-2">
              {result.exists ? (
                <XCircle className="h-4 w-4 text-red-500" />
              ) : (
                <CheckCircle className="h-4 w-4 text-green-500" />
              )}
              <span className={`text-sm ${
                result.exists ? 'text-red-700' : 'text-green-700'
              }`}>
                {result.message}
              </span>
            </div>
            
            {result.exists && result.data && (
              <div className="mt-3 p-3 bg-white rounded border border-gray-200">
                <h4 className="font-medium text-gray-900 mb-2">Dados da Empresa:</h4>
                <div className="space-y-1 text-sm text-gray-600">
                  <p><strong>Razão Social:</strong> {result.data.razao_social}</p>
                  <p><strong>Nome Fantasia:</strong> {result.data.nome_fantasia || 'Não informado'}</p>
                  <p><strong>CNPJ:</strong> {result.data.cnpj}</p>
                  <p><strong>Endereço:</strong> {result.data.endereco}</p>
                  <p><strong>Cidade:</strong> {result.data.cidade} - {result.data.estado}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CNPJChecker;
