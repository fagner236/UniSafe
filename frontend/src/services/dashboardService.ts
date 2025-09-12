import api from '@/config/axios';

export interface DashboardStats {
  totalEmployees: number;
  activeEmployees: number;
  inactiveEmployees: number;
  pendingEmployees: number;
  totalCompanies: number;
  totalDepartments: number;
  averageSalary: number;
  recentUploads: number;
  dataSource?: 'base_dados' | 'employee_data';
}

export interface DashboardEmployees {
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
  errors: Array<{
    row: number;
    field: string;
    message: string;
  }>;
  uploadedAt: string;
  fileName: string;
  dataSource?: 'base_dados' | 'employee_data';
}

export const dashboardService = {
  // Buscar estatísticas do dashboard
  async getStats(): Promise<{ success: boolean; data: DashboardStats }> {
    const response = await api.get('/dashboard/stats');
    return response.data;
  },

  // Buscar dados dos funcionários
  async getEmployees(): Promise<{ success: boolean; data: DashboardEmployees }> {
    const response = await api.get('/dashboard/employees');
    return response.data;
  },

  // Nova rota para buscar dados diretamente da tabela base_dados
  async getBaseDados(monthYear?: string): Promise<{ success: boolean; data: DashboardEmployees }> {
    const params = monthYear ? { monthYear } : {};
    const response = await api.get('/dashboard/base-dados', { params });
    return response.data;
  }
};
