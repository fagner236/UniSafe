import api from '@/config/axios';
import { UploadFile, SaveMappingsRequest, SaveMappingsResponse, GetMappingsResponse } from '@/types';

export interface UploadResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    originalName: string;
    size: number;
    status: string;
    uploadedAt: string;
    id_empresa?: string;
  };
}

export interface GetUploadsResponse {
  success: boolean;
  data: UploadFile[];
}

export interface GetUploadDataResponse {
  success: boolean;
  data: {
    upload: any;
    employees: any[];
    columns: string[];
    summary: {
      totalRecords: number;
      validRecords: number;
      invalidRecords: number;
      companies: string[];
      departments: string[];
      averageSalary: number;
    };
    errors: string[];
  };
}

export interface ImportBaseDadosResponse {
  success: boolean;
  message: string;
  data: {
    totalRecords: number;
    importedRecords: number;
    errorCount: number;
    errors: string[];
  };
}

export const uploadService = {
  // Upload de arquivo
  async uploadFile(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  // Buscar uploads do usuário
  async getUploads(): Promise<GetUploadsResponse> {
    const response = await api.get('/upload');
    return response.data;
  },

  // Buscar dados processados de um upload específico
  async getUploadData(uploadId: string): Promise<GetUploadDataResponse> {
    const response = await api.get(`/upload/${uploadId}/data`);
    return response.data;
  },

  // Buscar bases sindicais dos uploads
  async getBasesSindicais(): Promise<{ success: boolean; data: string[] }> {
    const response = await api.get('/upload/bases-sindicais');
    return response.data;
  },

  // Importar dados para base_dados
  async importToBaseDados(uploadId: string, processedData?: any): Promise<ImportBaseDadosResponse> {
    const payload = processedData ? { processedData } : {};
    const response = await api.post(`/upload/${uploadId}/import-base-dados`, payload);
    return response.data;
  },

  // Salvar mapeamentos de colunas
  async saveColumnMappings(mappings: SaveMappingsRequest): Promise<SaveMappingsResponse> {
    const response = await api.post('/upload/column-mappings', mappings);
    return response.data;
  },

  // Buscar mapeamentos salvos
  async getColumnMappings(): Promise<GetMappingsResponse> {
    const response = await api.get('/upload/column-mappings');
    return response.data;
  },

  // Buscar mapeamentos por upload específico
  async getColumnMappingsByUpload(uploadId: string): Promise<GetMappingsResponse> {
    const response = await api.get(`/upload/${uploadId}/column-mappings`);
    return response.data;
  }
};
