import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Employee } from '@/types';
import { useAuth } from './AuthContext';
import { clearUserDataCache } from '@/utils/cacheCleaner';

export interface ProcessedData {
  employees: Employee[];
  columns: string[];
  summary: {
    totalRecords: number;
    validRecords: number;
    invalidRecords: number;
    companies: string[];
    departments: string[];
    averageSalary: number;
  };
  errors: Array<{
    row: number;
    field: string;
    message: string;
  }>;
  uploadedAt: string;
  fileName: string;
  dataSource?: 'base_dados' | 'employee_data';
  selectedMonthYear?: string;
  totalRecordsInDatabase?: number;
  filteredRecords?: number;
  availableMonths?: string[];
  availableBasesSindicais?: string[];
  selectedBaseSindical?: string | null;
}

interface DataContextType {
  processedData: ProcessedData | null;
  setProcessedData: (data: ProcessedData | null) => void;
  clearData: () => void;
  hasData: boolean;
  loadLatestCompanyData: () => Promise<void>;
  loadBaseDadosData: (monthYear?: string, baseSindical?: string) => Promise<void>;
  isLoadingLatestData: boolean;
  isLoadingBaseDados: boolean;
  error: string | null;
  dataSource: 'base_dados' | 'employee_data' | null;
  loadingProgress: number;
  currentLoadingStep: string;
  totalLoadingSteps: number;
}

