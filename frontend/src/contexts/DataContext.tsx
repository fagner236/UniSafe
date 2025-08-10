import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Employee } from '@/types';

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
}

interface DataContextType {
  processedData: ProcessedData | null;
  setProcessedData: (data: ProcessedData | null) => void;
  clearData: () => void;
  hasData: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

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

  const clearData = () => {
    setProcessedData(null);
  };

  const hasData = processedData !== null;

  return (
    <DataContext.Provider value={{
      processedData,
      setProcessedData,
      clearData,
      hasData
    }}>
      {children}
    </DataContext.Provider>
  );
};
