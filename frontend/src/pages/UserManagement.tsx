import { useState, useEffect } from 'react';
import { 
  Search, 
  Download, 
  Edit, 
  Trash, 
  Filter, 
  ChevronUp, 
  ChevronDown,
  Plus,
  Users,
  Shield,
  User,
  Ghost,
  Mail,
  Building2,
  AlertTriangle,
  XCircle,
  Eye,
  Printer,
  X,
  FileSpreadsheet,
  FileText,
  FileDown
} from 'lucide-react';
import api from '@/config/axios';
import { useAuth } from '@/contexts/AuthContext';
import { useDebounce } from '@/hooks/useDebounce';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface User {
  id_usuario: string;
  nome: string;
  email: string;
  perfil: 'admin' | 'user' | 'guest';
  base_sindical?: string;
  data_criacao: string;
  data_atualizacao: string;
  id_empresa?: string;
  empresa?: {
    razao_social: string;
    nome_fantasia?: string;
    cnpj: string;
  };
}

interface UserStats {
  totalUsers: number;
  adminUsers: number;
  userUsers: number;
  guestUsers: number;
  newUsersThisMonth: number;
  lastActivity: string;
}

interface UserFilters {
  search: string;
  profile: string;
  status: string;
  dateFrom: string;
  dateTo: string;
  company: string;
}