const DataContext = createContext<DataContextType | undefined>( undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

interface DataProviderProps {
  children: ReactNode;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const [processedData, setProcessedData] = useState<ProcessedData | null>(null);
  const [isLoadingLatestData, setIsLoadingLatestData] = useState(false);
  const [isLoadingBaseDados, setIsLoadingBaseDados] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<'base_dados' | 'employee_data' | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [currentLoadingStep, setCurrentLoadingStep] = useState('');
  const [totalLoadingSteps] = useState(5);
  const { user } = useAuth();

  // Limpar dados quando o usuário mudar (login/logout)
  useEffect(() => {
    if (!user) {
      console.log('🧹 Usuário não autenticado - limpando dados do contexto');
      clearData();
    }
  }, [user]);

  const clearData = () => {
    console.log('🧹 Limpando dados do DataContext...');
    setProcessedData(null);
    setIsLoadingLatestData(false);
    setIsLoadingBaseDados(false);
    setError(null);
    setDataSource(null);
    setLoadingProgress(0);
    setCurrentLoadingStep('');
    
    // Usar o utilitário de limpeza de cache
    clearUserDataCache();
    
    console.log('✅ Dados do DataContext limpos');
  };

  const hasData = processedData !== null;

  // Função para carregar dados da tabela base_dados (prioridade)
  const loadBaseDadosData = async (monthYear?: string, baseSindical?: string) => {
    console.log('🔍 === LOAD BASE DADOS DATA ===');
    console.log('🔍 Usuário:', user);
    console.log('🔍 monthYear:', monthYear);
    console.log('🔍 baseSindical:', baseSindical);
    
    if (!user) {
      console.log('⚠️ Tentativa de carregar dados sem usuário autenticado');
      return;
    }

    try {
      setIsLoadingBaseDados(true);
      setError(null);
      setLoadingProgress(0);
      setCurrentLoadingStep('Conectando ao servidor...');
      
      console.log('🔄 Iniciando carregamento de dados da base_dados para usuário:', user.email);
      
      // Simular progresso de carregamento
      const progressSteps = [
        { step: 'Conectando ao servidor...', progress: 20 },
        { step: 'Carregando dados da base...', progress: 40 },
        { step: 'Processando informações...', progress: 60 },
        { step: 'Gerando estatísticas...', progress: 80 },
        { step: 'Finalizando carregamento...', progress: 100 }
      ];

      // Timeout aumentado para bases grandes como SINTECT/SPM
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout: Carregamento demorou mais de 5 minutos')), 300000); // 5 minutos
      });
      
      // Importar dinamicamente para evitar importação circular
      setCurrentLoadingStep(progressSteps[0].step);
      setLoadingProgress(progressSteps[0].progress);
      const { dashboardService } = await import('@/services/dashboardService');
      
      // Simular progresso durante a requisição
      const progressInterval = setInterval(() => {
        setLoadingProgress(prev => {
          const nextStep = progressSteps.find(step => step.progress > prev);
          if (nextStep) {
            setCurrentLoadingStep(nextStep.step);
            return nextStep.progress;
          }
          return prev;
        });
      }, 500);
      
      // Buscar dados da tabela base_dados com timeout
      console.log('📡 Fazendo requisição para /api/dashboard/base-dados...');
      const baseDadosResponse = await Promise.race([
        dashboardService.getBaseDados(monthYear, baseSindical),
        timeoutPromise
      ]) as any;
      
      clearInterval(progressInterval);
      
      console.log('📡 Resposta recebida:', baseDadosResponse);
      console.log('📡 Success:', baseDadosResponse.success);
      console.log('📡 Data:', baseDadosResponse.data);
      console.log('📡 Employees length:', baseDadosResponse.data?.employees?.length);
      
      if (baseDadosResponse.success && baseDadosResponse.data.employees.length > 0) {
        // Converter os dados para o formato ProcessedData
        const baseDadosData: ProcessedData = {
          employees: baseDadosResponse.data.employees,
          columns: baseDadosResponse.data.columns,
          summary: baseDadosResponse.data.summary,
          errors: baseDadosResponse.data.errors,
          uploadedAt: baseDadosResponse.data.uploadedAt,
          fileName: baseDadosResponse.data.fileName,
          dataSource: 'base_dados',
          selectedMonthYear: baseDadosResponse.data.selectedMonthYear,
          totalRecordsInDatabase: baseDadosResponse.data.totalRecordsInDatabase,
          filteredRecords: baseDadosResponse.data.filteredRecords,
          availableMonths: baseDadosResponse.data.availableMonths,
          availableBasesSindicais: baseDadosResponse.data.availableBasesSindicais,
          selectedBaseSindical: baseDadosResponse.data.selectedBaseSindical
        };
        
        setProcessedData(baseDadosData);
        setDataSource('base_dados');
        setLoadingProgress(100);
        setCurrentLoadingStep('Carregamento concluído!');
        console.log('✅ Dados da tabela base_dados carregados com sucesso');
      } else {
        console.log('ℹ️ Nenhum dado encontrado na tabela base_dados');
        setProcessedData(null);
        setDataSource(null);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar dados da base_dados:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido ao carregar dados da base_dados');
      setProcessedData(null);
      setDataSource(null);
    } finally {
      setIsLoadingBaseDados(false);
      // Aguardar um pouco antes de esconder o loading
      setTimeout(() => {
        setLoadingProgress(0);
        setCurrentLoadingStep('');
      }, 1000);
    }
  };

  // Função para carregar os dados mais recentes da empresa do usuário logado (fallback)
  const loadLatestCompanyData = async () => {
    // Verificar se há usuário autenticado
    if (!user) {
      console.log('⚠️ Tentativa de carregar dados sem usuário autenticado');
      return;
    }

    try {
      setIsLoadingLatestData(true);
      setError(null);
      
      console.log('🔄 Iniciando carregamento de dados para usuário:', user.email);
      
      // Timeout para evitar travamento
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout: Carregamento demorou mais de 60 segundos')), 60000);
      });
      
      // Importar dinamicamente para evitar importação circular
      const { dashboardService } = await import('@/services/dashboardService');
      
      // Buscar dados dos funcionários da empresa com timeout
      const employeesResponse = await Promise.race([
        dashboardService.getEmployees(),
        timeoutPromise
      ]) as any;
      
      if (employeesResponse.success && employeesResponse.data.employees.length > 0) {
        // Converter os dados para o formato ProcessedData
        const latestData: ProcessedData = {
          employees: employeesResponse.data.employees,
          columns: employeesResponse.data.columns,
          summary: employeesResponse.data.summary,
          errors: employeesResponse.data.errors,
          uploadedAt: employeesResponse.data.uploadedAt,
          fileName: employeesResponse.data.fileName,
          dataSource: employeesResponse.data.dataSource || 'employee_data'
        };
        
        setProcessedData(latestData);
        setDataSource(employeesResponse.data.dataSource || 'employee_data');
        console.log('✅ Dados mais recentes da empresa carregados automaticamente');
      } else {
        console.log('ℹ️ Nenhum arquivo encontrado para esta empresa');
        setProcessedData(null);
        setDataSource(null);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar dados mais recentes da empresa:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido ao carregar dados');
      setProcessedData(null);
      setDataSource(null);
    } finally {
      setIsLoadingLatestData(false);
    }
  };

  return (
    <DataContext.Provider value={{
      processedData,
      setProcessedData,
      clearData,
      hasData,
      loadLatestCompanyData,
      loadBaseDadosData,
      isLoadingLatestData,
      isLoadingBaseDados,
      error,
      dataSource,
      loadingProgress,
      currentLoadingStep,
      totalLoadingSteps
    }}>
      {children}
    </DataContext.Provider>
  );
};
