export interface Employee {
  id: string;
  name?: string;
  cpf?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  position?: string;
  department?: string;
  company?: string;
  admissionDate?: string;
  salary?: number;
  status: 'active' | 'inactive' | 'pending';
  unionMemberSince?: string;
  lastUpdate: string;
  [key: string]: any; // Permite propriedades dinâmicas
}

export interface ColumnMapping {
  id?: string;
  uploadId: string;
  fileName: string;
  columnMappings: Record<string, string>;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface SaveMappingsRequest {
  uploadId: string;
  fileName: string;
  columnMappings: Record<string, string>;
}

export interface SaveMappingsResponse {
  success: boolean;
  message: string;
  data?: {
    mappingId: string;
    savedMappings: Record<string, string>;
  };
  error?: string;
}

export interface GetMappingsResponse {
  success: boolean;
  data: ColumnMapping[];
  message?: string;
}

export interface UploadFile {
  id: string;
  filename: string;
  originalName: string;
  size: number;
  status: 'pending' | 'processing' | 'completed' | 'completed_with_errors' | 'error';
  uploadedAt: string;
  processedAt?: string;
  errorMessage?: string;
  totalRecords?: number;
  processedRecords?: number;
  id_empresa?: string; // Campo para vincular à empresa
}

export interface DashboardStats {
  totalEmployees: number;
  activeEmployees: number;
  inactiveEmployees: number;
  pendingEmployees: number;
  totalCompanies: number;
  totalDepartments: number;
  averageSalary: number;
  recentUploads: number;
}

export interface Company {
  id: string;
  name: string;
  cnpj: string;
  address: string;
  city: string;
  state: string;
  employeeCount: number;
}

export interface Department {
  id: string;
  name: string;
  employeeCount: number;
  averageSalary: number;
}

export interface BaseDadosField {
  field: string;
  label: string;
  description: string;
  required: boolean;
}

export interface User {
  id_usuario: string;
  nome: string;
  email: string;
  perfil: 'admin' | 'user' | 'ghost';
  base_sindical?: string;
  data_criacao: string;
  data_atualizacao?: string;
  id_empresa?: string;
  empresa?: {
    nome_fantasia: string | null;
    razao_social: string;
    cnpj: string;
  } | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface FilterOptions {
  search?: string;
  status?: string;
  company?: string;
  department?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}
