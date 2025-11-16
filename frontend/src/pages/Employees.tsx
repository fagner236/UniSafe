import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { useDebounce } from '@/hooks/useDebounce';
import { Search, Download, Eye, Edit, Filter, ChevronUp, ChevronDown, X, User, Briefcase, FileText, Building, MapPin, Printer, FileSpreadsheet, Mail, Phone, Camera, Save, CameraIcon, CheckCircle, AlertCircle, ArrowLeft, Database } from 'lucide-react';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import { autoTable } from 'jspdf-autotable';
import { config } from '@/config/environment';
import api from '@/config/axios';


const Employees = () => {
  const { processedData, hasData } = useData();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500); // Debounce de 500ms

  // Colunas que devem ser ocultadas na página Base de Dados (mas mantidas no Dashboard)
  const HIDDEN_COLUMNS = ['RACA', 'GRAU_INSTRUCAO', 'TIPO_DEFICIENCIA'];

  // Filtrar colunas visíveis (remover colunas ocultas)
  const visibleColumns = processedData?.columns.filter(
    column => !HIDDEN_COLUMNS.includes(column.toUpperCase())
  ) || [];
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortColumn, setSortColumn] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState<'excel' | 'csv' | 'pdf'>('pdf');
  const [isExporting, setIsExporting] = useState(false);
  
  // Estados para o modal de edição
  const [editFormData, setEditFormData] = useState({
    email: '',
    celular: '',
    base_sindical: '',
    foto: null as File | null
  });
  const [isSaving, setIsSaving] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [celularError, setCelularError] = useState('');
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraVideoRef, setCameraVideoRef] = useState<HTMLVideoElement | null>(null);
  const [isLoadingEmployeeData, setIsLoadingEmployeeData] = useState(false);
  const [forceRender, setForceRender] = useState(0);

  // Monitorar mudanças no estado fotoPreview
  useEffect(() => {
    // Estado fotoPreview mudou
  }, [fotoPreview]);

  // Componente para preview da foto
  const FotoPreview = ({ fotoUrl }: { fotoUrl: string | null }) => {
    
    if (!fotoUrl) {
      return (
        <div className="mb-4 p-4 border-2 border-dashed border-gray-300 rounded-lg text-center">
          <p className="text-gray-500">Nenhuma foto selecionada</p>
        </div>
      );
    }

    // Determinar o tipo de URL e construir a URL final
    const getImageSrc = () => {
      if (fotoUrl.startsWith('data:')) {
        // URL de dados (data:image/jpeg;base64,...)
        return fotoUrl;
      } else if (fotoUrl.startsWith('http')) {
        // URL HTTP completa
        return fotoUrl;
      } else {
        // URL relativa, adicionar servidor
        // Para desenvolvimento, usar localhost, para produção usar a URL base
        const baseUrl = import.meta.env.MODE === 'production' 
          ? window.location.origin 
          : 'http://localhost:3000';
        return `${baseUrl}${fotoUrl}`;
      }
    };

    const imageSrc = getImageSrc();
    const isDataUrl = fotoUrl.startsWith('data:');
    const isSystemPhoto = fotoUrl.includes('uploads/empregados/');

    return (
      <div className="mb-4">
        <div className="relative inline-block">
          <img
            key={`${fotoUrl}-${forceRender}`} // Força re-renderização quando fotoUrl ou forceRender mudam
            src={imageSrc}
            alt="Preview da foto"
            className="w-32 h-32 object-cover rounded-lg border-2 border-gray-300"
            onError={(e) => {
              console.log('❌ Erro ao carregar imagem:', fotoUrl);
              console.log('❌ URL tentada:', imageSrc);
              console.log('❌ Tipo de URL:', isDataUrl ? 'data:' : 'http/relative');
              e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4IiBoZWlnaHQ9IjEyOCIgdmlld0JveD0iMCAwIDEyOCAxMjgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjgiIGhlaWdodD0iMTI4IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik02NCA0MEM3My45NDExIDQwIDgyIDQ4LjA1ODkgODIgNThDODIgNjcuOTQxMSA3My45NDExIDc2IDY0IDc2QzU0LjA1ODkgNzYgNDYgNjcuOTQxMSA0NiA1OEM0NiA0OC4wNTg5IDU0LjA1ODkgNDAgNjQgNDBaIiBmaWxsPSIjOUNBM0FGIi8+CjxwYXRoIGQ9Ik0zNiA5MkM0NS45NDExIDkyIDU0IDEwMC4wNTkgNTQgMTEwQzU0IDExOS45NDEgNDUuOTQxMSAxMjggMzYgMTI4QzI2LjA1ODkgMTI4IDE4IDExOS45NDEgMTggMTEwQzE4IDEwMC4wNTkgMjYuMDU4OSA5MiAzNiA5MloiIGZpbGw9IiM5Q0EzQUYiLz4KPHBhdGggZD0iTTkyIDkyQzEwMS45NDEgOTIgMTEwIDEwMC4wNTkgMTEwIDExMEMxMTAgMTE5Ljk0MSAxMDEuOTQxIDEyOCA5MiAxMjhDODIuMDU4OSAxMjggNzQgMTE5Ljk0MSA3NCAxMTBDNzQgMTAwLjA1OSA4Mi4wNTg5IDkyIDkyIDkyWiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K';
            }}
            onLoad={() => {
              console.log('✅ Imagem carregada com sucesso:', fotoUrl.substring(0, 50) + '...');
            }}
          />
          <button
            onClick={() => {
              setEditFormData(prev => ({ ...prev, foto: null }));
              setFotoPreview(null);
            }}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
            title="Remover foto"
          >
            ×
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {isSystemPhoto ? 'Foto atual do sistema' : isDataUrl ? 'Nova foto selecionada' : 'Foto do sistema'}
        </p>
      </div>
    );
  };


  // Função para validar e-mail
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Função para aplicar máscara de celular
  const formatCelular = (value: string) => {
    // Remove tudo que não é dígito
    const numbers = value.replace(/\D/g, '');
    
    // Limita a 11 dígitos
    const limitedNumbers = numbers.slice(0, 11);
    
    // Aplica a máscara (XX) XXXXX-XXXX
    if (limitedNumbers.length <= 2) {
      return limitedNumbers;
    } else if (limitedNumbers.length <= 7) {
      return `(${limitedNumbers.slice(0, 2)}) ${limitedNumbers.slice(2)}`;
    } else {
      return `(${limitedNumbers.slice(0, 2)}) ${limitedNumbers.slice(2, 7)}-${limitedNumbers.slice(7, 11)}`;
    }
  };

  // Função para validar celular
  const validateCelular = (celular: string) => {
    const numbers = celular.replace(/\D/g, '');
    return numbers.length === 11;
  };

  // Função para criar preview da foto
  const createFotoPreview = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setFotoPreview(result);
    };
    reader.onerror = (e) => {
      console.error('❌ Erro ao ler arquivo:', e);
    };
    reader.readAsDataURL(file);
  };

  // Função para iniciar câmera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 }
        } 
      });
      setCameraStream(stream);
      setShowCamera(true);
    } catch (error) {
      console.error('Erro ao acessar câmera:', error);
      alert('Não foi possível acessar a câmera. Verifique as permissões.');
    }
  };

  // useEffect para configurar o stream da câmera
  useEffect(() => {
    if (cameraStream && cameraVideoRef) {
      cameraVideoRef.srcObject = cameraStream;
    }
  }, [cameraStream, cameraVideoRef]);

  // Função para parar câmera
  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setShowCamera(false);
  };

  // Função para capturar foto da câmera
  const capturePhoto = () => {
    if (cameraVideoRef) {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      canvas.width = cameraVideoRef.videoWidth;
      canvas.height = cameraVideoRef.videoHeight;
      
      if (context) {
        context.drawImage(cameraVideoRef, 0, 0);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], 'foto-camera.jpg', { type: 'image/jpeg' });
            setEditFormData(prev => ({ ...prev, foto: file }));
            createFotoPreview(file);
            stopCamera();
          }
        }, 'image/jpeg', 0.8);
      }
    }
  };

  // Função para abrir o modal de visualização
  const handleViewEmployee = async (employee: any) => {
    console.log('🔍 Empregado selecionado para visualização:', employee);
    setSelectedEmployee(employee);
    
    // Obter matrícula do empregado
    const matriculaRaw = employee.matricula || employee.Matrícula || employee.MATRÍCULA || employee.Matricula;
    console.log('🔍 Matrícula extraída (raw):', matriculaRaw);
    
    // Normalizar matrícula removendo pontos, hífens e espaços
    const matricula = matriculaRaw ? matriculaRaw.replace(/[.\-\s]/g, '') : null;
    console.log('🔍 Matrícula normalizada:', matricula);
    
    if (matricula) {
      try {
        // Buscar dados completos do empregado na tabela empregados
        console.log('🔍 Buscando dados do empregado na API...');
        const response = await fetch(`${config.apiUrl}/empregados/${matricula}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });

        console.log('🔍 Resposta da API:', response.status, response.statusText);

        if (response.ok) {
          const result = await response.json();
          const empregadoData = result.data;
          console.log('📊 Dados completos do empregado encontrados:', empregadoData);
          console.log('📸 Foto do empregado:', empregadoData.foto);
          
          // Combinar dados da tabela com dados da API (incluindo foto)
          const combinedData = {
            ...employee,
            foto: empregadoData.foto,
            email: empregadoData.email || employee.email || employee.Email || employee.EMAIL,
            celular: empregadoData.celular || employee.celular || employee.Celular || employee.CELULAR
          };
          
          console.log('📊 Dados combinados:', combinedData);
          setSelectedEmployee(combinedData);
        } else {
          const errorData = await response.json();
          console.log('📊 Erro na API:', errorData);
          console.log('📊 Nenhum dado adicional encontrado para matrícula:', matricula);
        }
      } catch (error) {
        console.error('❌ Erro ao buscar dados do empregado:', error);
      }
    } else {
      console.log('❌ Nenhuma matrícula encontrada no empregado');
    }
    
    setShowViewModal(true);
  };

  // Função para fechar o modal
  const handleCloseModal = () => {
    setShowViewModal(false);
    setSelectedEmployee(null);
  };

  // Função para abrir o modal de edição
  const handleEditEmployee = async (employee: any) => {
    setSelectedEmployee(employee);
    setIsLoadingEmployeeData(true);
    
    // Obter matrícula do empregado
    const matricula = employee.matricula || employee.Matrícula || employee.MATRÍCULA || employee.Matricula;
    
    if (!matricula) {
      alert('Erro: Matrícula não encontrada para este empregado');
      setIsLoadingEmployeeData(false);
      return;
    }

    try {
      // Buscar dados existentes do empregado na tabela empregados
      const response = await fetch(`${config.apiUrl}/empregados/${matricula}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      let existingData = null;
      if (response.ok) {
        const result = await response.json();
        existingData = result.data;
        console.log('📊 Dados existentes encontrados:', existingData);
      } else {
        console.log('📊 Nenhum dado existente encontrado para matrícula:', matricula);
      }

      // Preparar dados do formulário
      const celularValue = existingData?.celular || employee.celular || employee.Celular || employee.CELULAR || employee.telefone || employee.Telefone || employee.TELEFONE || '';
      
      setEditFormData({
        email: existingData?.email || employee.email || employee.Email || employee.EMAIL || '',
        celular: formatCelular(celularValue),
        base_sindical: existingData?.base_sindical || employee.base_sindical || '',
        foto: null
      });

      // Configurar preview da foto se existir
      if (existingData?.foto) {
        // Converter foto para base64 para garantir que carregue
        try {
          //const baseUrl = import.meta.env.MODE === 'production' 
          //  ? window.location.origin 
          //  : 'http://localhost:3000';
          const fullUrl = existingData.foto;
          
          console.log('🖼️ Convertendo foto para base64 no modal de edição:', fullUrl);
          
          const response = await fetch(fullUrl);
          const blob = await response.blob();
          
          // Converter blob para base64
          const reader = new FileReader();
          reader.onload = () => {
            const base64 = reader.result as string;
            setFotoPreview(base64);
            console.log('✅ Foto convertida para base64 no modal de edição');
            
            // Forçar re-renderização para garantir que a imagem seja exibida
            setTimeout(() => {
              setForceRender(prev => prev + 1);
            }, 50);
          };
          reader.readAsDataURL(blob);
        } catch (error) {
          console.error('❌ Erro ao converter foto para base64 no modal de edição:', error);
          setFotoPreview(null);
        }
      } else {
        setFotoPreview(null);
      }

      setEmailError('');
      setCelularError('');
      setShowEditModal(true);

    } catch (error) {
      console.error('❌ Erro ao buscar dados do empregado:', error);
      
      // Em caso de erro, usar dados básicos do employee
      const celularValue = employee.celular || employee.Celular || employee.CELULAR || employee.telefone || employee.Telefone || employee.TELEFONE || '';
      setEditFormData({
        email: employee.email || employee.Email || employee.EMAIL || '',
        celular: formatCelular(celularValue),
        base_sindical: employee.base_sindical || '',
        foto: null
      });
      setEmailError('');
      setCelularError('');
      setFotoPreview(null);
      setShowEditModal(true);
    } finally {
      setIsLoadingEmployeeData(false);
    }
  };

  // Função para fechar o modal de edição
  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSelectedEmployee(null);
    setEditFormData({
      email: '',
      celular: '',
      base_sindical: '',
      foto: null
    });
    setEmailError('');
    setCelularError('');
    setFotoPreview(null);
    stopCamera();
  };

  // Função para lidar com mudanças no formulário de edição
  const handleEditFormChange = (field: string, value: string | File | null) => {
    if (field === 'email') {
      const emailValue = value as string;
      setEditFormData(prev => ({ ...prev, email: emailValue }));
      
      if (emailValue && !validateEmail(emailValue)) {
        setEmailError('E-mail inválido');
      } else {
        setEmailError('');
      }
    } else if (field === 'celular') {
      const celularValue = value as string;
      const formattedCelular = formatCelular(celularValue);
      setEditFormData(prev => ({ ...prev, celular: formattedCelular }));
      
      if (formattedCelular && !validateCelular(formattedCelular)) {
        setCelularError('Celular deve ter 11 dígitos');
      } else {
        setCelularError('');
      }
    } else if (field === 'foto') {
      const file = value as File | null;
      setEditFormData(prev => ({ ...prev, foto: file }));
      
      if (file) {
        createFotoPreview(file);
      } else {
        setFotoPreview(null);
      }
    }
  };

  // Função para salvar as alterações
  const handleSaveEmployee = async () => {
    // Limpar erros anteriores
    setEmailError('');
    setCelularError('');
    
    // Validar campos antes de salvar
    let hasErrors = false;
    
    console.log('🔍 Dados do formulário antes da validação:', editFormData);
    
    // Validar email
    if (editFormData.email && editFormData.email.trim() !== '') {
      if (!validateEmail(editFormData.email.trim())) {
        setEmailError('E-mail inválido');
        hasErrors = true;
      }
    }
    
    // Validar celular
    if (editFormData.celular && editFormData.celular.trim() !== '') {
      if (!validateCelular(editFormData.celular.trim())) {
        setCelularError('Celular deve ter 11 dígitos');
        hasErrors = true;
      }
    }
    
    console.log('🔍 Erros encontrados:', { hasErrors, emailError, celularError });
    
    if (hasErrors) {
      return;
    }
    
    try {
      setIsSaving(true);
      
      // Obter matrícula do empregado selecionado (sempre usar a matrícula original dos dados)
      // A matrícula original vem dos dados processados e não tem máscara
      const matriculaRaw = selectedEmployee.matricula || selectedEmployee.Matrícula || selectedEmployee.MATRÍCULA || selectedEmployee.Matricula;
      
      if (!matriculaRaw) {
        alert('Erro: Matrícula não encontrada para este empregado');
        return;
      }

      // Limpar matrícula (remover formatação) antes de salvar
      // A matrícula pode estar formatada (1.234.567-8) mas nunca mascarada no selectedEmployee
      // pois selectedEmployee vem dos dados originais processados
      // Precisamos extrair apenas os dígitos numéricos (remover pontos, hífens, etc.)
      const matriculaLimpa = cleanMatricula(matriculaRaw);
      
      if (!matriculaLimpa || matriculaLimpa.length < 4) {
        alert('Erro: Matrícula inválida. A matrícula deve conter pelo menos 4 dígitos.');
        return;
      }

      // Preparar dados para envio (limpos e validados)
      const formData = new FormData();
      formData.append('matricula', matriculaLimpa);
      
      // Limpar e enviar email
      if (editFormData.email && editFormData.email.trim() !== '') {
        formData.append('email', editFormData.email.trim().toLowerCase());
      } else {
        formData.append('email', '');
      }
      
      // Limpar e enviar celular (manter formato com parênteses)
      if (editFormData.celular && editFormData.celular.trim() !== '') {
        // Manter formato (XX) XXXXX-XXXX
        formData.append('celular', editFormData.celular.trim());
      } else {
        formData.append('celular', '');
      }
      
      // Adicionar base_sindical (sempre necessário para construir URL da foto)
      formData.append('base_sindical', editFormData?.base_sindical || selectedEmployee?.base_sindical || '');
      
      // Adicionar foto se existir
      if (editFormData.foto) {
        formData.append('foto', editFormData.foto);
      }

      console.log('🔍 Dados sendo enviados:', {
        matricula: matriculaLimpa,
        matriculaOriginal: matriculaRaw,
        email: editFormData.email,
        celular: editFormData.celular,
        foto: editFormData.foto?.name
      });
      
      // Log dos dados do FormData
      console.log('🔍 FormData contents:');
      for (let [key, value] of formData.entries()) {
        console.log(`  ${key}:`, value);
      }
      
      // Fazer requisição para o backend
      const response = await fetch(`${config.apiUrl}/empregados`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      const result = await response.json();
      
      console.log('🔍 Resposta do servidor:', {
        status: response.status,
        ok: response.ok,
        result: result
      });

      if (!response.ok) {
        console.error('❌ Erro na resposta do servidor:', result);
        throw new Error(result.message || 'Erro ao salvar empregado(a)');
      }

      console.log('✅ Dados do(a) empregado(a) atualizado(a) com sucesso!', result.data);
      
      // Fechar modal após salvamento
      handleCloseEditModal();
      
      // Mostrar notificação de sucesso
      alert(result.message || 'Dados do(a) empregado(a) atualizado(a) com sucesso!');
      
    } catch (error) {
      console.error('❌ Erro ao salvar empregado(a):', error);
      const errorMessage = error instanceof Error ? error.message : 'Tente novamente.';
      alert(`Erro ao salvar as alterações: ${errorMessage}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Funções para modal de exportação
  const handleOpenExportModal = () => {
    setShowExportModal(true);
  };

  const handleCloseExportModal = () => {
    setShowExportModal(false);
    setExportFormat('excel');
  };

  // Função auxiliar para encontrar coluna por variações de nome
  const findColumn = (variations: string[]): string | null => {
    if (!processedData?.columns) return null;
    for (const variation of variations) {
      const found = processedData.columns.find(col => 
        col.toUpperCase() === variation.toUpperCase() || 
        col.toUpperCase().includes(variation.toUpperCase())
      );
      if (found) return found;
    }
    return null;
  };

  // Função para obter dados filtrados para exportação
  const getFilteredDataForExport = () => {
    if (!processedData) return [];
    
    let filteredData = [...processedData.employees];
    
    // Aplicar filtro de busca (usar debouncedSearchTerm para consistência)
    if (debouncedSearchTerm.trim()) {
      const searchLower = debouncedSearchTerm.toLowerCase();
      filteredData = filteredData.filter(employee => {
        return Object.values(employee).some(value => 
          String(value).toLowerCase().includes(searchLower)
        );
      });
    }
    
    return filteredData;
  };

  // Função auxiliar para criar log de exportação
  const createExportLog = async (format: 'excel' | 'csv' | 'pdf', recordCount: number) => {
    try {
      const filteredData = getFilteredDataForExport();
      
      // Buscar coluna de unidade usando a função findColumn existente
      const unidadeColumn = findColumn(['UNIDADE', 'Unidade', 'unidade', 'LOTACAO', 'Lotação', 'lotacao', 'LOTAÇÃO', 'LOTACÃO']) ||
                            processedData?.columns.find(col => {
                              const colLower = col.toLowerCase();
                              return colLower.includes('unidade') || colLower.includes('lotacao') || colLower.includes('lotação');
                            });
      
      // Obter nome(s) da(s) unidade(s) dos dados exportados
      let nomeUnidade = 'Não informado';
      if (unidadeColumn && filteredData.length > 0) {
        const unidades = new Set<string>();
        filteredData.forEach((employee: any) => {
          const unidade = employee[unidadeColumn];
          if (unidade) {
            unidades.add(String(unidade).trim());
          }
        });
        
        if (unidades.size > 0) {
          nomeUnidade = Array.from(unidades).sort().join(', ');
        }
      }
      
      await api.post('/admin/logs', {
        level: 'INFO',
        category: 'SYSTEM',
        message: `Exportação de dados realizada: ${format.toUpperCase()}`,
        action: 'EXPORT_DATA',
        resource: '/employees/export',
        details: {
          format: format.toUpperCase(),
          'Total de empregados': recordCount || filteredData.length,
          hasFilters: !!searchTerm,
          'Unidade': nomeUnidade
        }
      });
    } catch (error) {
      // Não interromper a exportação se o log falhar
      console.error('Erro ao criar log de exportação:', error);
    }
  };

  // Função para exportar para PDF (Lista de Presença)
  const exportToPDF = async () => {
    try {
      const filteredData = getFilteredDataForExport();
      
      if (filteredData.length === 0) {
        alert('Nenhum dado disponível para exportação');
        return;
      }

      // Encontrar colunas necessárias
      const nomeColumn = findColumn(['NOME', 'Nome', 'name']) || processedData?.columns.find(col => col.toLowerCase().includes('nome')) || 'NOME';
      const matriculaColumn = findColumn(['MATRICULA', 'MATRÍCULA', 'Matricula', 'Matrícula', 'matricula']) || processedData?.columns.find(col => col.toLowerCase().includes('matr')) || 'MATRICULA';
      
      // Colunas para cabeçalho - buscar com múltiplas variações
      const sindicatoColumn = findColumn(['SINDICATO', 'Sindicato', 'sindicato', 'BASE SINDICAL', 'Base Sindical', 'BASE_SINDICAL', 'BASE SINDICAL']) || 
                              processedData?.columns.find(col => {
                                const colLower = col.toLowerCase();
                                return colLower.includes('sindicato') || colLower.includes('base sindical') || colLower.includes('base_sindical');
                              });
      const seColumn = findColumn(['SE', 'Se', 'se', 'SINDICATO/ENTIDADE', 'Sindicato/Entidade', 'SINDICATO ENTIDADE', 'Sindicato Entidade']) ||
                       processedData?.columns.find(col => {
                         const colLower = col.toLowerCase();
                         return (colLower === 'se' || colLower === 's/e') && !colLower.includes('sindicato');
                       });
      const municipioColumn = findColumn(['MUNICIPIO', 'Município', 'municipio', 'MUNICÍPIO', 'CIDADE', 'Cidade', 'cidade', 'MUNICÍPIO']) ||
                              processedData?.columns.find(col => {
                                const colLower = col.toLowerCase();
                                return colLower.includes('municipio') || colLower.includes('município') || colLower.includes('cidade');
                              });
      const unidadeColumn = findColumn(['UNIDADE', 'Unidade', 'unidade', 'LOTACAO', 'Lotação', 'lotacao', 'LOTAÇÃO', 'LOTACÃO']) ||
                            processedData?.columns.find(col => {
                              const colLower = col.toLowerCase();
                              return colLower.includes('unidade') || colLower.includes('lotacao') || colLower.includes('lotação');
                            });
      
      // Agrupar dados por unidade
      const dadosPorUnidade = new Map<string, any[]>();
      
      filteredData.forEach((employee: any) => {
        const unidade = unidadeColumn && employee[unidadeColumn] 
          ? String(employee[unidadeColumn]).trim() 
          : 'Sem Unidade';
        
        if (!dadosPorUnidade.has(unidade)) {
          dadosPorUnidade.set(unidade, []);
        }
        dadosPorUnidade.get(unidade)!.push(employee);
      });
      
      // Ordenar unidades alfabeticamente
      const unidadesOrdenadas = Array.from(dadosPorUnidade.keys()).sort((a, b) => 
        a.localeCompare(b, 'pt-BR', { sensitivity: 'base' })
      );
      
      // Criar documento PDF em modo retrato
      const doc = new jsPDF('portrait', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      const margin = 15;
      const grayColor = [230, 230, 230];
      
      // Função auxiliar para desenhar cabeçalho
      const desenharCabecalho = (unidade: string, dadosUnidade: any[], yPos: number) => {
        // Buscar valores do primeiro registro da unidade
        let sindicatoNome = 'Sindicato';
        let seNome = 'SE';
        let municipioNome = 'Município';
        let unidadeNome = unidade;
        
        if (dadosUnidade.length > 0) {
          const primeiroRegistro = dadosUnidade[0] as any;
          if (sindicatoColumn && primeiroRegistro[sindicatoColumn]) {
            sindicatoNome = String(primeiroRegistro[sindicatoColumn]).trim();
          }
          if (seColumn && primeiroRegistro[seColumn]) {
            seNome = String(primeiroRegistro[seColumn]).trim();
          }
          if (municipioColumn && primeiroRegistro[municipioColumn]) {
            municipioNome = String(primeiroRegistro[municipioColumn]).trim();
          }
        }
        
        // Título
        doc.setFontSize(16);
        doc.setTextColor(29, 51, 91);
        doc.setFont('helvetica', 'bold');
        doc.text('LISTA DE PRESENÇA', pageWidth / 2, yPos, { align: 'center' });
        
        yPos += 10;
        
        // Informações do cabeçalho
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        
        const totalEmpregados = dadosUnidade.length;
        
        // Contar filiados e não filiados
        let totalFiliados = 0;
        let totalNaoFiliados = 0;
        
        dadosUnidade.forEach((employee: any) => {
          if (isFiliado(employee)) {
            totalFiliados++;
          } else {
            totalNaoFiliados++;
          }
        });
        
        // Calcular percentuais
        const percentualFiliados = totalEmpregados > 0 
          ? ((totalFiliados / totalEmpregados) * 100).toFixed(1).replace('.', ',')
          : '0,0';
        const percentualNaoFiliados = totalEmpregados > 0
          ? ((totalNaoFiliados / totalEmpregados) * 100).toFixed(1).replace('.', ',')
          : '0,0';
        
        // Desenhar cada linha com título em negrito e valor em normal
        const linhas = [
          { titulo: 'Sindicato: ', valor: sindicatoNome },
          { titulo: 'SE: ', valor: seNome },
          { titulo: 'Município: ', valor: municipioNome },
          { titulo: 'Unidade: ', valor: unidadeNome },
          { titulo: 'Total de Empregados: ', valor: `${totalEmpregados.toLocaleString('pt-BR')} (Filiados: ${totalFiliados.toLocaleString('pt-BR')} (${percentualFiliados}%) | Não Filiados: ${totalNaoFiliados.toLocaleString('pt-BR')} (${percentualNaoFiliados}%))` }
        ];
        
        linhas.forEach((linha, index) => {
          const yPosition = yPos + (index * 6);
          
          // Desenhar título em negrito
          doc.setFont('helvetica', 'bold');
          const tituloWidth = doc.getTextWidth(linha.titulo);
          doc.text(linha.titulo, margin, yPosition);
          
          // Desenhar valor em normal
          doc.setFont('helvetica', 'normal');
          doc.text(linha.valor, margin + tituloWidth, yPosition);
        });
        
        return yPos + 32;
      };
      
      // Processar cada unidade
      unidadesOrdenadas.forEach((unidade, unidadeIndex) => {
        // Se não for a primeira unidade, adicionar nova página
        if (unidadeIndex > 0) {
          doc.addPage();
        }
        
        const dadosUnidade = dadosPorUnidade.get(unidade)!;
        
        // Ordenar dados da unidade alfabeticamente por nome
        const sortedData = [...dadosUnidade].sort((a: any, b: any) => {
          const nomeA = String(a[nomeColumn] || '').toLowerCase().trim();
          const nomeB = String(b[nomeColumn] || '').toLowerCase().trim();
          return nomeA.localeCompare(nomeB, 'pt-BR', { sensitivity: 'base' });
        });
        
        // Preparar dados da tabela
        // Obter mês e ano atual para o campo de data
        const dataExtracao = new Date();
        const mes = String(dataExtracao.getMonth() + 1).padStart(2, '0'); // Mês (01-12)
        const ano = dataExtracao.getFullYear(); // Ano (ex: 2025)
        const dataFormatada = `___/${mes}/${ano}`; // Formato: "___/MM/AAAA" (três underscores para o dia)
        
        const tableData = sortedData.map((employee: any) => {
          const nome = employee[nomeColumn] || '-';
          const matricula = employee[matriculaColumn] || '-';
          const empregadoFiliado = isFiliado(employee);
          const filiado = empregadoFiliado ? 'Sim' : 'Não';
          
          // Aplicar formatação na matrícula (máscara e pontuação)
          const matriculaFormatada = formatMatricula(matricula, employee);
          
          return {
            data: [
              String(nome).substring(0, 50), // Limitar tamanho do nome
              matriculaFormatada, // Matrícula formatada com máscara
              filiado,
              dataFormatada, // Coluna de data com mês e ano preenchidos (dia em branco)
              '' // Coluna de assinatura (vazia)
            ],
            isFiliado: empregadoFiliado
          };
        });
        
        // Desenhar cabeçalho
        let yPosition = desenharCabecalho(unidade, sortedData, margin);
        
        // Criar tabela usando autoTable
        autoTable(doc, {
          startY: yPosition,
          head: [['Nome', 'Matrícula', 'Filiado', 'Data', 'Assinatura']],
          body: tableData.map((row: any) => row.data),
          theme: 'grid',
          headStyles: {
            fillColor: [29, 51, 91],
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            fontSize: 10,
            halign: 'center'
          },
          bodyStyles: {
            fontSize: 9,
            textColor: [0, 0, 0]
          },
          columnStyles: {
            0: { cellWidth: 'auto', halign: 'left' }, // Nome (alinhado à esquerda)
            1: { cellWidth: 35, halign: 'center' }, // Matrícula (centralizada)
            2: { cellWidth: 25, halign: 'center' }, // Filiado (centralizada)
            3: { cellWidth: 25, halign: 'center' }, // Data (centralizada)
            4: { cellWidth: 50, halign: 'left' }  // Assinatura (alinhada à esquerda)
          },
          margin: { left: margin, right: margin },
          styles: {
            cellPadding: 3,
            lineColor: [0, 0, 0],
            lineWidth: 0.1
          },
          didParseCell: (data: any) => {
            // Aplicar cor de fundo cinza claro para linhas de filiados
            if (data.section === 'body' && data.row.index < tableData.length) {
              const rowData = tableData[data.row.index];
              if (rowData && rowData.isFiliado) {
                data.cell.styles.fillColor = grayColor;
              }
            }
          },
        });
      });
      
      // Adicionar rodapé em todas as páginas após todas as tabelas serem desenhadas
      // Isso garante que temos o número total correto de páginas
      const totalPages = (doc as any).internal.getNumberOfPages();
      
      // Formatar data e hora manualmente no formato desejado: "DD/MM/AAAA às HH:MM"
      const agora = new Date();
      const dia = String(agora.getDate()).padStart(2, '0');
      const mes = String(agora.getMonth() + 1).padStart(2, '0');
      const ano = agora.getFullYear();
      const hora = String(agora.getHours()).padStart(2, '0');
      const minuto = String(agora.getMinutes()).padStart(2, '0');
      const dataExtracao = `${dia}/${mes}/${ano} às ${hora}:${minuto}`;
      
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.setFont('helvetica', 'normal');
        
        doc.text(
          `Dados extraídos em: ${dataExtracao}`,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        );
        
        doc.text(
          `Página ${i} de ${totalPages}`,
          pageWidth - margin,
          pageHeight - 10,
          { align: 'right' }
        );
      }
      
      // Salvar o arquivo
      const fileName = `Lista de Presença - ${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      
      // Criar log de exportação
      await createExportLog('pdf', filteredData.length);
      
    } catch (error) {
      console.error('Erro na exportação PDF:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      throw new Error('Erro ao gerar PDF: ' + errorMessage);
    }
  };

  // Função para exportar para Excel
  const exportToExcel = () => {
    const filteredData = getFilteredDataForExport();
    
    const data = filteredData.map(employee => {
      const row: any = {};
      // Usar apenas colunas visíveis (excluindo colunas ocultas)
      visibleColumns.forEach(column => {
        const value = (employee as any)[column];
        if (value !== null && value !== undefined) {
          // Formatação específica para datas
          if (column.toLowerCase().includes('data') && value instanceof Date) {
            row[column] = value.toLocaleDateString('pt-BR');
          } else if (column.toLowerCase().includes('valor') && typeof value === 'number') {
            row[column] = `R$ ${value.toFixed(2).replace('.', ',')}`;
          } else {
            row[column] = String(value);
          }
        } else {
          row[column] = '-';
        }
      });
      return row;
    });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Funcionários');
    
    // Ajustar largura das colunas
    const colWidths = visibleColumns.map(() => ({ wch: 20 }));
    ws['!cols'] = colWidths;

    XLSX.writeFile(wb, `Evia - UniSafe - Funcionários - ${new Date().toISOString().split('T')[0]}.xlsx`);
    
    // Criar log de exportação
    createExportLog('excel', filteredData.length);
  };

  // Função para exportar para CSV
  const exportToCSV = () => {
    const filteredData = getFilteredDataForExport();
    
    const data = filteredData.map(employee => {
      const row: any = {};
      // Usar apenas colunas visíveis (excluindo colunas ocultas)
      visibleColumns.forEach(column => {
        const value = (employee as any)[column];
        if (value !== null && value !== undefined) {
          if (column.toLowerCase().includes('data') && value instanceof Date) {
            row[column] = value.toLocaleDateString('pt-BR');
          } else if (column.toLowerCase().includes('valor') && typeof value === 'number') {
            row[column] = `R$ ${value.toFixed(2).replace('.', ',')}`;
          } else {
            row[column] = String(value);
          }
        } else {
          row[column] = '-';
        }
      });
      return row;
    });

    const csvContent = [
      visibleColumns.join(','),
      ...data.map(row => 
        visibleColumns.map(column => {
          const value = row[column] || '';
          // Escapar aspas duplas e quebras de linha
          return `"${String(value).replace(/"/g, '""')}"`;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `Evia - UniSafe - Funcionários - ${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Criar log de exportação
    createExportLog('csv', filteredData.length);
  };


  // Função principal de exportação
  const handleExport = async () => {
    try {
      console.log('Iniciando exportação, formato:', exportFormat);
      setIsExporting(true);
      
      switch (exportFormat) {
        case 'excel':
          console.log('Exportando para Excel...');
          exportToExcel();
          console.log('Excel exportado com sucesso');
          break;
        case 'csv':
          console.log('Exportando para CSV...');
          exportToCSV();
          console.log('CSV exportado com sucesso');
          break;
        case 'pdf':
          console.log('Exportando para PDF (Lista de Presença)...');
          await exportToPDF();
          console.log('PDF exportado com sucesso');
          break;
        default:
          throw new Error('Formato de exportação não suportado');
      }
      
      // Fechar modal após exportação
      setTimeout(() => {
        handleCloseExportModal();
      }, 1000);
      
    } catch (error) {
      console.error('Erro detalhado ao exportar dados:', error);
      console.error('Tipo do erro:', typeof error);
      console.error('Mensagem do erro:', error instanceof Error ? error.message : 'Erro desconhecido');
      console.error('Stack trace:', error instanceof Error ? error.stack : 'N/A');
      
      alert(`Erro ao exportar dados: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setIsExporting(false);
    }
  };

  // Função para imprimir dados do empregado
  const handlePrintEmployee = async () => {
    if (!selectedEmployee) return;

    // Criar uma nova janela para impressão
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    
    if (!printWindow) {
      alert('Não foi possível abrir a janela de impressão. Verifique se o bloqueador de pop-ups está desabilitado.');
      return;
    }

    // Converter foto para base64 se existir
    let photoBase64 = null;
    if (selectedEmployee.foto) {
      //try {
        //const baseUrl = import.meta.env.MODE === 'production' 
        //  ? window.location.origin 
        //  : 'http://localhost:3000';
        //const fullUrl = selectedEmployee.foto;
        photoBase64=selectedEmployee.foto; 
        console.log('🖼️ Convertendo foto para base64:', photoBase64);
        
        //const response = await fetch(fullUrl);
        //const blob = await response.blob();
        
        // Converter blob para base64
        //const reader = new FileReader();
        //photoBase64 = await new Promise((resolve) => {
        //  reader.onload = () => resolve(reader.result);
        //  reader.readAsDataURL(blob);
        //});
        
        //console.log('✅ Foto convertida para base64 com sucesso');
     // } catch (error) {
     //   console.error('❌ Erro ao converter foto para base64:', error);
     //   photoBase64 = null;
     // }
    }

    // Formatar os dados para impressão
    const formatValue = (value: any, column: string): string => {
      if (!value) return '-';
      
      // Formatação específica para matrícula
      const matriculaColumns = [
        'Matrícula', 'MATRICULA', 'matricula', 'Matricula', 'Registration', 'REGISTRATION',
        'Matricula', 'MATRÍCULA', 'matrícula', 'Matrícula', 'Registro', 'REGISTRO',
        'Mat', 'MAT', 'mat', 'Reg', 'REG', 'reg'
      ];
      
      // Formatação específica para mês/ano
      const monthYearColumns = [
        'Mês', 'MES', 'mes', 'Month', 'MONTH', 'month',
        'Mês/Ano', 'MES/ANO', 'mes/ano', 'Month/Year', 'MONTH/YEAR', 'month/year',
        'Período', 'PERIODO', 'periodo', 'Period', 'PERIOD', 'period',
        'Referência', 'REFERENCIA', 'referencia', 'Reference', 'REFERENCE', 'reference'
      ];
      
      // Formatação específica para datas
      const dateColumns = [
        'Data Nascimento', 'DATA NASCIMENTO', 'data nascimento', 'DataNascimento', 'Birth Date', 'BIRTH DATE',
        'Data Admissão', 'DATA ADMISSÃO', 'data admissão', 'DataAdmissao', 'Admission Date', 'ADMISSION DATE',
        'Data Afastamento', 'DATA AFASTAMENTO', 'data afastamento', 'DataAfastamento', 'Leave Date', 'LEAVE DATE',
        'Data', 'DATA', 'data', 'Date', 'DATE',
        'data_nasc', 'data_admissao', 'data_afast', 'data_criacao', 'data_atualizacao'
      ];
      
      // Formatação específica para valores monetários
      const currencyColumns = [
        'Valor Mensalidade', 'VALOR MENSALIDADE', 'valor mensalidade', 'ValorMensalidade',
        'Mensalidade', 'MENSALIDADE', 'mensalidade',
        'Valor', 'VALOR', 'valor', 'Price', 'PRICE', 'price',
        'Salário', 'SALARIO', 'salario', 'Salary', 'SALARY', 'salary',
        'Remuneração', 'REMUNERACAO', 'remuneracao', 'Remuneration', 'REMUNERATION',
        'valor_mensalidade'
      ];
      
      // Aplicar formatações específicas
      if (monthYearColumns.some(col => column.toLowerCase().includes(col.toLowerCase()))) {
        return formatMonthYear(value);
      } else if (matriculaColumns.includes(column)) {
        // Passar selectedEmployee para verificar se é filiado
        return formatMatricula(value, selectedEmployee);
      } else if (dateColumns.includes(column)) {
        // Verificar se é campo de data de afastamento
        const afastColumns = [
          'Data Afastamento', 'DATA AFASTAMENTO', 'data afastamento', 'DataAfastamento', 
          'Leave Date', 'LEAVE DATE', 'data_afast', 'DATA_AFAST'
        ];
        if (afastColumns.some(col => column.toLowerCase().includes(col.toLowerCase()))) {
          return formatAfastDate(value);
        }
        return value;
      } else if (currencyColumns.includes(column)) {
        const numValue = typeof value === 'number' ? value : Number(value.toString().replace(/[^\d,.-]/g, ''));
        if (!isNaN(numValue)) {
          return formatCurrency(numValue);
        }
      }
      
      return value.toString();
    };

    // Gerar HTML para impressão
    const printHTML = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Dados do Empregado - ${selectedEmployee.nome || selectedEmployee.Nome || selectedEmployee.NOME || 'N/A'}</title>
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
          .summary-content {
            display: flex;
            align-items: flex-start;
            gap: 15px;
          }
          .employee-photo {
            flex-shrink: 0;
            width: 100px;
            height: 100px;
            border-radius: 8px;
            overflow: hidden;
            border: 2px solid #1d335b;
            background: #f8f9fa;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .employee-photo-img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
          .photo-placeholder {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            width: 100%;
            height: 100%;
            background: #f8f9fa;
            color: #6c757d;
          }
          .placeholder-icon {
            font-size: 30px;
            margin-bottom: 5px;
          }
          .placeholder-text {
            font-size: 9px;
            text-align: center;
            line-height: 1.2;
          }
          .summary-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 8px;
            flex: 1;
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
          .employee-info {
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
          <h1>Dados do Empregado</h1>
          <p>Relatório gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}</p>
        </div>

        <div class="summary">
          <h3>Resumo</h3>
          <div class="summary-content">
            <div class="employee-photo">
              ${photoBase64 ? `
                <img src="${photoBase64}" 
                     alt="Foto do Empregado" 
                     class="employee-photo-img" />
              ` : `
                <div class="photo-placeholder">
                  <div class="placeholder-icon">👤</div>
                  <div class="placeholder-text">Foto não disponível</div>
                </div>
              `}
            </div>
            <div class="summary-grid">
              <div class="summary-item">
                <div class="summary-label">Nome Completo</div>
                <div class="summary-value">${selectedEmployee.nome || selectedEmployee.Nome || selectedEmployee.NOME || '-'}</div>
              </div>
              <div class="summary-item">
                <div class="summary-label">Matrícula</div>
                <div class="summary-value">${formatMatricula(selectedEmployee.matricula || selectedEmployee.Matrícula || selectedEmployee.MATRÍCULA || selectedEmployee.Matricula || '-', selectedEmployee)}</div>
              </div>
              ${(selectedEmployee.email || selectedEmployee.Email || selectedEmployee.EMAIL) ? `
              <div class="summary-item">
                <div class="summary-label">E-mail</div>
                <div class="summary-value">${selectedEmployee.email || selectedEmployee.Email || selectedEmployee.EMAIL || '-'}</div>
              </div>
              ` : ''}
              ${(selectedEmployee.celular || selectedEmployee.Celular || selectedEmployee.CELULAR) ? `
              <div class="summary-item">
                <div class="summary-label">Celular</div>
                <div class="summary-value">${selectedEmployee.celular || selectedEmployee.Celular || selectedEmployee.CELULAR || '-'}</div>
              </div>
              ` : ''}
              <div class="summary-item">
                <div class="summary-label">Cargo</div>
                <div class="summary-value">${selectedEmployee.cargo || selectedEmployee.Cargo || selectedEmployee.CARGO || '-'}</div>
              </div>
              <div class="summary-item">
                <div class="summary-label">Lotação</div>
                <div class="summary-value">${selectedEmployee.lotacao || selectedEmployee.Lotacao || selectedEmployee.LOTAÇÃO || selectedEmployee.lotação || selectedEmployee.Lotacao || '-'}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="employee-info">
          <div class="info-card">
            <h3>Informações Pessoais</h3>
            ${visibleColumns.slice(0, Math.ceil(visibleColumns.length / 2)).map(column => {
              const value = (selectedEmployee as any)[column];
              const displayValue = formatValue(value, column);
              return `
                <div class="info-item">
                  <span class="info-label">${column.replace(/_/g, ' ').toLowerCase()}</span>
                  <span class="info-value">${displayValue}</span>
                </div>
              `;
            }).join('')}
          </div>
          <div class="info-card">
            <h3>Informações Adicionais</h3>
            ${visibleColumns.slice(Math.ceil(visibleColumns.length / 2)).map(column => {
              const value = (selectedEmployee as any)[column];
              const displayValue = formatValue(value, column);
              return `
                <div class="info-item">
                  <span class="info-label">${column.replace(/_/g, ' ').toLowerCase()}</span>
                  <span class="info-value">${displayValue}</span>
                </div>
              `;
            }).join('')}
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

  // Função para formatar data de afastamento
  const formatAfastDate = (value: any): string => {
    if (!value) return '-';
    
    // Se for "01/01/1900", retorna "-"
    if (value === '01/01/1900' || value === '1900-01-01' || value === '01-01-1900') {
      return '-';
    }
    
    return value.toString();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };



  // Função para verificar se o empregado é filiado ao sindicato
  const isFiliado = (employee: any): boolean => {
    // Procurar o campo FILIADO em diferentes variações de nome
    const filiadoValue = employee.FILIADO || employee.Filiado || employee.filiado || 
                        employee.FILIACAO || employee.Filiacao || employee.filiacao ||
                        employee.FILIAÇÃO || employee.Filiação || employee.filiação;
    
    // Empregado é filiado se o campo não estiver vazio, nulo ou com traço
    if (!filiadoValue || filiadoValue === '' || filiadoValue === '-' || 
        filiadoValue === null || filiadoValue === undefined) {
      return false;
    }
    
    // Verificar se é string e está vazia após trim
    if (typeof filiadoValue === 'string' && filiadoValue.trim() === '') {
      return false;
    }
    
    return true;
  };

  // Função para limpar matrícula (remover formatação e máscara)
  // Remove pontos, hífens, espaços e substitui "X" por dígitos originais quando possível
  const cleanMatricula = (value: string | number): string => {
    if (!value) return '';
    
    // Converter para string e remover todos os caracteres não numéricos (incluindo "X")
    const cleaned = value.toString().replace(/[^\d]/g, '');
    
    return cleaned;
  };

  // Função para formatar matrícula no formato X.XXX.XXX-X
  // Se o empregado não for filiado, oculta os últimos 4 dígitos com "X"
  const formatMatricula = (value: string | number, employee?: any): string => {
    if (!value) return '-';
    
    // Remove todos os caracteres não numéricos
    const cleanValue = value.toString().replace(/\D/g, '');
    
    // Se tem menos de 8 dígitos, retorna como está (sem formatação)
    if (cleanValue.length < 8) {
      // Verificar se o empregado é filiado mesmo para matrículas curtas
      const empregadoFiliado = employee ? isFiliado(employee) : true;
      
      // Se não for filiado e tiver pelo menos 4 dígitos, ocultar os últimos 4
      if (!empregadoFiliado && cleanValue.length >= 4) {
        const visibleDigits = cleanValue.slice(0, -4);
        return visibleDigits + 'XXXX';
      }
      
      return value.toString();
    }
    
    // Verificar se o empregado é filiado
    const empregadoFiliado = employee ? isFiliado(employee) : true; // Por padrão, assume filiado se não houver employee
    
    // Se não for filiado, aplicar máscara ocultando os últimos 4 dígitos
    if (!empregadoFiliado) {
      // Manter os primeiros dígitos e ocultar os últimos 4 com "X"
      // Para formato X.XXX.XXX-X, os últimos 4 dígitos são: os últimos 3 do terceiro grupo + o último dígito
      // Exemplo: 1.234.567-8 -> ocultar "567-8" -> 1.234.XXX-X
      // Mas é mais simples: manter primeiros 4 dígitos e ocultar últimos 4
      const visibleDigits = cleanValue.slice(0, -4); // Primeiros dígitos (exceto últimos 4)
      const hiddenPart = 'XXXX'; // Últimos 4 dígitos ocultos
      
      // Se tem 8 dígitos, formato é X.XXX.XXX-X
      // Se ocultarmos os últimos 4, teremos: primeiros 4 dígitos + XXXX
      // Exemplo: 12345678 -> 1234XXXX
      // Mas queremos manter a formatação: 1.234.XXX-X
      if (cleanValue.length === 8) {
        // Formato: X.XXX.XXX-X
        // Ocultar: últimos 4 dígitos (último do terceiro grupo + último dígito)
        // Manter: 1.234.XXX-X
        const firstDigit = cleanValue[0];
        const nextThree = cleanValue.slice(1, 4);
        return `${firstDigit}.${nextThree}.XXX-X`;
      } else {
        // Para outros tamanhos, manter primeiros dígitos e ocultar últimos 4
        return visibleDigits + hiddenPart;
      }
    }
    
    // Se for filiado ou não houver informação, formata normalmente
    // Formata no padrão X.XXX.XXX-X
    const formatted = cleanValue.replace(/^(\d{1})(\d{3})(\d{3})(\d{1})$/, '$1.$2.$3-$4');
    
    return formatted;
  };

  // Função para formatar mês/ano no formato AAAAMM para MM/AAAA
  const formatMonthYear = (value: string | number): string => {
    if (!value) return '-';
    
    const valueStr = value.toString();
    
    // Verifica se é um número no formato AAAAMM (6 dígitos)
    if (valueStr.length === 6 && /^\d{6}$/.test(valueStr)) {
      const year = valueStr.substring(0, 4);
      const month = valueStr.substring(4, 6);
      
      // Valida se o mês está entre 01 e 12
      const monthNum = parseInt(month, 10);
      if (monthNum >= 1 && monthNum <= 12) {
        return `${month}/${year}`;
      }
    }
    
    // Se não for no formato esperado, retorna o valor original
    return valueStr;
  };

  // Função para ordenar os dados
  const sortData = (data: any[], column: string, direction: 'asc' | 'desc') => {
    return [...data].sort((a, b) => {
      let valueA = (a as any)[column];
      let valueB = (b as any)[column];

      // Se os valores são números, compara numericamente
      if (typeof valueA === 'number' && typeof valueB === 'number') {
        return direction === 'asc' ? valueA - valueB : valueB - valueA;
      }

      // Se os valores são strings, compara alfabeticamente
      if (typeof valueA === 'string' && typeof valueB === 'string') {
        const comparison = valueA.localeCompare(valueB, 'pt-BR', { numeric: true });
        return direction === 'asc' ? comparison : -comparison;
      }

      // Converte para string para comparação
      const strA = String(valueA || '');
      const strB = String(valueB || '');
      const comparison = strA.localeCompare(strB, 'pt-BR', { numeric: true });
      return direction === 'asc' ? comparison : -comparison;
    });
  };

  // Função para lidar com a ordenação
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      // Se clicar na mesma coluna, inverte a direção
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Se clicar em uma nova coluna, define como ascendente
      setSortColumn(column);
      setSortDirection('asc');
    }
    setCurrentPage(1); // Volta para a primeira página ao ordenar
  };

  // Filtra os funcionários baseado no termo de busca
  const filteredEmployees = processedData?.employees.filter(emp => {
    if (!debouncedSearchTerm) return true;
    
    const searchLower = debouncedSearchTerm.toLowerCase();
    
    // Busca apenas nas colunas visíveis (excluindo colunas ocultas)
    return visibleColumns.some(column => {
      const value = (emp as any)[column];
      if (value) {
        return value.toString().toLowerCase().includes(searchLower);
      }
      return false;
    });
  }) || [];

  // Aplica ordenação aos dados filtrados
  const sortedEmployees = sortColumn 
    ? sortData(filteredEmployees, sortColumn, sortDirection)
    : filteredEmployees;

  // Lógica de paginação
  const totalPages = Math.ceil(sortedEmployees.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentEmployees = sortedEmployees.slice(startIndex, endIndex);

  // Reset para primeira página quando mudar a busca ou ordenação
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, itemsPerPage, sortColumn, sortDirection]);

  // Verificar se não há dados e redirecionar para Dashboard
  useEffect(() => {
    if (!hasData) {
      console.log('📊 Nenhum dado carregado - redirecionando para Dashboard');
      // Pequeno delay para mostrar a mensagem antes do redirecionamento
      const timer = setTimeout(() => {
        navigate('/');
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [hasData, navigate]);

  if (!hasData) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#1d335b' }}>Base de Dados</h1>
          <p className="text-gray-600">Visualize todos os registros do arquivo carregado</p>
        </div>
        
        <div className="card">
          <div className="card-content">
            <div className="text-center py-12">
              <div className="mx-auto h-16 w-16 text-gray-400 mb-4">
                <Database className="w-16 h-16" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum dado carregado
              </h3>
              <p className="text-gray-500 mb-6">
                Não há dados disponíveis para visualização. O sistema trabalha com dados do banco de dados.
              </p>
              <div className="flex flex-col items-center space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  <span>Redirecionando para o Dashboard em 3 segundos...</span>
                </div>
                <button
                  onClick={() => navigate('/')}
                  className="inline-flex items-center px-4 py-2 rounded-lg text-white font-medium transition-colors hover:opacity-90"
                  style={{ backgroundColor: '#1d335b' }}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Ir para Dashboard Agora
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#1d335b' }}>Base de Dados</h1>
          <p className="text-gray-600">
            Visualizando {processedData!.summary.totalRecords.toLocaleString('pt-BR')} registros do arquivo
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Exibindo {startIndex + 1} a {Math.min(endIndex, sortedEmployees.length)} de {sortedEmployees.length.toLocaleString('pt-BR')} registros do arquivo
          </p>
        </div>
        <button 
          className="btn btn-primary"
          style={{ backgroundColor: '#1d335b' }}
          onClick={handleOpenExportModal}
        >
          <Download className="h-4 w-4 mr-2" />
          Exportar
        </button>
      </div>

      {/* Filtros */}
      <div className="card">
        <div className="card-content">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Buscar
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar em todas as colunas..."
                  className="input pl-10 h-10"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Itens por página
              </label>
              <select
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="input h-10"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={200}>200</option>
                <option value={500}>500</option>
                <option value={1000}>1000</option>
              </select>
            </div>

            <div>
              <button
                onClick={() => setSearchTerm('')}
                className="btn btn-secondary w-full h-10"
                style={{ backgroundColor: '#c9504c', color: 'white' }}
              >
                <Filter className="h-4 w-4 mr-2" />
                Limpar Filtros
              </button>
            </div>

            <div>
              <div className="text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-md border border-gray-200 h-10 flex items-center">
                {sortedEmployees.length.toLocaleString('pt-BR')} registros encontrados
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabela de Base de Dados */}
      <div className="card">
        <div className="card-content">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {/* Colunas visíveis (ocultando RACA, GRAU_INSTRUCAO, TIPO_DEFICIENCIA) */}
                  {visibleColumns.map((column) => (
                    <th 
                      key={column} 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort(column)}
                      title={`Ordenar por ${column}`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{column}</span>
                        <div className="flex flex-col ml-2">
                          {sortColumn === column ? (
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
                  ))}
                  
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentEmployees.length > 0 ? (
                  currentEmployees.map((employee, index) => (
                    <tr key={employee.id || index} className="hover:bg-gray-50">
                      {/* Colunas visíveis (ocultando RACA, GRAU_INSTRUCAO, TIPO_DEFICIENCIA) */}
                      {visibleColumns.map((column) => {
                        const value = (employee as any)[column];
                        
                        // Formatação especial para diferentes tipos de dados
                        let displayValue = value || '-';
                        
                        // Formatação específica para matrícula - PRIORIDADE MÁXIMA
                        const matriculaColumns = [
                          'Matrícula', 'MATRICULA', 'matricula', 'Matricula', 'Registration', 'REGISTRATION',
                          'Matricula', 'MATRÍCULA', 'matrícula', 'Matrícula', 'Registro', 'REGISTRO',
                          'Mat', 'MAT', 'mat', 'Reg', 'REG', 'reg'
                        ];
                        
                        // Formatação específica para campos de mês/ano - PRIORIDADE MÁXIMA
                        const monthYearColumns = [
                          'Mês', 'MES', 'mes', 'Month', 'MONTH', 'month',
                          'Mês/Ano', 'MES/ANO', 'mes/ano', 'Month/Year', 'MONTH/YEAR', 'month/year',
                          'Período', 'PERIODO', 'periodo', 'Period', 'PERIOD', 'period',
                          'Referência', 'REFERENCIA', 'referencia', 'Reference', 'REFERENCE', 'reference'
                        ];
                        
                        // Colunas que devem ser tratadas como texto puro (sem formatação)
                        const textOnlyColumns = [
                          'Motivo Afastamento', 'MOTIVO AFASTAMENTO', 'motivo afastamento', 'MotivoAfastamento',
                          'Motivo', 'MOTIVO', 'motivo', 'Reason', 'REASON', 'reason',
                          'Descrição', 'DESCRIÇÃO', 'descrição', 'Description', 'DESCRIPTION', 'description',
                          'Observação', 'OBSERVAÇÃO', 'observação', 'Observation', 'OBSERVATION', 'observation',
                          'Comentário', 'COMENTÁRIO', 'comentário', 'Comment', 'COMMENT', 'comment',
                          'Nota', 'NOTA', 'nota', 'Note', 'NOTE', 'note',
                          'Status', 'STATUS', 'status', 'Situação', 'SITUAÇÃO', 'situação',
                          'Tipo', 'TIPO', 'tipo', 'Type', 'TYPE', 'type',
                          'Categoria', 'CATEGORIA', 'categoria', 'Category', 'CATEGORY', 'category',
                          'Lotação', 'LOTAÇÃO', 'lotação', 'Lotacao', 'LOTACAO', 'lotacao', 'Location', 'LOCATION', 'location',
                          'Setor', 'SETOR', 'setor', 'Sector', 'SECTOR', 'sector',
                          'Área', 'AREA', 'area', 'Area', 'AREA', 'area',
                          'Cargo', 'CARGO', 'cargo', 'Position', 'POSITION', 'position', 'Job', 'JOB', 'job',
                          'Função', 'FUNÇÃO', 'função', 'Function', 'FUNCTION', 'function',
                          'Departamento', 'DEPARTAMENTO', 'departamento', 'Department', 'DEPARTMENT', 'department',
                          'Divisão', 'DIVISÃO', 'divisão', 'Division', 'DIVISION', 'division',
                          'Gerência', 'GERÊNCIA', 'gerência', 'Management', 'MANAGEMENT', 'management',
                          'Coordenação', 'COORDENAÇÃO', 'coordenação', 'Coordination', 'COORDINATION', 'coordination',
                          'Centro de Custo', 'CENTRO DE CUSTO', 'centro de custo', 'Cost Center', 'COST CENTER', 'cost center',
                          'Código', 'CÓDIGO', 'código', 'Code', 'CODE', 'code',
                          'Referência', 'REFERÊNCIA', 'referência', 'Reference', 'REFERENCE', 'reference',
                          'Identificação', 'IDENTIFICAÇÃO', 'identificação', 'Identification', 'IDENTIFICATION', 'identification',
                          'Número', 'NÚMERO', 'número', 'Number', 'NUMBER', 'number',
                          'Sequencial', 'SEQUENCIAL', 'sequencial', 'Sequential', 'SEQUENTIAL', 'sequential',
                          'Ordem', 'ORDEM', 'ordem', 'Order', 'ORDER', 'order',
                          'Classificação', 'CLASSIFICAÇÃO', 'classificação', 'Classification', 'CLASSIFICATION', 'classification',
                          'Grupo', 'GRUPO', 'grupo', 'Group', 'GROUP', 'group',
                          'Subgrupo', 'SUBGRUPO', 'subgrupo', 'Subgroup', 'SUBGROUP', 'subgroup',
                          'Filiação', 'FILIAÇÃO', 'filiação', 'Affiliation', 'AFFILIATION', 'affiliation',
                          'Vínculo', 'VÍNCULO', 'vínculo', 'Bond', 'BOND', 'bond',
                          'Contrato', 'CONTRATO', 'contrato', 'Contract', 'CONTRACT', 'contract',
                          'Modalidade', 'MODALIDADE', 'modalidade', 'Modality', 'MODALITY', 'modality',
                          'Regime', 'REGIME', 'regime', 'Regime', 'REGIME', 'regime',
                          'Jornada', 'JORNADA', 'jornada', 'Journey', 'JOURNEY', 'journey',
                          'Turno', 'TURNO', 'turno', 'Shift', 'SHIFT', 'shift',
                          'Horário', 'HORÁRIO', 'horário', 'Schedule', 'SCHEDULE', 'schedule',
                          'Local', 'LOCAL', 'local', 'Place', 'PLACE', 'place',
                          'Endereço', 'ENDEREÇO', 'endereço', 'Address', 'ADDRESS', 'address',
                          'Bairro', 'BAIRRO', 'bairro', 'Neighborhood', 'NEIGHBORHOOD', 'neighborhood',
                          'Cidade', 'CIDADE', 'cidade', 'City', 'CITY', 'city',
                          'Estado', 'ESTADO', 'estado', 'State', 'STATE', 'state',
                          'CEP', 'cep', 'Zip', 'ZIP', 'zip', 'Postal', 'POSTAL', 'postal',
                          'Telefone', 'TELEFONE', 'telefone', 'Phone', 'PHONE', 'phone', 'Tel', 'TEL', 'tel',
                          'Celular', 'CELULAR', 'celular', 'Mobile', 'MOBILE', 'mobile', 'Cell', 'CELL', 'cell',
                          'Email', 'EMAIL', 'email', 'E-mail', 'E-MAIL', 'e-mail', 'Mail', 'MAIL', 'mail',
                          'CPF', 'cpf', 'Cpf', 'Document', 'DOCUMENT', 'document',
                          'RG', 'rg', 'Rg', 'Identity', 'IDENTITY', 'identity',
                          'PIS', 'pis', 'Pis', 'PIS', 'pis',
                          'CTPS', 'ctps', 'Ctps', 'CTPS', 'ctps',
                          'Título', 'TÍTULO', 'título', 'Title', 'TITLE', 'title',
                          'Zona', 'ZONA', 'zona', 'Zone', 'ZONE', 'zone',
                          'Seção', 'SEÇÃO', 'seção', 'Section', 'SECTION', 'section',
                          'Observação', 'OBSERVAÇÃO', 'observação', 'Observation', 'OBSERVATION', 'observation',
                          'Observações', 'OBSERVAÇÕES', 'observações', 'Observations', 'OBSERVATIONS', 'observations',
                          // Adicionar nomes das colunas do backend
                          'motivo_afast'
                        ];
                        
                        if (monthYearColumns.some(col => column.toLowerCase().includes(col.toLowerCase()))) {
                          displayValue = formatMonthYear(value);
                        }
                        else if (matriculaColumns.includes(column)) {
                          // Passar o employee completo para verificar se é filiado
                          displayValue = formatMatricula(value, employee);
                        }
                        // Colunas de texto puro - PRIORIDADE ALTA
                        else if (textOnlyColumns.includes(column)) {
                          // Mantém o valor original sem formatação
                          displayValue = value || '-';
                        }
                        // Formatação específica para campos de data
                        else {
                          const dateColumns = [
                            'Data Nascimento', 'DATA NASCIMENTO', 'data nascimento', 'DataNascimento', 'Birth Date', 'BIRTH DATE',
                            'Data Admissão', 'DATA ADMISSÃO', 'data admissão', 'DataAdmissao', 'Admission Date', 'ADMISSION DATE',
                            'Data Afastamento', 'DATA AFASTAMENTO', 'data afastamento', 'DataAfastamento', 'Leave Date', 'LEAVE DATE',
                            'Data', 'DATA', 'data', 'Date', 'DATE',
                            // Adicionar nomes das colunas do backend
                            'data_nasc', 'data_admissao', 'data_afast', 'data_criacao', 'data_atualizacao'
                          ];
                          if (dateColumns.includes(column)) {
                            try {
                              // Verificar se é campo de data de afastamento
                              const afastColumns = [
                                'Data Afastamento', 'DATA AFASTAMENTO', 'data afastamento', 'DataAfastamento', 
                                'Leave Date', 'LEAVE DATE', 'data_afast', 'DATA_AFAST'
                              ];
                              if (afastColumns.some(col => column.toLowerCase().includes(col.toLowerCase()))) {
                                displayValue = formatAfastDate(value);
                              } else {
                                displayValue = value;
                              }
                            } catch (error) {
                              displayValue = value;
                            }
                          }
                          // Formatação específica para campos de valor/moeda
                          else {
                            const currencyColumns = [
                              'Valor Mensalidade', 'VALOR MENSALIDADE', 'valor mensalidade', 'ValorMensalidade',
                              'Mensalidade', 'MENSALIDADE', 'mensalidade',
                              'Valor', 'VALOR', 'valor', 'Price', 'PRICE', 'price',
                              'Salário', 'SALARIO', 'salario', 'Salary', 'SALARY', 'salary',
                              'Remuneração', 'REMUNERACAO', 'remuneracao', 'Remuneration', 'REMUNERATION',
                              // Adicionar nome da coluna do backend
                              'valor_mensalidade'
                            ];
                            
                            if (currencyColumns.includes(column)) {
                              const numValue = typeof value === 'number' ? value : Number(value.toString().replace(/[^\d,.-]/g, ''));
                              if (!isNaN(numValue)) {
                                displayValue = formatCurrency(numValue);
                              }
                            }
                            // Se o valor parece ser um número (salário, etc.) - mas não é matrícula nem data nem valor específico
                            else if (typeof value === 'number' || (typeof value === 'string' && !isNaN(Number(value.replace(/[^\d.,]/g, ''))))) {
                              const numValue = typeof value === 'number' ? value : Number(value.replace(/[^\d.,]/g, ''));
                              
                              // Verifica se não é um campo de mês/ano (formato AAAAMM)
                              const isMonthYearField = monthYearColumns.some(col => column.toLowerCase().includes(col.toLowerCase()));
                              const isMonthYearValue = value.toString().length === 6 && /^\d{6}$/.test(value.toString());
                              
                              if (numValue > 1000 && !isMonthYearField && !isMonthYearValue) { // Provavelmente é um salário
                                displayValue = formatCurrency(numValue);
                              }
                            }
                          }
                        }
                        
                        return (
                          <td key={column} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {displayValue}
                          </td>
                        );
                      })}
                      
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button 
                            onClick={() => handleViewEmployee(employee)}
                            className="text-blue-600 hover:text-blue-900 transition-colors"
                            title="Visualizar"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleEditEmployee(employee)}
                            disabled={isLoadingEmployeeData}
                            className="text-green-600 hover:text-green-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title={isLoadingEmployeeData ? "Carregando dados..." : "Editar"}
                          >
                            {isLoadingEmployeeData ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                            ) : (
                              <Edit className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={visibleColumns.length + 1} className="px-6 py-4 text-center text-gray-500">
                      Nenhum registro encontrado
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Controles de Paginação */}
          {sortedEmployees.length > 0 && (
            <div className="mt-6">
              {/* Informações da página - sempre visível */}
              <div className="text-sm text-gray-700 mb-3 text-center sm:text-left">
                Página {currentPage} de {totalPages} ({sortedEmployees.length.toLocaleString('pt-BR')} registros)
              </div>
              
              {/* Controles de navegação - responsivos */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center gap-3">
                {/* Botões principais - sempre visíveis */}
                <div className="flex items-center justify-center space-x-1 sm:space-x-2">
                  {/* Botão Primeira Página */}
                  <button
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className="px-2 sm:px-3 py-1 text-xs sm:text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Primeira página"
                  >
                    <span className="hidden sm:inline">««</span>
                    <span className="sm:hidden">««</span>
                  </button>
                  
                  {/* Botão Página Anterior */}
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-2 sm:px-3 py-1 text-xs sm:text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Página anterior"
                  >
                    <span className="hidden sm:inline">«</span>
                    <span className="sm:hidden">«</span>
                  </button>
                  
                  {/* Números das páginas */}
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
                          className={`px-2 sm:px-3 py-1 text-xs sm:text-sm border rounded-md transition-colors ${
                            currentPage === pageNumber
                              ? 'bg-red-600 text-white border-red-600'
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
                  
                  {/* Botão Próxima Página */}
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-2 sm:px-3 py-1 text-xs sm:text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Próxima página"
                  >
                    <span className="hidden sm:inline">»</span>
                    <span className="sm:hidden">»</span>
                  </button>
                  
                  {/* Botão Última Página */}
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className="px-2 sm:px-3 py-1 text-xs sm:text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Última página"
                  >
                    <span className="hidden sm:inline">»»</span>
                    <span className="sm:hidden">»»</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Mensagem quando não há resultados */}
          {filteredEmployees.length === 0 && (
            <div className="text-center py-8">
              <div className="mx-auto h-12 w-12 text-gray-400 mb-4">🔍</div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum resultado encontrado
              </h4>
              <p className="text-gray-500">
                Tente ajustar os filtros de busca para encontrar os registros desejados.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Visualização do Empregado */}
      {showViewModal && selectedEmployee && (
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
                    Dados do Empregado
                  </h2>
                  <p className="text-sm text-gray-600">
                    Visualização completa das informações
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handlePrintEmployee}
                  className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white rounded-md transition-colors"
                  style={{ backgroundColor: '#1d335b' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2a4a7a'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1d335b'}
                  title="Imprimir dados do empregado"
                >
                  <Printer className="h-4 w-4" />
                  <span>Imprimir</span>
                </button>
                <button
                  onClick={handleCloseModal}
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
                    {visibleColumns.map((column) => {
                      const value = (selectedEmployee as any)[column];
                      let displayValue = value || '-';
                      
                      // Formatação específica para diferentes tipos de dados
                      const matriculaColumns = [
                        'Matrícula', 'MATRICULA', 'matricula', 'Matricula', 'Registration', 'REGISTRATION',
                        'Matricula', 'MATRÍCULA', 'matrícula', 'Matrícula', 'Registro', 'REGISTRO',
                        'Mat', 'MAT', 'mat', 'Reg', 'REG', 'reg'
                      ];
                      
                      const monthYearColumns = [
                        'Mês', 'MES', 'mes', 'Month', 'MONTH', 'month',
                        'Mês/Ano', 'MES/ANO', 'mes/ano', 'Month/Year', 'MONTH/YEAR', 'month/year',
                        'Período', 'PERIODO', 'periodo', 'Period', 'PERIOD', 'period',
                        'Referência', 'REFERENCIA', 'referencia', 'Reference', 'REFERENCE', 'reference'
                      ];
                      
                      const dateColumns = [
                        'Data Nascimento', 'DATA NASCIMENTO', 'data nascimento', 'DataNascimento', 'Birth Date', 'BIRTH DATE',
                        'Data Admissão', 'DATA ADMISSÃO', 'data admissão', 'DataAdmissao', 'Admission Date', 'ADMISSION DATE',
                        'Data Afastamento', 'DATA AFASTAMENTO', 'data afastamento', 'DataAfastamento', 'Leave Date', 'LEAVE DATE',
                        'Data', 'DATA', 'data', 'Date', 'DATE',
                        'data_nasc', 'data_admissao', 'data_afast', 'data_criacao', 'data_atualizacao'
                      ];
                      
                      const currencyColumns = [
                        'Valor Mensalidade', 'VALOR MENSALIDADE', 'valor mensalidade', 'ValorMensalidade',
                        'Mensalidade', 'MENSALIDADE', 'mensalidade',
                        'Valor', 'VALOR', 'valor', 'Price', 'PRICE', 'price',
                        'Salário', 'SALARIO', 'salario', 'Salary', 'SALARY', 'salary',
                        'Remuneração', 'REMUNERACAO', 'remuneracao', 'Remuneration', 'REMUNERATION',
                        'valor_mensalidade'
                      ];
                      
                      // Aplicar formatações específicas
                      if (monthYearColumns.some(col => column.toLowerCase().includes(col.toLowerCase()))) {
                        displayValue = formatMonthYear(value);
                      } else if (matriculaColumns.includes(column)) {
                        // Passar selectedEmployee para verificar se é filiado
                        displayValue = formatMatricula(value, selectedEmployee);
                      } else if (dateColumns.includes(column)) {
                        // Verificar se é campo de data de afastamento
                        const afastColumns = [
                          'Data Afastamento', 'DATA AFASTAMENTO', 'data afastamento', 'DataAfastamento', 
                          'Leave Date', 'LEAVE DATE', 'data_afast', 'DATA_AFAST'
                        ];
                        if (afastColumns.some(col => column.toLowerCase().includes(col.toLowerCase()))) {
                          displayValue = formatAfastDate(value);
                        } else {
                          displayValue = value;
                        }
                      } else if (currencyColumns.includes(column)) {
                        const numValue = typeof value === 'number' ? value : Number(value.toString().replace(/[^\d,.-]/g, ''));
                        if (!isNaN(numValue)) {
                          displayValue = formatCurrency(numValue);
                        }
                      }
                      
                      return (
                        <div key={column} className="flex justify-between items-center py-2 border-b border-gray-100">
                          <span className="text-sm font-medium text-gray-600 capitalize">
                            {column.replace(/_/g, ' ').toLowerCase()}
                          </span>
                          <span className="text-sm text-gray-900 text-right max-w-xs truncate" title={displayValue}>
                            {displayValue}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Resumo Visual */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 mb-4">
                    <FileText className="h-5 w-5" style={{ color: '#1d335b' }} />
                    <h3 className="text-lg font-medium text-gray-900">Resumo</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4">
                    {/* Card da Foto do Empregado - PRIMEIRO */}
                    {selectedEmployee.foto && (
                      <div className="bg-gradient-to-r from-gray-50 to-slate-50 p-4 rounded-lg border border-gray-200">
                        <div className="flex flex-col items-center space-y-3">
                          <div className="relative">
                            <img
                              src={(() => {
                                const fotoUrl = selectedEmployee.foto;
                                console.log('🖼️ Foto URL original da API:', fotoUrl);
                                
                                if (!fotoUrl) {
                                  console.log('❌ Nenhuma foto encontrada na API');
                                  return 'https://picsum.photos/96/96';
                                }
                                
                                // Construir URL completa baseada na resposta da API
                                //const baseUrl = import.meta.env.MODE === 'production' 
                                //  ? window.location.origin 
                                //  : 'http://localhost:3000';
                                
                                const fullUrl = fotoUrl;
                                console.log('🖼️ URL construída:', fullUrl);
                                
                                // SOLUÇÃO: Converter para base64 para evitar problemas de CORS
                                fetch(fullUrl)
                                  .then(response => response.blob())
                                  .then(blob => {
                                    const reader = new FileReader();
                                    reader.onload = () => {
                                      const img = document.querySelector('img[alt="Foto do Empregado"]') as HTMLImageElement;
                                      if (img) {
                                        img.src = reader.result as string;
                                        selectedEmployee.foto = reader.result as string; // Atualiza o estado com a imagem em base64
                                        console.log('✅ Foto convertida para base64 e carregada');
                                      }
                                    };
                                    reader.readAsDataURL(blob);
                                  })
                                  .catch(error => {
                                    console.error('❌ Erro ao converter foto para base64:', error);
                                  });
                                
                                // Retornar uma imagem de loading temporária
                                return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iOTYiIGhlaWdodD0iOTYiIHZpZXdCb3g9IjAgMCA5NiA5NiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iNDgiIGN5PSI0OCIgcj0iNDgiIGZpbGw9IiNGM0Y0RjYiLz4KPHBhdGggZD0iTTQ4IDI0QzU0LjYyNzQgMjQgNjAgMjkuMzcyNiA2MCAzNkM2MCA0Mi42Mjc0IDU0LjYyNzQgNDggNDggNDhDNDEuMzcyNiA0OCAzNiA0Mi42Mjc0IDM2IDM2QzM2IDI5LjM3MjYgNDEuMzcyNiAyNCA0OCAyNFoiIGZpbGw9IiM5Q0EzQUYiLz4KPHBhdGggZD0iTTI0IDcyQzI0IDYzLjE2MzQgMzEuMTYzNCA1NiA0MCA1Nkg1NkM2NC44MzY2IDU2IDcyIDYzLjE2MzQgNzIgNzJWNzJIMjRaIiBmaWxsPSIjOUNBM0FGIi8+Cjwvc3ZnPgo=';
                              })()}
                              alt="Foto do Empregado"
                              className="w-24 h-24 rounded-full object-cover border-4 border-gray-200 shadow-lg"
                              onError={(e) => {
                                console.error('❌ Erro ao carregar foto:', e.currentTarget.src);
                                console.log('🔍 URL que falhou:', e.currentTarget.src);
                                console.log('🔍 Status do erro:', e);
                                console.log('🔄 Usando fallback: Picsum');
                                e.currentTarget.src = 'https://picsum.photos/96/96';
                                e.currentTarget.alt = 'Foto não disponível';
                              }}
                              onLoad={(e) => {
                                console.log('✅ Foto carregada com sucesso:', e.currentTarget.src);
                              }}
                            />
                            <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white rounded-full p-1">
                              <Camera className="h-3 w-3" />
                            </div>
                          </div>
                          <div className="text-center">
                            <h4 className="font-medium text-gray-900 text-sm">Foto do Empregado</h4>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Card de Informações Principais */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-full">
                          <User className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">Nome Completo</h4>
                          <p className="text-sm text-gray-600">
                            {selectedEmployee.nome || selectedEmployee.Nome || selectedEmployee.NOME || '-'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Card de Matrícula */}
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-green-100 rounded-full">
                          <Briefcase className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">Matrícula</h4>
                          <p className="text-sm text-gray-600">
                            {formatMatricula(selectedEmployee.matricula || selectedEmployee.Matrícula || selectedEmployee.MATRÍCULA || selectedEmployee.Matricula || '-', selectedEmployee)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Card de E-mail - APÓS MATRÍCULA */}
                    {(selectedEmployee.email || selectedEmployee.Email || selectedEmployee.EMAIL) && (
                      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-lg border border-blue-200">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-blue-100 rounded-full">
                            <Mail className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">E-mail</h4>
                            <p className="text-sm text-gray-600">
                              {selectedEmployee.email || selectedEmployee.Email || selectedEmployee.EMAIL || '-'}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Card de Celular - APÓS E-MAIL */}
                    {(selectedEmployee.celular || selectedEmployee.Celular || selectedEmployee.CELULAR) && (
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-green-100 rounded-full">
                            <Phone className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">Celular</h4>
                            <p className="text-sm text-gray-600">
                              {selectedEmployee.celular || selectedEmployee.Celular || selectedEmployee.CELULAR || '-'}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Card de Cargo */}
                    <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-4 rounded-lg border border-purple-200">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-purple-100 rounded-full">
                          <Building className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">Cargo</h4>
                          <p className="text-sm text-gray-600">
                            {selectedEmployee.cargo || selectedEmployee.Cargo || selectedEmployee.CARGO || '-'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Card de Lotação */}
                    <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-4 rounded-lg border border-indigo-200">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-indigo-100 rounded-full">
                          <MapPin className="h-5 w-5 text-indigo-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">Lotação</h4>
                          <p className="text-sm text-gray-600">
                            {selectedEmployee.lotacao || selectedEmployee.Lotacao || selectedEmployee.LOTAÇÃO || selectedEmployee.lotação || selectedEmployee.Lotacao || '-'}
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
                onClick={handleCloseModal}
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

      {/* Modal de Edição */}
      {showEditModal && selectedEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header do Modal */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200" style={{ backgroundColor: '#f8fafc' }}>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Editar Empregado
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Atualize as informações de contato do empregado
                </p>
              </div>
              <button
                onClick={handleCloseEditModal}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                title="Fechar"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {/* Conteúdo do Modal */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1 modal-scroll">
              {/* Indicador de carregamento */}
              {isLoadingEmployeeData && (
                <div className="flex items-center justify-center py-8">
                  <div className="flex items-center space-x-3">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <span className="text-sm text-gray-600">Carregando dados do empregado...</span>
                  </div>
                </div>
              )}

              {/* Informações do Empregado (Somente Leitura) */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Informações do Empregado</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex flex-col">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Nome</label>
                    <div className="text-sm text-gray-900 bg-white px-3 py-2 rounded border flex-1 flex items-center">
                      {selectedEmployee.nome || selectedEmployee.Nome || selectedEmployee.NOME || '-'}
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Matrícula</label>
                    <div className="text-sm text-gray-900 bg-white px-3 py-2 rounded border flex-1 flex items-center">
                      {formatMatricula(selectedEmployee.matricula || selectedEmployee.Matrícula || selectedEmployee.MATRÍCULA || selectedEmployee.Matricula || '-', selectedEmployee)}
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Lotação</label>
                    <div className="text-sm text-gray-900 bg-white px-3 py-2 rounded border flex-1 flex items-center">
                      {selectedEmployee.lotacao || selectedEmployee.Lotacao || selectedEmployee.LOTAÇÃO || selectedEmployee.lotação || selectedEmployee.Lotacao || '-'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Formulário de Edição */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-900">Informações de Contato</h4>
                <input 
                  type="hidden"
                  value={selectedEmployee.base_sindical}
                  name="base_sindical"
                />
                {/* Campo E-mail */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail className="h-4 w-4 inline mr-2" />
                    E-mail
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={editFormData.email}
                      onChange={(e) => handleEditFormChange('email', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10 ${
                        emailError ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Digite o e-mail do empregado"
                    />
                    {editFormData.email && (
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        {emailError ? (
                          <AlertCircle className="h-5 w-5 text-red-500" />
                        ) : (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        )}
                      </div>
                    )}
                  </div>
                  {emailError && (
                    <p className="mt-1 text-sm text-red-600">{emailError}</p>
                  )}
                </div>

                {/* Campo Celular */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone className="h-4 w-4 inline mr-2" />
                    Celular
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      value={editFormData.celular}
                      onChange={(e) => handleEditFormChange('celular', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10 ${
                        celularError ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="(XX) XXXXX-XXXX"
                      maxLength={15}
                    />
                    {editFormData.celular && (
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        {celularError ? (
                          <AlertCircle className="h-5 w-5 text-red-500" />
                        ) : (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        )}
                      </div>
                    )}
                  </div>
                  {celularError && (
                    <p className="mt-1 text-sm text-red-600">{celularError}</p>
                  )}
                </div>

                {/* Campo Foto */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Camera className="h-4 w-4 inline mr-2" />
                    Foto do Empregado
                  </label>
                  
                  {/* Preview da Foto */}
                  <FotoPreview key={forceRender} fotoUrl={fotoPreview} />
                  
                  {/* Opções de Upload */}
                  <div className="grid grid-cols-2 gap-3">
                    {/* Upload de Arquivo */}
                    <div className="border-2 border-gray-300 border-dashed rounded-md p-4 hover:border-gray-400 transition-colors">
                      <div className="text-center">
                        <FileText className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                        <label
                          htmlFor="foto-upload"
                          className="cursor-pointer text-sm font-medium text-blue-600 hover:text-blue-500"
                        >
                          Carregar Foto
                        </label>
                        <input
                          id="foto-upload"
                          name="foto-upload"
                          type="file"
                          accept="image/*"
                          className="sr-only"
                          onChange={(e) => {
                            const file = e.target.files?.[0] || null;
                            handleEditFormChange('foto', file);
                          }}
                        />
                        <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF</p>
                      </div>
                    </div>
                    
                    {/* Tirar Foto */}
                    <div 
                      className="border-2 border-gray-300 border-dashed rounded-md p-4 hover:border-gray-400 transition-colors cursor-pointer"
                      onClick={startCamera}
                    >
                      <div className="text-center">
                        <CameraIcon className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                        <span className="text-sm font-medium text-blue-600 hover:text-blue-500">
                          Tirar Foto
                        </span>
                        <p className="text-xs text-gray-500 mt-1">Usar câmera</p>
                      </div>
                    </div>
                  </div>
                  
                  {editFormData.foto && (
                    <p className="text-sm text-green-600 mt-2">
                      ✓ Arquivo selecionado: {editFormData.foto.name}
                    </p>
                  )}
                </div>
              </div>

              {/* Aviso sobre campos não editáveis */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <User className="h-5 w-5 text-blue-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">
                      Campos Não Editáveis
                    </h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <p>Os campos Nome, Matrícula e Lotação não podem ser editados pois fazem parte dos dados originais da base de dados.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Indicador de scroll */}
              <div className="text-center py-4">
                <div className="inline-flex items-center text-xs text-gray-400">
                  <div className="w-1 h-1 bg-gray-300 rounded-full mr-1"></div>
                  <div className="w-1 h-1 bg-gray-300 rounded-full mr-1"></div>
                  <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                  <span className="ml-2">Role para baixo para acessar os botões</span>
                </div>
              </div>
            </div>

            {/* Footer do Modal */}
            <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 flex-shrink-0" style={{ backgroundColor: '#f8fafc' }}>
              <button
                onClick={handleCloseEditModal}
                className="px-6 py-2 text-sm font-medium rounded-md transition-colors disabled:opacity-50"
                style={{ 
                  backgroundColor: '#ffc9c0',
                  color: '#1d335b',
                  border: '1px solid #ffc9c0'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f5b5b0';
                  e.currentTarget.style.borderColor = '#f5b5b0';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#ffc9c0';
                  e.currentTarget.style.borderColor = '#ffc9c0';
                }}
                disabled={isSaving}
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveEmployee}
                disabled={isSaving || !!emailError || !!celularError}
                className="px-6 py-2 text-sm font-medium text-white rounded-md transition-colors disabled:opacity-50 flex items-center space-x-2"
                style={{ 
                  backgroundColor: isSaving || !!emailError || !!celularError ? '#9ca3af' : '#c9504c',
                  border: '1px solid transparent'
                }}
                onMouseEnter={(e) => {
                  if (!isSaving && !emailError && !celularError) {
                    e.currentTarget.style.backgroundColor = '#b03e3a';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSaving && !emailError && !celularError) {
                    e.currentTarget.style.backgroundColor = '#c9504c';
                  }
                }}
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Salvando...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Salvar Alterações</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal da Câmera */}
      {showCamera && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            {/* Header do Modal da Câmera */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Tirar Foto do Empregado
              </h3>
              <button
                onClick={stopCamera}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                title="Fechar"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {/* Conteúdo da Câmera */}
            <div className="p-4">
              <div className="relative">
                <video
                  ref={(ref) => setCameraVideoRef(ref)}
                  autoPlay
                  playsInline
                  className="w-full h-64 bg-gray-900 rounded-lg"
                  style={{ transform: 'scaleX(-1)' }}
                />
                
                {/* Overlay de instruções */}
                <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white px-3 py-2 rounded text-sm">
                  Posicione o rosto no centro da tela
                </div>
              </div>
              
              {/* Controles da Câmera */}
              <div className="flex justify-center space-x-4 mt-4">
                <button
                  onClick={stopCamera}
                  className="px-6 py-2 text-sm font-medium rounded-md transition-colors"
                  style={{ 
                    backgroundColor: '#ffc9c0',
                    color: '#1d335b',
                    border: '1px solid #ffc9c0'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f5b5b0';
                    e.currentTarget.style.borderColor = '#f5b5b0';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#ffc9c0';
                    e.currentTarget.style.borderColor = '#ffc9c0';
                  }}
                >
                  Cancelar
                </button>
                <button
                  onClick={capturePhoto}
                  className="px-6 py-2 text-sm font-medium text-white rounded-md transition-colors flex items-center space-x-2"
                  style={{ backgroundColor: '#c9504c' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#b03e3a';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#c9504c';
                  }}
                >
                  <Camera className="h-4 w-4" />
                  <span>Capturar Foto</span>
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
                  Exportar Dados de Funcionários
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Escolha o formato e exporte os dados filtrados da tabela
                </p>
              </div>
              <button
                onClick={handleCloseExportModal}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                title="Fechar"
              >
                <X className="h-5 w-5 text-gray-500" />
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
                    <Printer className="h-8 w-8 mx-auto mb-2" />
                    <div className="text-sm font-medium">PDF</div>
                    <div className="text-xs text-gray-500">Lista de Presença</div>
                  </button>
                </div>
              </div>

              {/* Informações sobre os dados */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Dados que serão exportados:</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>• Total de registros: {getFilteredDataForExport().length.toLocaleString('pt-BR')}</p>
                  {exportFormat === 'pdf' ? (
                    <p>• Formato: Lista de Presença (Nome, Matrícula, Filiado, Data, Assinatura)</p>
                  ) : (
                    <p>• Colunas incluídas: {visibleColumns.length || 0}</p>
                  )}
                  <p>• Filtros aplicados: {searchTerm ? 'Busca por "' + searchTerm + '"' : 'Nenhum filtro'}</p>
                </div>
              </div>

              {/* Aviso sobre formatação */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <FileText className="h-5 w-5 text-blue-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">
                      Formatação Automática
                    </h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <p>Os dados serão formatados automaticamente:</p>
                      <ul className="list-disc list-inside mt-1 space-y-1">
                        <li>Datas no formato brasileiro (DD/MM/AAAA)</li>
                        <li>Valores monetários com R$ e vírgula decimal</li>
                        <li>Campos vazios serão exibidos como "-"</li>
                      </ul>
                    </div>
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
  );
};

export default Employees;