const UserManagement = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<UserFilters>({
    search: '',
    profile: '',
    status: '',
    dateFrom: '',
    dateTo: '',
    company: ''
  });
  const debouncedSearch = useDebounce(filters.search, 500); // Debounce de 500ms
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortColumn, setSortColumn] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  // Estados dos modais
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    perfil: 'user' as 'admin' | 'user' | 'guest',
    id_empresa: '',
    base_sindical: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Estados para exportação
  const [exportFormat, setExportFormat] = useState<'excel' | 'csv' | 'pdf'>('excel');
  const [exportFilters, setExportFilters] = useState({
    profile: '',
    company: '',
    includeInactive: false
  });
  const [isExporting, setIsExporting] = useState(false);

  // Buscar usuários
  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      
      console.log('🔍 === UserManagement: fetchUsers iniciado ===');
      console.log('🔍 Usuário logado:', user);
      console.log('🔍 ID da empresa do usuário:', user?.id_empresa);
      console.log('🔍 Perfil do usuário:', user?.perfil);
      
      // UserManagement é acessado pelo link Sistema, então sempre usa a rota system
      // (apenas admins podem acessar)
      const response = await api.get('/users/system');
      console.log('📡 Resposta da API /users/system:', response.data);
      
      if (response.data.success) {
        setUsers(response.data.data);
        console.log('✅ Usuários carregados:', response.data.data.length);
        
        // Atualizar estatísticas
        setStats({
          totalUsers: response.data.totalUsers,
          adminUsers: response.data.data.filter((u: User) => u.perfil === 'admin').length,
          userUsers: response.data.data.filter((u: User) => u.perfil === 'user').length,
          guestUsers: response.data.data.filter((u: User) => u.perfil === 'guest').length,
          newUsersThisMonth: response.data.data.filter((u: User) => {
            const userDate = new Date(u.data_criacao);
            const now = new Date();
            return userDate.getMonth() === now.getMonth() && userDate.getFullYear() === now.getFullYear();
          }).length,
          lastActivity: new Date().toISOString()
        });
      } else {
        console.log('❌ Resposta da API não foi bem-sucedida:', response.data);
      }
    } catch (error: any) {
      console.error('❌ Erro ao buscar usuários:', error);
      console.error('❌ Status da resposta:', error.response?.status);
      console.error('❌ Dados da resposta:', error.response?.data);
    } finally {
      setIsLoading(false);
    }
  };

  // Buscar estatísticas
  const fetchStats = async () => {
    try {
      const response = await api.get('/users/stats');
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
    }
  };


  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, []);

  // Função para ordenar dados
  const sortData = (data: User[], column: string, direction: 'asc' | 'desc') => {
    return [...data].sort((a, b) => {
      let valueA = (a as any)[column];
      let valueB = (b as any)[column];

      if (typeof valueA === 'string' && typeof valueB === 'string') {
        const comparison = valueA.localeCompare(valueB, 'pt-BR', { numeric: true });
        return direction === 'asc' ? comparison : -comparison;
      }

      const strA = String(valueA || '');
      const strB = String(valueB || '');
      const comparison = strA.localeCompare(strB, 'pt-BR', { numeric: true });
      return direction === 'asc' ? comparison : -comparison;
    });
  };

  // Função para lidar com ordenação
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  // Filtrar usuários
  const filteredUsers = users.filter(userItem => {
    if (debouncedSearch) {
      const searchLower = debouncedSearch.toLowerCase();
      if (!userItem.nome.toLowerCase().includes(searchLower) && 
          !userItem.email.toLowerCase().includes(searchLower) &&
          !(userItem.empresa?.razao_social?.toLowerCase().includes(searchLower) || 
            userItem.empresa?.nome_fantasia?.toLowerCase().includes(searchLower))) {
        return false;
      }
    }

    if (filters.profile && userItem.perfil !== filters.profile) {
      return false;
    }

    if (filters.company && userItem.empresa?.cnpj !== filters.company) {
      return false;
    }

    if (filters.dateFrom || filters.dateTo) {
      const userDate = new Date(userItem.data_criacao);
      if (filters.dateFrom && userDate < new Date(filters.dateFrom)) {
        return false;
      }
      if (filters.dateTo && userDate > new Date(filters.dateTo)) {
        return false;
      }
    }

    return true;
  });

  // Aplicar ordenação
  const sortedUsers = sortColumn 
    ? sortData(filteredUsers, sortColumn, sortDirection)
    : filteredUsers;

  // Paginação
  const totalPages = Math.ceil(sortedUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUsers = sortedUsers.slice(startIndex, endIndex);

  // Limpar filtros
  const clearFilters = () => {
    setFilters({
      search: '',
      profile: '',
      status: '',
      dateFrom: '',
      dateTo: '',
      company: ''
    });
    setCurrentPage(1);
  };

  // Aplicar filtros
  const applyFilters = () => {
    setCurrentPage(1);
  };



  // Editar usuário
  const handleEditUser = async () => {
    if (!selectedUser) return;
    
    // Backup da lista original para rollback
    const originalUsers = [...users];
    
    try {
      setIsSubmitting(true);
      
      // 🚀 OPTIMISTIC UPDATE: Atualizar usuário na lista imediatamente
      setUsers(users.map(u => 
        u.id_usuario === selectedUser.id_usuario 
          ? { ...u, nome: formData.nome, email: formData.email, perfil: formData.perfil as 'admin' | 'user' | 'guest', id_empresa: formData.id_empresa, base_sindical: formData.base_sindical }
          : u
      ));
      
      const response = await api.put(`/users/${selectedUser.id_usuario}`, formData);
      
      if (response.data.success) {
        // Atualizar lista de usuários com dados confirmados do servidor
        await fetchUsers();
        setShowEditModal(false);
        setSelectedUser(null);
        setFormData({ nome: '', email: '', perfil: 'user', id_empresa: '', base_sindical: '' });
        
        // Mostrar mensagem de sucesso
        alert('Usuário atualizado com sucesso!');
      } else {
        // 🔄 ROLLBACK: Reverter para lista original em caso de erro
        setUsers(originalUsers);
        alert('Erro ao atualizar usuário');
      }
    } catch (error: any) {
      // 🔄 ROLLBACK: Reverter para lista original em caso de erro
      setUsers(originalUsers);
      console.error('Erro ao editar usuário:', error);
      const message = error.response?.data?.message || 'Erro ao editar usuário';
      alert(`Erro: ${message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Excluir usuário
  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    
    // Backup da lista original para rollback
    const originalUsers = [...users];
    const userIdToDelete = selectedUser.id_usuario;
    
    try {
      setIsSubmitting(true);
      
      // 🚀 OPTIMISTIC UPDATE: Remover usuário da lista imediatamente
      setUsers(users.filter(u => u.id_usuario !== userIdToDelete));
      setShowDeleteModal(false);
      setSelectedUser(null);
      
      const response = await api.delete(`/users/${userIdToDelete}`);
      
      if (response.data.success) {
        // Atualizar lista de usuários com dados confirmados do servidor
        await fetchUsers();
        
        // Mostrar mensagem de sucesso
        alert('Usuário excluído com sucesso!');
      } else {
        // 🔄 ROLLBACK: Reverter para lista original em caso de erro
        setUsers(originalUsers);
        setShowDeleteModal(true);
        setSelectedUser(originalUsers.find(u => u.id_usuario === userIdToDelete) || null);
        alert('Erro ao excluir usuário');
      }
    } catch (error: any) {
      // 🔄 ROLLBACK: Reverter para lista original em caso de erro
      setUsers(originalUsers);
      setShowDeleteModal(true);
      setSelectedUser(originalUsers.find(u => u.id_usuario === userIdToDelete) || null);
      console.error('Erro ao excluir usuário:', error);
      const message = error.response?.data?.message || 'Erro ao excluir usuário';
      alert(`Erro: ${message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset de senha
  const handleResetPassword = async (userId: string) => {
    try {
      const response = await api.post(`/users/${userId}/reset-password`);
      
      if (response.data.success) {
        const newPassword = response.data.newPassword;
        alert(`Senha resetada com sucesso! Nova senha: ${newPassword}`);
      }
    } catch (error: any) {
      console.error('Erro ao resetar senha:', error);
      const message = error.response?.data?.message || 'Erro ao resetar senha';
      alert(`Erro: ${message}`);
    }
  };

  // Criar novo usuário
  const handleCreateUser = async () => {
    // Backup da lista original para rollback
    const originalUsers = [...users];
    
    try {
      setIsSubmitting(true);
      
      // 🚀 OPTIMISTIC UPDATE: Adicionar usuário à lista imediatamente
      const optimisticUser: User = {
        id_usuario: `temp_${Date.now()}`, // ID temporário
        nome: formData.nome,
        email: formData.email,
        perfil: formData.perfil as 'admin' | 'user' | 'guest',
        id_empresa: formData.id_empresa,
        base_sindical: formData.base_sindical,
        data_criacao: new Date().toISOString(),
        data_atualizacao: new Date().toISOString(),
        empresa: undefined // Será preenchido pela resposta do servidor
      };
      setUsers([...users, optimisticUser]);
      
      const response = await api.post('/users', formData);
      
      if (response.data.success) {
        // Atualizar lista de usuários com dados confirmados do servidor
        await fetchUsers();
        setShowCreateModal(false);
        setFormData({ nome: '', email: '', perfil: 'user', id_empresa: '', base_sindical: '' });
        
        // Mostrar mensagem de sucesso
        alert('Usuário criado com sucesso! Senha padrão: 123456');
      } else {
        // 🔄 ROLLBACK: Reverter para lista original em caso de erro
        setUsers(originalUsers);
        alert('Erro ao criar usuário');
      }
    } catch (error: any) {
      // 🔄 ROLLBACK: Reverter para lista original em caso de erro
      setUsers(originalUsers);
      console.error('Erro ao criar usuário:', error);
      const message = error.response?.data?.message || 'Erro ao criar usuário';
      alert(`Erro: ${message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Função para abrir o modal de visualização
  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setShowViewModal(true);
  };

  // Função para fechar o modal de visualização
  const handleCloseViewModal = () => {
    setShowViewModal(false);
    setSelectedUser(null);
  };

  // Função para imprimir dados do usuário
  const handlePrintUser = () => {
    if (!selectedUser) return;

    // Criar uma nova janela para impressão
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    
    if (!printWindow) {
      alert('Não foi possível abrir a janela de impressão. Verifique se o bloqueador de pop-ups está desabilitado.');
      return;
    }

    // Gerar HTML para impressão
    const printHTML = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Dados do Usuário - ${selectedUser.nome}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 10px;
            color: #333;
            line-height: 1.4;
            font-size: 12px;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #1d335b;
            padding-bottom: 10px;
            margin-bottom: 15px;
          }
          .header h1 {
            color: #1d335b;
            margin: 0;
            font-size: 18px;
          }
          .header p {
            color: #666;
            margin: 3px 0 0 0;
            font-size: 11px;
          }
          .summary {
            background: #e3f2fd;
            padding: 10px;
            border-radius: 6px;
            margin-bottom: 15px;
          }
          .summary h3 {
            margin: 0 0 8px 0;
            color: #1d335b;
            font-size: 14px;
          }
          .summary-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 8px;
          }
          .summary-item {
            background: white;
            padding: 6px;
            border-radius: 4px;
            border: 1px solid #ddd;
          }
          .summary-label {
            font-weight: bold;
            color: #1d335b;
            font-size: 10px;
            text-transform: uppercase;
            margin-bottom: 3px;
          }
          .summary-value {
            color: #333;
            font-size: 11px;
          }
          .user-info {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin-bottom: 15px;
          }
          .info-card {
            background: #f8f9fa;
            padding: 10px;
            border-radius: 6px;
            border-left: 3px solid #1d335b;
          }
          .info-card h3 {
            margin: 0 0 8px 0;
            color: #1d335b;
            font-size: 13px;
          }
          .info-item {
            display: flex;
            justify-content: space-between;
            padding: 4px 0;
            border-bottom: 1px solid #e9ecef;
            font-size: 11px;
          }
          .info-item:last-child {
            border-bottom: none;
          }
          .info-label {
            font-weight: bold;
            color: #555;
            text-transform: capitalize;
            flex: 1;
            margin-right: 8px;
          }
          .info-value {
            color: #333;
            text-align: right;
            flex: 1;
            word-wrap: break-word;
            max-width: 150px;
          }
          .footer {
            text-align: center;
            margin-top: 15px;
            padding-top: 10px;
            border-top: 1px solid #ddd;
            color: #666;
            font-size: 10px;
          }
          @media print {
            body { 
              margin: 0; 
              font-size: 11px;
            }
            .no-print { display: none; }
            @page {
              margin: 0.5in;
              size: A4;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Dados do Usuário</h1>
          <p>Relatório gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}</p>
        </div>

        <div class="summary">
          <h3>Resumo</h3>
          <div class="summary-grid">
            <div class="summary-item">
              <div class="summary-label">Nome Completo</div>
              <div class="summary-value">${selectedUser.nome}</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">E-mail</div>
              <div class="summary-value">${selectedUser.email}</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">Perfil</div>
              <div class="summary-value">${selectedUser.perfil.toUpperCase()}</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">Empresa</div>
              <div class="summary-value">${selectedUser.empresa?.nome_fantasia || selectedUser.empresa?.razao_social || '-'}</div>
            </div>
          </div>
        </div>

        <div class="user-info">
          <div class="info-card">
            <h3>Informações Pessoais</h3>
            <div class="info-item">
              <span class="info-label">Nome Completo</span>
              <span class="info-value">${selectedUser.nome}</span>
            </div>
            <div class="info-item">
              <span class="info-label">E-mail</span>
              <span class="info-value">${selectedUser.email}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Perfil</span>
              <span class="info-value">${selectedUser.perfil.toUpperCase()}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Base Sindical</span>
              <span class="info-value">${selectedUser.base_sindical || '-'}</span>
            </div>
          </div>
          <div class="info-card">
            <h3>Informações da Empresa</h3>
            <div class="info-item">
              <span class="info-label">Razão Social</span>
              <span class="info-value">${selectedUser.empresa?.razao_social || '-'}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Nome Fantasia</span>
              <span class="info-value">${selectedUser.empresa?.nome_fantasia || '-'}</span>
            </div>
            <div class="info-item">
              <span class="info-label">CNPJ</span>
              <span class="info-value">${selectedUser.empresa?.cnpj || '-'}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Data de Criação</span>
              <span class="info-value">${new Date(selectedUser.data_criacao).toLocaleDateString('pt-BR')}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Última Atualização</span>
              <span class="info-value">${new Date(selectedUser.data_atualizacao).toLocaleDateString('pt-BR')}</span>
            </div>
          </div>
        </div>

        <div class="footer">
          <p>Evia - UniSafe - Sistema de Gestão de Dados</p>
          <p>Este relatório foi gerado automaticamente pelo sistema</p>
        </div>

        <script>
          window.onload = function() {
            window.print();
            window.onafterprint = function() {
              window.close();
            };
          };
        </script>
      </body>
      </html>
    `;

    // Escrever o HTML na nova janela
    printWindow.document.write(printHTML);
    printWindow.document.close();
  };

  // Função para abrir o modal de exportação
  const handleOpenExportModal = () => {
    setShowExportModal(true);
  };

  // Função para fechar o modal de exportação
  const handleCloseExportModal = () => {
    setShowExportModal(false);
    setExportFormat('excel');
    setExportFilters({
      profile: '',
      company: '',
      includeInactive: false
    });
  };

  // Função para filtrar usuários para exportação
  const getFilteredUsersForExport = () => {
    let filteredUsers = [...users];

    // Aplicar filtros
    if (exportFilters.profile) {
      filteredUsers = filteredUsers.filter(user => user.perfil === exportFilters.profile);
    }

    if (exportFilters.company) {
      filteredUsers = filteredUsers.filter(user => user.id_empresa === exportFilters.company);
    }

    return filteredUsers;
  };

  // Função para exportar para Excel
  const exportToExcel = () => {
    const filteredUsers = getFilteredUsersForExport();
    
    const data = filteredUsers.map(user => ({
      'Nome': user.nome,
      'E-mail': user.email,
      'Perfil': getProfileName(user.perfil),
      'Base Sindical': user.base_sindical || '-',
      'Empresa': user.empresa?.nome_fantasia || user.empresa?.razao_social || '-',
      'CNPJ': user.empresa?.cnpj || '-',
      'Data de Criação': new Date(user.data_criacao).toLocaleDateString('pt-BR'),
      'Última Atualização': new Date(user.data_atualizacao).toLocaleDateString('pt-BR')
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Usuários');
    
    // Ajustar largura das colunas
    const colWidths = [
      { wch: 25 }, // Nome
      { wch: 30 }, // E-mail
      { wch: 10 }, // Perfil
      { wch: 20 }, // Base Sindical
      { wch: 25 }, // Empresa
      { wch: 18 }, // CNPJ
      { wch: 15 }, // Data de Criação
      { wch: 18 }  // Última Atualização
    ];
    ws['!cols'] = colWidths;

    XLSX.writeFile(wb, `Evia - Unisafe - ${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Função para exportar para CSV
  const exportToCSV = () => {
    const filteredUsers = getFilteredUsersForExport();
    
    const headers = ['Nome', 'E-mail', 'Perfil', 'Base Sindical', 'Empresa', 'CNPJ', 'Data de Criação', 'Última Atualização'];
    const csvContent = [
      headers.join(','),
      ...filteredUsers.map(user => [
        `"${user.nome}"`,
        `"${user.email}"`,
        `"${getProfileName(user.perfil)}"`,
        `"${user.base_sindical || '-'}"`,
        `"${user.empresa?.nome_fantasia || user.empresa?.razao_social || '-'}"`,
        `"${user.empresa?.cnpj || '-'}"`,
        `"${new Date(user.data_criacao).toLocaleDateString('pt-BR')}"`,
        `"${new Date(user.data_atualizacao).toLocaleDateString('pt-BR')}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `Evia - Unisafe - ${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Função para exportar para PDF
  const exportToPDF = () => {
    try {
      const filteredUsers = getFilteredUsersForExport();
      
      // Criar documento PDF em modo paisagem
      const doc = new jsPDF('landscape', 'mm', 'a4');
      
      // Cabeçalho
      doc.setFontSize(16);
      doc.setTextColor(29, 51, 91);
      doc.text('Relatório de Usuários', 14, 20);
      
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, 14, 28);
      doc.text(`Total de usuários: ${filteredUsers.length}`, 14, 34);

      // Criar tabela manualmente
      let yPosition = 50;
      const lineHeight = 8;
      const pageHeight = doc.internal.pageSize.height;
      const pageWidth = doc.internal.pageSize.width;
      
      // Cabeçalho da tabela
      doc.setFontSize(8);
      doc.setTextColor(255, 255, 255);
      doc.setFillColor(29, 51, 91);
      doc.rect(14, yPosition, pageWidth - 28, lineHeight, 'F');
      
      // Texto do cabeçalho
      doc.text('Nome', 15, yPosition + 5);
      doc.text('E-mail', 50, yPosition + 5);
      doc.text('Perfil', 100, yPosition + 5);
      doc.text('Base Sindical', 130, yPosition + 5);
      doc.text('Empresa', 170, yPosition + 5);
      doc.text('CNPJ', 220, yPosition + 5);
      doc.text('Data Criação', 260, yPosition + 5);
      
      yPosition += lineHeight + 8; // Adicionar mais espaçamento após o cabeçalho
      
      // Dados da tabela
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(7);
      
      // Desenhar borda externa da tabela
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.5);
      doc.rect(14, 50, pageWidth - 28, lineHeight, 'S'); // Borda do cabeçalho
      
      filteredUsers.forEach((user) => {
        // Verificar se precisa de nova página
        if (yPosition > pageHeight - 30) {
          doc.addPage();
          yPosition = 20;
          
          // Recriar cabeçalho na nova página
          doc.setFontSize(8);
          doc.setTextColor(255, 255, 255);
          doc.setFillColor(29, 51, 91);
          doc.rect(14, yPosition, pageWidth - 28, lineHeight, 'F');
          doc.text('Nome', 15, yPosition + 5);
          doc.text('E-mail', 50, yPosition + 5);
          doc.text('Perfil', 100, yPosition + 5);
          doc.text('Base Sindical', 130, yPosition + 5);
          doc.text('Empresa', 170, yPosition + 5);
          doc.text('CNPJ', 220, yPosition + 5);
          doc.text('Data Criação', 260, yPosition + 5);
          
          // Borda do cabeçalho na nova página
          doc.setDrawColor(0, 0, 0);
          doc.setLineWidth(0.5);
          doc.rect(14, yPosition, pageWidth - 28, lineHeight, 'S');
          
          yPosition += lineHeight + 4;
          doc.setFontSize(7);
          doc.setTextColor(0, 0, 0);
        }
        
        // Linha de dados
        const nome = (user.nome || '-').substring(0, 20);
        const email = (user.email || '-').substring(0, 25);
        const perfil = getProfileName(user.perfil);
        const baseSindical = (user.base_sindical || '-').substring(0, 15);
        const empresa = (user.empresa?.nome_fantasia || user.empresa?.razao_social || '-').substring(0, 20);
        const cnpj = (user.empresa?.cnpj || '-').substring(0, 15);
        const dataCriacao = new Date(user.data_criacao).toLocaleDateString('pt-BR');
        
        // Desenhar linha horizontal da célula
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.2);
        doc.line(14, yPosition, pageWidth - 14, yPosition);
        
        // Desenhar linhas verticais das colunas
        const columnPositions = [14, 50, 100, 130, 170, 220, 260, pageWidth - 14];
        columnPositions.forEach(x => {
          doc.line(x, yPosition - lineHeight, x, yPosition);
        });
        
        doc.text(nome, 15, yPosition - 2);
        doc.text(email, 52, yPosition - 2);
        doc.text(perfil, 102, yPosition - 2);
        doc.text(baseSindical, 132, yPosition - 2);
        doc.text(empresa, 172, yPosition - 2);
        doc.text(cnpj, 222, yPosition - 2);
        doc.text(dataCriacao, 262, yPosition - 2);
        
        yPosition += lineHeight;
      });
      
      // Desenhar borda inferior da tabela
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.5);
      doc.line(14, yPosition - lineHeight, pageWidth - 14, yPosition - lineHeight);

      // Adicionar rodapé em todas as páginas
      const pageCount = (doc as any).internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text('Evia - UniSafe - Sistema de Gestão de Dados', 14, pageHeight - 10);
        doc.text(`Página ${i} de ${pageCount}`, pageWidth - 30, pageHeight - 10);
      }

      // Salvar o arquivo
      doc.save(`Evia - Unisafe - ${new Date().toISOString().split('T')[0]}.pdf`);
      
    } catch (error) {
      console.error('Erro na exportação PDF:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      throw new Error('Erro ao gerar PDF: ' + errorMessage);
    }
  };

  // Função principal de exportação
  const handleExport = async () => {
    try {
      setIsExporting(true);
      
      switch (exportFormat) {
        case 'excel':
          exportToExcel();
          break;
        case 'csv':
          exportToCSV();
          break;
        case 'pdf':
          exportToPDF();
          break;
        default:
          exportToExcel();
      }
      
      // Fechar modal após exportação
      setTimeout(() => {
        handleCloseExportModal();
        alert('Exportação realizada com sucesso!');
      }, 1000);
      
    } catch (error) {
      console.error('Erro na exportação:', error);
      alert('Erro ao realizar a exportação. Tente novamente.');
    } finally {
      setIsExporting(false);
    }
  };

  // Função para obter ícone do perfil
  const getProfileIcon = (profile: string) => {
    switch (profile) {
      case 'admin': return <Shield className="h-4 w-4" />;
      case 'user': return <User className="h-4 w-4" />;
      case 'guest': return <Ghost className="h-4 w-4" />;
      default: return <User className="h-4 w-4" />;
    }
  };

  // Função para obter cor do perfil
  const getProfileColor = (profile: string) => {
    switch (profile) {
      case 'admin': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'user': return 'text-green-600 bg-green-50 border-green-200';
      case 'guest': return 'text-gray-600 bg-gray-50 border-gray-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  // Função para obter nome do perfil
  const getProfileName = (profile: string) => {
    switch (profile) {
      case 'admin': return 'Admin';
      case 'user': return 'User';
      case 'guest': return 'Guest';
      default: return profile;
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8fafc' }}>
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <div className="p-3 rounded-lg mr-4" style={{ backgroundColor: '#ffc9c0' }}>
              <Users className="h-8 w-8" style={{ color: '#1d335b' }} />
            </div>
            <div>
              <h1 className="text-3xl font-bold" style={{ color: '#1d335b' }}>
                Gestão de Usuários do Sistema (Admin)
              </h1>
              <p className="text-gray-600 mt-1">
                Gerencie todos os usuários de todas as empresas do sistema de forma centralizada e segura. Acesso restrito a administradores.
              </p>
            </div>
          </div>
          
          {/* Aviso de Segurança */}
          <div className="p-4 rounded-lg" style={{ backgroundColor: '#fff5f5', borderColor: '#ffc9c0', borderWidth: '1px', borderStyle: 'solid' }}>
            <div className="flex">
              <div className="flex-shrink-0">
                <Shield className="h-5 w-5" style={{ color: '#1d335b' }} />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium" style={{ color: '#8b5a5a' }}>
                  <strong>Segurança:</strong> Todas as ações são registradas para auditoria. 
                  Esta página é restrita a administradores e mostra TODOS os usuários de TODAS as empresas do sistema para gestão completa.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Estatísticas */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6">
              <div className="flex items-center">
                <div className="p-2 rounded-lg mr-3" style={{ backgroundColor: '#ffc9c0' }}>
                  <Users className="h-5 w-5" style={{ color: '#1d335b' }} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total de Usuários de Todas as Empresas (Admin)
                  </p>
                  <p className="text-2xl font-semibold" style={{ color: '#1d335b' }}>
                    {stats.totalUsers.toLocaleString('pt-BR')}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6">
              <div className="flex items-center">
                <div className="p-2 rounded-lg mr-3" style={{ backgroundColor: '#ffc9c0' }}>
                  <Shield className="h-5 w-5" style={{ color: '#1d335b' }} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Admin de Todas as Empresas (Admin)
                  </p>
                  <p className="text-2xl font-semibold" style={{ color: '#1d335b' }}>
                    {stats.adminUsers.toLocaleString('pt-BR')}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6">
              <div className="flex items-center">
                <div className="p-2 rounded-lg mr-3" style={{ backgroundColor: '#ffc9c0' }}>
                  <User className="h-5 w-5" style={{ color: '#1d335b' }} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total User de Todas as Empresas (Admin)
                  </p>
                  <p className="text-2xl font-semibold" style={{ color: '#1d335b' }}>
                    {stats.userUsers.toLocaleString('pt-BR')}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6">
              <div className="flex items-center">
                <div className="p-2 rounded-lg mr-3" style={{ backgroundColor: '#ffc9c0' }}>
                  <Ghost className="h-5 w-5" style={{ color: '#1d335b' }} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Guest de Todas as Empresas (Admin)
                  </p>
                  <p className="text-2xl font-semibold" style={{ color: '#1d335b' }}>
                    {stats.guestUsers.toLocaleString('pt-BR')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Filtros de Busca</h3>
          
          {/* Primeira linha - Filtros principais */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Buscar (Nome, E-mail ou Empresa)</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Nome, e-mail ou empresa..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 h-10 transition-colors"
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = '#c9504c'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = '#d1d5db'}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Perfil</label>
              <select
                value={filters.profile}
                onChange={(e) => setFilters(prev => ({ ...prev, profile: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-10"
              >
                <option value="">Todos os perfis</option>
                <option value="admin">Admin</option>
                <option value="user">User</option>
                <option value="guest">Guest</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Empresa
              </label>
              <select
                value={filters.company}
                onChange={(e) => setFilters(prev => ({ ...prev, company: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-10"
              >
                <option value="">Todas as empresas</option>
                {Array.from(new Set(users.map(u => u.empresa?.cnpj).filter(Boolean)))
                  .map(cnpj => {
                    const userItem = users.find(u => u.empresa?.cnpj === cnpj);
                    return {
                      cnpj,
                      nomeFantasia: userItem?.empresa?.nome_fantasia || userItem?.empresa?.razao_social || ''
                    };
                  })
                  .filter(item => item.nomeFantasia)
                  .sort((a, b) => a.nomeFantasia.localeCompare(b.nomeFantasia, 'pt-BR'))
                  .map(({ cnpj, nomeFantasia }) => (
                    <option key={cnpj} value={cnpj}>
                      {nomeFantasia}
                    </option>
                  ))}
              </select>
            </div>
          </div>
          
          {/* Segunda linha - Datas, paginação e botões */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Data Inicial</label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 h-10 transition-colors"
                onMouseEnter={(e) => e.currentTarget.style.borderColor = '#c9504c'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = '#d1d5db'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Data Final</label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 h-10 transition-colors"
                onMouseEnter={(e) => e.currentTarget.style.borderColor = '#c9504c'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = '#d1d5db'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Itens por página</label>
              <select
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-10"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={applyFilters}
                className="px-4 py-2 text-white rounded-md transition-colors h-10 w-full"
                style={{ backgroundColor: '#1d335b' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2a4a7a'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1d335b'}
              >
                <Search className="h-4 w-4 inline mr-2" />
                Aplicar
              </button>
            </div>

            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-white rounded-md transition-colors h-10 w-full"
                style={{ backgroundColor: '#c9504c' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#d65a56'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#c9504c'}
              >
                <Filter className="h-4 w-4 inline mr-2" />
                Limpar
              </button>
            </div>
          </div>
        </div>

        {/* Header da Tabela */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="space-y-4">
            {/* Título e Descrição */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Usuários de Todas as Empresas (Admin)
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Mostrando {currentUsers.length} de {filteredUsers.length} usuários de todas as empresas do sistema. Acesso restrito a administradores.
              </p>
            </div>
            
            {/* Botões de Ação */}
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  setFormData({ nome: '', email: '', perfil: 'user', id_empresa: '', base_sindical: '' });
                  setShowCreateModal(true);
                }}
                className="px-4 py-2 text-white rounded-md transition-colors h-10"
                style={{ backgroundColor: '#1d335b' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2a4a7a'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1d335b'}
              >
                <Plus className="h-4 w-4 inline mr-2" />
                Novo Usuário
              </button>
              <button
                onClick={handleOpenExportModal}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors h-10"
              >
                <Download className="h-4 w-4 inline mr-2" />
                Exportar
              </button>
            </div>
          </div>
        </div>

        {/* Tabela de Usuários */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Carregando usuários...</p>
            </div>
          ) : currentUsers.length === 0 ? (
            <div className="p-8 text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                Nenhum usuário encontrado em todas as empresas do sistema com os filtros aplicados. Acesso restrito a administradores.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort('nome')}
                    >
                      <div className="flex items-center justify-between">
                        <span>Nome</span>
                        <div className="flex flex-col ml-2">
                          {sortColumn === 'nome' ? (
                            sortDirection === 'asc' ? (
                              <ChevronUp className="h-3 w-3 text-red-600" />
                            ) : (
                              <ChevronDown className="h-3 w-3 text-red-600" />
                            )
                          ) : (
                            <div className="flex flex-col">
                              <ChevronUp className="h-3 w-3 text-gray-400" />
                              <ChevronDown className="h-3 w-3 text-gray-400" />
                            </div>
                          )}
                        </div>
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort('email')}
                    >
                      <div className="flex items-center justify-between">
                        <span>E-mail</span>
                        <div className="flex flex-col ml-2">
                          {sortColumn === 'email' ? (
                            sortDirection === 'asc' ? (
                              <ChevronUp className="h-3 w-3 text-red-600" />
                            ) : (
                              <ChevronDown className="h-3 w-3 text-red-600" />
                            )
                          ) : (
                            <div className="flex flex-col">
                              <ChevronUp className="h-3 w-3 text-gray-400" />
                              <ChevronDown className="h-3 w-3 text-gray-400" />
                            </div>
                          )}
                        </div>
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort('perfil')}
                    >
                      <div className="flex items-center justify-between">
                        <span>Perfil</span>
                        <div className="flex flex-col ml-2">
                          {sortColumn === 'perfil' ? (
                            sortDirection === 'asc' ? (
                              <ChevronUp className="h-3 w-3 text-red-600" />
                            ) : (
                              <ChevronDown className="h-3 w-3 text-red-600" />
                            )
                          ) : (
                            <div className="flex flex-col">
                              <ChevronUp className="h-3 w-3 text-gray-400" />
                              <ChevronDown className="h-3 w-3 text-gray-400" />
                            </div>
                          )}
                        </div>
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort('base_sindical')}
                    >
                      <div className="flex items-center justify-between">
                        <span>Base Sindical</span>
                        <div className="flex flex-col ml-2">
                          {sortColumn === 'base_sindical' ? (
                            sortDirection === 'asc' ? (
                              <ChevronUp className="h-3 w-3 text-red-600" />
                            ) : (
                              <ChevronDown className="h-3 w-3 text-red-600" />
                            )
                          ) : (
                            <div className="flex flex-col">
                              <ChevronUp className="h-3 w-3 text-gray-400" />
                              <ChevronDown className="h-3 w-3 text-gray-400" />
                            </div>
                          )}
                        </div>
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort('empresa')}
                    >
                      <div className="flex items-center justify-between">
                        <span>Empresa</span>
                        <div className="flex flex-col ml-2">
                          {sortColumn === 'empresa' ? (
                            sortDirection === 'asc' ? (
                              <ChevronUp className="h-3 w-3 text-red-600" />
                            ) : (
                              <ChevronDown className="h-3 w-3 text-red-600" />
                            )
                          ) : (
                            <div className="flex flex-col">
                              <ChevronUp className="h-3 w-3 text-gray-400" />
                              <ChevronDown className="h-3 w-3 text-red-600" />
                            </div>
                          )}
                        </div>
                      </div>
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentUsers.map((user) => (
                    <tr key={user.id_usuario} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-700">
                                {user.nome.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{user.nome}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">{user.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getProfileColor(user.perfil)}`}>
                          {getProfileIcon(user.perfil)}
                          <span className="ml-1">{getProfileName(user.perfil)}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Shield className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">
                            {user.base_sindical ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {user.base_sindical}
                              </span>
                            ) : (
                              <span className="text-gray-400">Não definida</span>
                            )}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Building2 className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">
                            {user.empresa ? (
                              <div>
                                <div className="font-medium">{user.empresa.nome_fantasia || user.empresa.razao_social}</div>
                                <div className="text-xs text-gray-500">{user.empresa.cnpj}</div>
                              </div>
                            ) : (
                              <span className="text-gray-400">Sem empresa</span>
                            )}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                           <button 
                             onClick={() => handleViewUser(user)}
                             className="text-blue-600 hover:text-blue-900 transition-colors"
                             title="Visualizar usuário"
                           >
                             <Eye className="h-4 w-4" />
                           </button>
                           <button 
                             className="text-green-600 hover:text-green-900"
                             title="Editar usuário"
                             onClick={() => {
                               setSelectedUser(user);
                               setFormData({
                                 nome: user.nome,
                                 email: user.email,
                                 perfil: user.perfil,
                                 id_empresa: user.id_empresa || '',
                                 base_sindical: user.base_sindical || ''
                               });
                               setShowEditModal(true);
                             }}
                           >
                             <Edit className="h-4 w-4" />
                           </button>
                           <button 
                             className="text-red-600 hover:text-red-900"
                             title="Excluir usuário"
                             onClick={() => {
                               setSelectedUser(user);
                               setShowDeleteModal(true);
                             }}
                           >
                             <Trash className="h-4 w-4" />
                           </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Paginação */}
          {filteredUsers.length > 0 && (
            <div className="mt-6 flex items-center justify-between px-6 py-4 border-t border-gray-200">
              <div className="text-sm text-gray-700">
                Página {currentPage} de {totalPages} ({filteredUsers.length.toLocaleString('pt-BR')} usuários de todas as empresas - Admin)
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Primeira página"
                >
                  ««
                </button>
                
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Página anterior"
                >
                  «
                </button>
                
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNumber;
                    if (totalPages <= 5) {
                      pageNumber = i + 1;
                    } else if (currentPage <= 3) {
                      pageNumber = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNumber = totalPages - 4 + i;
                    } else {
                      pageNumber = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => setCurrentPage(pageNumber)}
                        className={`px-3 py-1 text-sm border rounded-md transition-colors ${
                          currentPage === pageNumber
                            ? 'text-white border-red-600'
                            : 'border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                        }`}
                        style={{
                          backgroundColor: currentPage === pageNumber ? '#c9504c' : undefined,
                          borderColor: currentPage === pageNumber ? '#c9504c' : undefined
                        }}
                      >
                        {pageNumber}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Próxima página"
                >
                  »
                </button>
                
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Última página"
                >
                  »»
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal de Criação */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white" style={{ borderColor: '#c9504c' }}>
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Criar Novo Usuário
                  </h3>
                  <button
                    onClick={() => {
                      setShowCreateModal(false);
                      setFormData({ nome: '', email: '', perfil: 'user', id_empresa: '', base_sindical: '' });
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="h-6 w-6" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nome Completo *
                    </label>
                    <input
                      type="text"
                      value={formData.nome}
                      onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Nome completo do usuário"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      E-mail *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e-mail@exemplo.com"
                      required
                      autoComplete="email"
                      autoCorrect="off"
                      autoCapitalize="off"
                      spellCheck="false"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Perfil *
                    </label>
                    <select
                      value={formData.perfil}
                      onChange={(e) => setFormData(prev => ({ ...prev, perfil: e.target.value as 'admin' | 'user' | 'guest' }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="admin">Admin</option>
                      <option value="user">User</option>
                      <option value="guest">Guest</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Empresa *
                    </label>
                    <select
                      value={formData.id_empresa}
                      onChange={(e) => setFormData(prev => ({ ...prev, id_empresa: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Selecione uma empresa</option>
                      {Array.from(new Set(users.map(u => u.empresa?.cnpj).filter(Boolean)))
                        .map(cnpj => {
                          const userItem = users.find(u => u.empresa?.cnpj === cnpj);
                          return {
                            cnpj,
                            id_empresa: userItem?.id_empresa,
                            nomeFantasia: userItem?.empresa?.nome_fantasia || userItem?.empresa?.razao_social || ''
                          };
                        })
                        .filter(item => item.nomeFantasia && item.id_empresa)
                        .sort((a, b) => a.nomeFantasia.localeCompare(b.nomeFantasia, 'pt-BR'))
                        .map(({ cnpj, id_empresa, nomeFantasia }) => (
                          <option key={cnpj} value={id_empresa}>
                            {nomeFantasia}
                          </option>
                        ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Base Sindical
                    </label>
                    <input
                      type="text"
                      value={formData.base_sindical}
                      onChange={(e) => setFormData(prev => ({ ...prev, base_sindical: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Digite a base sindical"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Digite o nome da base sindical para este usuário
                    </p>
                  </div>
                  
                  <div className="bg-blue-50 p-3 rounded-md">
                    <p className="text-sm text-blue-700">
                      <strong>Nota:</strong> A senha padrão para novos usuários é "123456". O usuário poderá alterar esta senha após o primeiro login.
                    </p>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2 mt-6">
                  <button
                    onClick={() => {
                      setShowCreateModal(false);
                      setFormData({ nome: '', email: '', perfil: 'user', id_empresa: '', base_sindical: '' });
                    }}
                    className="px-4 py-2 text-sm font-medium rounded-md transition-colors disabled:opacity-50"
                    style={{ 
                      backgroundColor: '#ffc9c0',
                      color: '#1d335b',
                      border: 'none'
                    }}
                    onMouseEnter={(e) => !e.currentTarget.disabled && (e.currentTarget.style.backgroundColor = '#ffd1c8')}
                    onMouseLeave={(e) => !e.currentTarget.disabled && (e.currentTarget.style.backgroundColor = '#ffc9c0')}
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleCreateUser}
                    disabled={isSubmitting || !formData.nome || !formData.email || !formData.id_empresa}
                    className="px-4 py-2 text-sm font-medium rounded-md transition-colors disabled:opacity-50"
                    style={{ 
                      backgroundColor: '#c9504c',
                      color: 'white',
                      border: 'none'
                    }}
                    onMouseEnter={(e) => !e.currentTarget.disabled && (e.currentTarget.style.backgroundColor = '#d65a56')}
                    onMouseLeave={(e) => !e.currentTarget.disabled && (e.currentTarget.style.backgroundColor = '#c9504c')}
                  >
                    {isSubmitting ? 'Criando...' : 'Criar Usuário'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Edição */}
        {showEditModal && selectedUser && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white" style={{ borderColor: '#c9504c' }}>
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Editar Usuário
                  </h3>
                  <button
                    onClick={() => {
                      setShowEditModal(false);
                      setSelectedUser(null);
                      setFormData({ nome: '', email: '', perfil: 'user', id_empresa: '', base_sindical: '' });
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="h-6 w-6" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nome Completo
                    </label>
                    <input
                      type="text"
                      value={formData.nome}
                      onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
                      placeholder="Nome completo do usuário"
                      onFocus={(e) => e.currentTarget.style.borderColor = '#c9504c'}
                      onBlur={(e) => e.currentTarget.style.borderColor = '#d1d5db'}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      E-mail
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
                      placeholder="e-mail@exemplo.com"
                      autoComplete="email"
                      autoCorrect="off"
                      autoCapitalize="off"
                      spellCheck="false"
                      onFocus={(e) => e.currentTarget.style.borderColor = '#c9504c'}
                      onBlur={(e) => e.currentTarget.style.borderColor = '#d1d5db'}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Perfil
                    </label>
                    <select
                      value={formData.perfil}
                      onChange={(e) => setFormData(prev => ({ ...prev, perfil: e.target.value as 'admin' | 'user' | 'guest' }))}
                      className="w-full px-3 py-5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
                      onFocus={(e) => e.currentTarget.style.borderColor = '#c9504c'}
                      onBlur={(e) => e.currentTarget.style.borderColor = '#d1d5db'}
                    >
                      <option value="admin">Admin</option>
                      <option value="user">User</option>
                      <option value="guest">Guest</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Base Sindical
                    </label>
                    <input
                      type="text"
                      value={formData.base_sindical}
                      onChange={(e) => setFormData(prev => ({ ...prev, base_sindical: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
                      placeholder="Digite a base sindical"
                      onFocus={(e) => e.currentTarget.style.borderColor = '#c9504c'}
                      onBlur={(e) => e.currentTarget.style.borderColor = '#d1d5db'}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Digite o nome da base sindical para este usuário
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center justify-center mt-6 space-x-4">
                  <button
                    onClick={() => handleResetPassword(selectedUser.id_usuario)}
                    className="px-2 py-2 text-sm font-medium rounded-md transition-colors"
                    style={{ backgroundColor: '#ffc9c0', color: '#1d335b' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#ffd1c8'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffc9c0'}
                    title="Resetar senha"
                  >
                    Resetar Senha
                  </button>
                  
                  <button
                    onClick={handleEditUser}
                    disabled={isSubmitting}
                    className="px-1 py-2 text-sm text-white font-medium rounded-md transition-colors"
                    style={{ backgroundColor: '#1d335b' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2a4a7a'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1d335b'}
                  >
                    {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
                  </button>
                  
                  <button
                    onClick={() => {
                      setShowEditModal(false);
                      setSelectedUser(null);
                      setFormData({ nome: '', email: '', perfil: 'user', id_empresa: '', base_sindical: '' });
                    }}
                    className="px-4 py-4 text-sm text-white font-medium rounded-md transition-colors"
                    style={{ 
                      backgroundColor: '#c9504c',
                      paddingTop: '18px',
                      paddingBottom: '18px'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#d65a56'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#c9504c'}
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Visualização do Usuário */}
        {showViewModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
              {/* Header do Modal */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200" style={{ backgroundColor: '#f8fafc' }}>
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-full" style={{ backgroundColor: '#1d335b' }}>
                    <User className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      Dados do Usuário
                    </h2>
                    <p className="text-sm text-gray-600">
                      Visualização completa das informações
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handlePrintUser}
                    className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white rounded-md transition-colors"
                    style={{ backgroundColor: '#1d335b' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2a4a7a'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1d335b'}
                    title="Imprimir dados do usuário"
                  >
                    <Printer className="h-4 w-4" />
                    <span>Imprimir</span>
                  </button>
                  <button
                    onClick={handleCloseViewModal}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    title="Fechar"
                  >
                    <X className="h-5 w-5 text-gray-500" />
                  </button>
                </div>
              </div>

              {/* Conteúdo do Modal */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Informações Pessoais */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 mb-4">
                      <User className="h-5 w-5" style={{ color: '#1d335b' }} />
                      <h3 className="text-lg font-medium text-gray-900">Informações Pessoais</h3>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-sm font-medium text-gray-600">Nome Completo</span>
                        <span className="text-sm text-gray-900 text-right max-w-xs truncate" title={selectedUser.nome}>
                          {selectedUser.nome}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-sm font-medium text-gray-600">E-mail</span>
                        <span className="text-sm text-gray-900 text-right max-w-xs truncate" title={selectedUser.email}>
                          {selectedUser.email}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-sm font-medium text-gray-600">Perfil</span>
                        <span className="text-sm text-gray-900 text-right max-w-xs truncate">
                          {selectedUser.perfil.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-sm font-medium text-gray-600">Base Sindical</span>
                        <span className="text-sm text-gray-900 text-right max-w-xs truncate" title={selectedUser.base_sindical || '-'}>
                          {selectedUser.base_sindical || '-'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-sm font-medium text-gray-600">Data de Criação</span>
                        <span className="text-sm text-gray-900 text-right max-w-xs truncate" title={new Date(selectedUser.data_criacao).toLocaleDateString('pt-BR')}>
                          {new Date(selectedUser.data_criacao).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-sm font-medium text-gray-600">Última Atualização</span>
                        <span className="text-sm text-gray-900 text-right max-w-xs truncate" title={new Date(selectedUser.data_atualizacao).toLocaleDateString('pt-BR')}>
                          {new Date(selectedUser.data_atualizacao).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Resumo Visual */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 mb-4">
                      <Building2 className="h-5 w-5" style={{ color: '#1d335b' }} />
                      <h3 className="text-lg font-medium text-gray-900">Resumo</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-4">
                      {/* Card de Informações Principais */}
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-blue-100 rounded-full">
                            <User className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">Nome Completo</h4>
                            <p className="text-sm text-gray-600">
                              {selectedUser.nome}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Card de E-mail */}
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-green-100 rounded-full">
                            <Mail className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">E-mail</h4>
                            <p className="text-sm text-gray-600">
                              {selectedUser.email}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Card de Perfil */}
                      <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-4 rounded-lg border border-purple-200">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-purple-100 rounded-full">
                            <Shield className="h-5 w-5 text-purple-600" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">Perfil</h4>
                            <p className="text-sm text-gray-600">
                              {selectedUser.perfil.toUpperCase()}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Card de Empresa */}
                      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-4 rounded-lg border border-indigo-200">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-indigo-100 rounded-full">
                            <Building2 className="h-5 w-5 text-indigo-600" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">Empresa</h4>
                            <p className="text-sm text-gray-600">
                              {selectedUser.empresa?.nome_fantasia || selectedUser.empresa?.razao_social || '-'}
                            </p>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              </div>

              {/* Footer do Modal */}
              <div className="flex justify-end p-6 border-t border-gray-200" style={{ backgroundColor: '#f8fafc' }}>
                <button
                  onClick={handleCloseViewModal}
                  className="px-6 py-2 text-sm font-medium text-white rounded-md transition-colors"
                  style={{ backgroundColor: '#1d335b' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2a4a7a'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1d335b'}
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Exclusão */}
        {showDeleteModal && selectedUser && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-red-600">
                    Confirmar Exclusão
                  </h3>
                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setSelectedUser(null);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="h-6 w-6" />
                  </button>
                </div>
                
                <div className="mb-6">
                  <div className="flex items-center mb-4">
                    <AlertTriangle className="h-12 w-12 text-red-500 mr-3" />
                    <div>
                      <h4 className="text-lg font-medium text-gray-900">Atenção!</h4>
                      <p className="text-sm text-gray-600">Esta ação não pode ser desfeita.</p>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-md">
                    <p className="text-sm text-gray-700 mb-2">
                      <strong>Usuário:</strong> {selectedUser.nome}
                    </p>
                    <p className="text-sm text-gray-700 mb-2">
                      <strong>E-mail:</strong> {selectedUser.email}
                    </p>
                    <p className="text-sm text-gray-700 mb-2">
                      <strong>Perfil:</strong> {getProfileName(selectedUser.perfil)}
                    </p>
                    {selectedUser.empresa && (
                      <p className="text-sm text-gray-700">
                        <strong>Empresa:</strong> {selectedUser.empresa.nome_fantasia || selectedUser.empresa.razao_social}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setSelectedUser(null);
                    }}
                    className="px-4 py-2 text-sm font-medium rounded-md transition-colors disabled:opacity-50"
                    style={{ 
                      backgroundColor: '#ffc9c0',
                      color: '#1d335b',
                      border: 'none'
                    }}
                    onMouseEnter={(e) => !e.currentTarget.disabled && (e.currentTarget.style.backgroundColor = '#ffd1c8')}
                    onMouseLeave={(e) => !e.currentTarget.disabled && (e.currentTarget.style.backgroundColor = '#ffc9c0')}
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleDeleteUser}
                    disabled={isSubmitting}
                    className="px-4 py-2 text-sm text-white font-medium rounded-md transition-colors"
                    style={{ backgroundColor: '#c9504c' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#d65a56'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#c9504c'}
                  >
                    {isSubmitting ? 'Excluindo...' : 'Confirmar Exclusão'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Exportação */}
        {showExportModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
              {/* Header do Modal */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200" style={{ backgroundColor: '#f8fafc' }}>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    Exportar Dados de Usuários
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Selecione o formato e configure os filtros para exportação
                  </p>
                </div>
                <button
                  onClick={handleCloseExportModal}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Conteúdo do Modal */}
              <div className="p-6 space-y-6">
                {/* Seleção de Formato */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Formato de Exportação
                  </label>
                  <div className="grid grid-cols-3 gap-4">
                    <button
                      onClick={() => setExportFormat('excel')}
                      className={`p-4 border-2 rounded-lg transition-all ${
                        exportFormat === 'excel'
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <FileSpreadsheet className="h-8 w-8 mx-auto mb-2" />
                      <div className="text-sm font-medium">Excel</div>
                      <div className="text-xs text-gray-500">.xlsx</div>
                    </button>
                    
                    <button
                      onClick={() => setExportFormat('csv')}
                      className={`p-4 border-2 rounded-lg transition-all ${
                        exportFormat === 'csv'
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <FileText className="h-8 w-8 mx-auto mb-2" />
                      <div className="text-sm font-medium">CSV</div>
                      <div className="text-xs text-gray-500">.csv</div>
                    </button>
                    
                    <button
                      onClick={() => setExportFormat('pdf')}
                      className={`p-4 border-2 rounded-lg transition-all ${
                        exportFormat === 'pdf'
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <FileDown className="h-8 w-8 mx-auto mb-2" />
                      <div className="text-sm font-medium">PDF</div>
                      <div className="text-xs text-gray-500">.pdf</div>
                    </button>
                  </div>
                </div>

                {/* Filtros de Exportação */}
                <div className="border-t pt-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-4">Filtros de Exportação</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Filtro por Perfil */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Perfil
                      </label>
                      <select
                        value={exportFilters.profile}
                        onChange={(e) => setExportFilters(prev => ({ ...prev, profile: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Todos os perfis</option>
                        <option value="admin">Admin</option>
                        <option value="user">User</option>
                        <option value="guest">Guest</option>
                      </select>
                    </div>

                    {/* Filtro por Empresa */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Empresa
                      </label>
                      <select
                        value={exportFilters.company}
                        onChange={(e) => setExportFilters(prev => ({ ...prev, company: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Todas as empresas</option>
                        {Array.from(new Set(users.map(user => user.empresa?.cnpj).filter(Boolean)))
                          .map(cnpj => {
                            const userItem = users.find(u => u.empresa?.cnpj === cnpj);
                            return {
                              cnpj,
                              id_empresa: userItem?.id_empresa,
                              nomeFantasia: userItem?.empresa?.nome_fantasia || userItem?.empresa?.razao_social || ''
                            };
                          })
                          .filter(item => item.nomeFantasia && item.id_empresa)
                          .map(item => (
                            <option key={item.id_empresa} value={item.id_empresa}>
                              {item.nomeFantasia}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>

                  {/* Informações da Exportação */}
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div className="text-blue-600">
                        <Users className="h-5 w-5" />
                      </div>
                      <div className="text-sm text-blue-800">
                        <strong>Total de usuários a exportar:</strong> {getFilteredUsersForExport().length}
                      </div>
                    </div>
                    <div className="text-xs text-blue-600 mt-1">
                      A exportação incluirá: Nome, E-mail, Perfil, Base Sindical, Empresa, CNPJ, Data de Criação e Última Atualização
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer do Modal */}
              <div className="flex justify-end space-x-3 p-6 border-t border-gray-200" style={{ backgroundColor: '#f8fafc' }}>
                <button
                  onClick={handleCloseExportModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleExport}
                  disabled={isExporting}
                  className="px-6 py-2 text-sm font-medium text-white rounded-md transition-colors disabled:opacity-50"
                  style={{ backgroundColor: '#1d335b' }}
                >
                  {isExporting ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Exportando...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Download className="h-4 w-4" />
                      <span>Exportar</span>
                    </div>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;
