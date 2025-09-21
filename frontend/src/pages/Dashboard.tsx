import { useState, useEffect, useCallback, useRef } from 'react';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { formatDate } from '@/utils/dateFormatter';
import DashboardLoading from '@/components/DashboardLoading';
import { 
  Users, 
  DollarSign,
  Gift,
  Calendar,
  ChevronDown
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const Dashboard = () => {
  const { 
    processedData, 
    hasData, 
    loadBaseDadosData, 
    dataSource,
    isLoadingBaseDados,
    loadingProgress,
    currentLoadingStep,
    totalLoadingSteps
  } = useData();
  const { user } = useAuth();
  
  // Estados para filtros das tabelas
  const [seFilter, setSeFilter] = useState('');
  const [municipalityFilter, setMunicipalityFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [selectedWeekOffset, setSelectedWeekOffset] = useState(0);
  
  // Estados para seletor de mês
  const [showMonthSelector, setShowMonthSelector] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState('');
  
  // Estados para seletor de base sindical
  const [showBaseSindicalSelector, setShowBaseSindicalSelector] = useState(false);
  const [selectedBaseSindical, setSelectedBaseSindical] = useState('');

  // Estado para controlar o highlight do gráfico de jornadas
  const [highlightedJornada, setHighlightedJornada] = useState<string | null>(null);

  // Refs para controlar o estado e evitar loops
  const isLoadingRef = useRef(false);
  const lastLoadedBaseSindicalRef = useRef<string | null>(null);
  const lastLoadedMonthRef = useRef<string | null>(null);
  const isInitializedRef = useRef(false);

  // Função para verificar se o usuário é admin da empresa dona do sistema
  const isSystemOwnerAdmin = () => {
    return user?.perfil === 'admin' && user?.empresa?.cnpj === '41.115.030/0001-20';
  };

  // Função para carregar dados da tabela base_dados com debounce
  const handleLoadBaseDados = useCallback(async (forceReload = false) => {
    console.log('📊 === HANDLE LOAD BASE DADOS ===');
    console.log('📊 Usuário:', user);
    console.log('📊 selectedMonth:', selectedMonth);
    console.log('📊 selectedBaseSindical:', selectedBaseSindical);
    console.log('📊 forceReload:', forceReload);
    console.log('📊 isLoadingRef.current:', isLoadingRef.current);
    
    // Evitar múltiplas requisições simultâneas
    if (isLoadingRef.current || isLoadingBaseDados) {
      console.log('⚠️ Carregamento já em andamento, ignorando requisição');
      return;
    }
    
    // Verificar se já carregou os mesmos dados
    if (!forceReload && 
        lastLoadedBaseSindicalRef.current === selectedBaseSindical && 
        lastLoadedMonthRef.current === selectedMonth && 
        processedData) {
      console.log('⚠️ Dados já carregados para esta combinação, ignorando requisição');
      return;
    }
    
    try {
      isLoadingRef.current = true;
      console.log('🚀 Iniciando carregamento...');
      
      await loadBaseDadosData(selectedMonth, selectedBaseSindical);
      
      // Atualizar refs após carregamento bem-sucedido
      lastLoadedBaseSindicalRef.current = selectedBaseSindical;
      lastLoadedMonthRef.current = selectedMonth;
      
      console.log('✅ Carregamento concluído com sucesso');
    } catch (error) {
      console.error('❌ Erro ao carregar dados da base_dados:', error);
    } finally {
      isLoadingRef.current = false;
    }
    console.log('📊 ===============================');
  }, [user, selectedMonth, selectedBaseSindical, isLoadingBaseDados, loadBaseDadosData, processedData]);

  // Efeito para inicialização única
  useEffect(() => {
    if (!isInitializedRef.current && user) {
      console.log('🚀 Inicializando Dashboard...');
      console.log('🚀 Usuário:', user);
      console.log('🚀 Base sindical do usuário:', user.base_sindical);
      
      // Verificar se é admin da empresa dona do sistema
      const isOwnerAdmin = isSystemOwnerAdmin();
      
      if (isOwnerAdmin) {
        // Para admin dono do sistema: priorizar base sindical salva no localStorage
        const savedBaseSindical = localStorage.getItem('selectedBaseSindical');
        if (savedBaseSindical) {
          console.log('🏢 Admin dono: Usando base sindical salva:', savedBaseSindical);
          setSelectedBaseSindical(savedBaseSindical);
        } else {
          // Se não houver base salva, usar a base sindical do usuário
          console.log('🏢 Admin dono: Usando base sindical do usuário:', user.base_sindical);
          if (user.base_sindical) {
            setSelectedBaseSindical(user.base_sindical);
            localStorage.setItem('selectedBaseSindical', user.base_sindical);
          }
        }
      } else {
      // Para outros usuários: sempre usar a base sindical do usuário
      if (user.base_sindical) {
        console.log('🏢 Usuário comum: Definindo base sindical do usuário:', user.base_sindical);
        console.log('🔐 VALIDAÇÃO: Base sindical do usuário:', user.base_sindical);
        setSelectedBaseSindical(user.base_sindical);
        localStorage.setItem('selectedBaseSindical', user.base_sindical);
        
        // Validação de segurança
        if (user.base_sindical !== 'SINTECT/SPM' && user.email === 'fabyghira19@gmail.com') {
          console.error('🚨 ERRO CRÍTICO: Base sindical incorreta para usuária fabyghira19@gmail.com');
          console.error('🚨 Base esperada: SINTECT/SPM, Base recebida:', user.base_sindical);
        }
      } else {
        console.log('⚠️ Nenhuma base sindical encontrada para o usuário');
        console.log('⚠️ Dados do usuário:', user);
      }
      }
      
      // Definir mês selecionado
      if (processedData?.selectedMonthYear && !selectedMonth) {
        setSelectedMonth(processedData.selectedMonthYear);
      }
      
      isInitializedRef.current = true;
    }
  }, [user, processedData?.selectedMonthYear, selectedMonth]);

  // Efeito para carregar dados quando necessário - Otimizado para evitar loops
  useEffect(() => {
    console.log('🔄 === VERIFICANDO CARREGAMENTO ===');
    console.log('🔄 isInitializedRef.current:', isInitializedRef.current);
    console.log('🔄 selectedBaseSindical:', selectedBaseSindical);
    console.log('🔄 isLoadingRef.current:', isLoadingRef.current);
    console.log('🔄 processedData:', !!processedData);
    
    if (isInitializedRef.current && selectedBaseSindical && !isLoadingRef.current) {
      // Verificar se precisa carregar dados - lógica mais restritiva para evitar loops
      const needsReload = !processedData || 
                         (processedData.selectedBaseSindical !== selectedBaseSindical) ||
                         (processedData.selectedMonthYear !== selectedMonth && selectedMonth);
      
      console.log('🔄 needsReload:', needsReload);
      console.log('🔄 processedData.selectedBaseSindical:', processedData?.selectedBaseSindical);
      console.log('🔄 processedData.selectedMonthYear:', processedData?.selectedMonthYear);
      
      // Carregar dados imediatamente sem debounce
      if (needsReload) {
        console.log('🔄 Carregando dados...');
        console.log('🔄 Base sindical:', selectedBaseSindical);
        console.log('🔄 Mês:', selectedMonth);
        
        // Carregar imediatamente para melhor performance
        handleLoadBaseDados(true);
      } else {
        console.log('✅ Dados já estão atualizados, não precisa recarregar');
      }
    } else {
      console.log('⚠️ Condições não atendidas para carregamento');
    }
    console.log('🔄 ===============================');
  }, [selectedBaseSindical, selectedMonth, processedData]);

  // Efeito para fechar seletores quando clicar fora deles
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      
      // Verificar se o clique foi fora dos seletores
      if (!target.closest('.month-selector') && !target.closest('.base-sindical-selector')) {
        setShowMonthSelector(false);
        setShowBaseSindicalSelector(false);
      }
    };

    // Adicionar listener apenas se algum seletor estiver aberto
    if (showMonthSelector || showBaseSindicalSelector) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    // Cleanup
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMonthSelector, showBaseSindicalSelector]);

  // Função para atualizar dados quando o mês for selecionado
  const handleMonthChange = async (monthYear: string) => {
    try {
      setSelectedMonth(monthYear);
      setShowMonthSelector(false);
      await loadBaseDadosData(monthYear, selectedBaseSindical);
    } catch (error) {
      console.error('Erro ao carregar dados do mês selecionado:', error);
    }
  };

  // Função para lidar com mudança de base sindical
  const handleBaseSindicalChange = async (baseSindical: string) => {
    console.log('🏢 Mudando base sindical para:', baseSindical);
    
    // Evitar mudança desnecessária se já é a mesma base
    if (baseSindical === selectedBaseSindical) {
      console.log('🏢 Base sindical já selecionada, ignorando mudança');
      setShowBaseSindicalSelector(false);
      return;
    }
    
    // Resetar refs para forçar recarregamento
    lastLoadedBaseSindicalRef.current = null;
    lastLoadedMonthRef.current = null;
    
    setSelectedBaseSindical(baseSindical);
    setShowBaseSindicalSelector(false);
    
    // Salvar no localStorage para persistência
    if (baseSindical) {
      localStorage.setItem('selectedBaseSindical', baseSindical);
    } else {
      localStorage.removeItem('selectedBaseSindical');
    }
    
    console.log('🏢 Base sindical alterada, dados serão recarregados automaticamente');
  };

  // Função para formatar o mês para exibição
  const formatMonthDisplay = (monthYear: string) => {
    const [month, year] = monthYear.split('/');
    const monthNames = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return `${monthNames[parseInt(month) - 1]} de ${year}`;
  };



  const formatCurrency = (value: number) => {
    // Verifica se o valor é válido (não é NaN, Infinity ou undefined)
    if (!value || isNaN(value) || !isFinite(value)) {
      return 'R$ 0,00';
    }
    
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };




  // Fechar seletor de mês quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showMonthSelector) {
        const target = event.target as HTMLElement;
        if (!target.closest('.month-selector')) {
          setShowMonthSelector(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMonthSelector]);



  // Função para calcular estatísticas por SE e Base Sindical
  const getSEStats = () => {
    if (!processedData) return [];
    
    // Procura pela coluna SE nos dados
    const seColumn = processedData.columns.find(col => 
      col.toLowerCase().includes('se') || 
      col.toLowerCase().includes('sindicato') || 
      col.toLowerCase().includes('entidade')
    );
    
    // Procura pela coluna BASE SINDICAL
    const baseSindicalColumn = processedData.columns.find(col => 
      col.toLowerCase().includes('base') && col.toLowerCase().includes('sindical') ||
      col.toLowerCase().includes('base') && col.toLowerCase().includes('sindicato') ||
      col.toLowerCase().includes('base')
    );
    
    // Procura pela coluna VALOR MENSALIDADE
    const mensalidadeColumn = processedData.columns.find(col => 
      col.toLowerCase().includes('valor') && col.toLowerCase().includes('mensalidade')
    );
    
    // Procura pela coluna FILIADOS
    const filiadosColumn = processedData.columns.find(col => 
      col.toLowerCase().includes('filiados') || 
      col.toLowerCase().includes('filiado') ||
      col.toLowerCase().includes('situacao')
    );
    
    if (!seColumn) {
      return [];
    }
    
    const seStats = processedData.employees.reduce((acc, emp) => {
      // Acessa o valor da coluna SE dinamicamente
      const seValue = (emp as any)[seColumn] || 'Não informado';
      
      // Acessa o valor da base sindical dinamicamente
      const baseSindicalValue = baseSindicalColumn ? (emp as any)[baseSindicalColumn] : '';
      const baseSindical = baseSindicalValue && String(baseSindicalValue).trim() !== '' ? String(baseSindicalValue) : 'Não informado';
      
      // Cria uma chave composta: SE + Base Sindical
      const key = `${seValue}|${baseSindical}`;
      
      // Acessa o valor da mensalidade dinamicamente
      const mensalidadeValue = mensalidadeColumn ? (emp as any)[mensalidadeColumn] : 0;
      const mensalidade = typeof mensalidadeValue === 'number' ? mensalidadeValue : 
                         typeof mensalidadeValue === 'string' ? parseFloat(mensalidadeValue.replace(/[^\d,.-]/g, '').replace(',', '.')) || 0 : 0;
      
      // Verifica se é filiado (tem valor na coluna filiados)
      const isFiliado = filiadosColumn ? (emp as any)[filiadosColumn] && 
                       String((emp as any)[filiadosColumn]).trim() !== '' && 
                       String((emp as any)[filiadosColumn]).toLowerCase() !== 'null' &&
                       String((emp as any)[filiadosColumn]).toLowerCase() !== 'undefined' &&
                       String((emp as any)[filiadosColumn]).toLowerCase() !== 'n/a' : false;
      
      if (!acc[key]) {
        acc[key] = {
          name: seValue,
          baseSindical: baseSindical,
          count: 0,
          totalMensalidade: 0,
          filiados: 0,
          naoFiliados: 0
        };
      }
      
      acc[key].count++;
      acc[key].totalMensalidade += mensalidade;
      
      if (isFiliado) {
        acc[key].filiados++;
      } else {
        acc[key].naoFiliados++;
      }
      
      return acc;
    }, {} as Record<string, { name: string; baseSindical: string; count: number; totalMensalidade: number; filiados: number; naoFiliados: number }>);
    
    // Retorna as estatísticas ordenadas por quantidade de efetivo (decrescente)
    return Object.values(seStats)
      .map(stat => ({
        ...stat,
        averageMensalidade: stat.filiados > 0 ? stat.totalMensalidade / stat.filiados : 0
      }))
      .sort((a, b) => b.count - a.count);
  };

  // Função para filtrar dados da tabela SE (Busca Rápida)
  const getFilteredSEStats = () => {
    if (!processedData || !seFilter.trim()) return getSEStats().slice(0, 5);
    
    const filterLower = seFilter.toLowerCase().trim();
    
    // Busca direta nos dados em memória (método rápido)
    const seColumn = processedData.columns.find(col => 
      col.toLowerCase().includes('se') || 
      col.toLowerCase().includes('sindicato') || 
      col.toLowerCase().includes('entidade')
    );
    
    const baseSindicalColumn = processedData.columns.find(col => 
      col.toLowerCase().includes('base') && col.toLowerCase().includes('sindical') ||
      col.toLowerCase().includes('base') && col.toLowerCase().includes('sindicato') ||
      col.toLowerCase().includes('base')
    );
    
    if (!seColumn && !baseSindicalColumn) return getSEStats().slice(0, 5);
    
    // Filtra diretamente nos dados
    const filteredData = processedData.employees.filter(emp => {
      const seValue = seColumn ? String((emp as any)[seColumn] || '').toLowerCase() : '';
      const baseValue = baseSindicalColumn ? String((emp as any)[baseSindicalColumn] || '').toLowerCase() : '';
      
      return seValue.includes(filterLower) || baseValue.includes(filterLower);
    });
    
    // Agrupa os dados filtrados rapidamente
    const seStats = new Map();
    
    filteredData.forEach(emp => {
      const seValue = seColumn ? (emp as any)[seColumn] || 'Não informado' : 'Não informado';
      const baseValue = baseSindicalColumn ? (emp as any)[baseSindicalColumn] || 'Não informado' : 'Não informado';
      const key = `${seValue}|${baseValue}`;
      
      if (!seStats.has(key)) {
        seStats.set(key, {
          name: seValue,
          baseSindical: baseValue,
          count: 0,
          totalMensalidade: 0,
          filiados: 0,
          naoFiliados: 0
        });
      }
      
      const stat = seStats.get(key);
      stat.count++;
      
      // Calcula mensalidade rapidamente
      const mensalidadeColumn = processedData.columns.find(col => 
        col.toLowerCase().includes('valor') && col.toLowerCase().includes('mensalidade')
      );
      
      if (mensalidadeColumn) {
        const mensalidadeValue = (emp as any)[mensalidadeColumn];
        if (mensalidadeValue !== null && mensalidadeValue !== undefined && mensalidadeValue !== '') {
          let valorNumerico = mensalidadeValue;
          if (typeof mensalidadeValue === 'string') {
            const valorLimpo = mensalidadeValue.replace(/[^\d,.-]/g, '').replace(',', '.');
            valorNumerico = parseFloat(valorLimpo);
          }
          
          if (valorNumerico && typeof valorNumerico === 'number' && !isNaN(valorNumerico)) {
            stat.totalMensalidade += valorNumerico;
          }
        }
      }
      
      // Verifica filiação rapidamente
      const filiadosColumn = processedData.columns.find(col => 
        col.toLowerCase().includes('filiados') || 
        col.toLowerCase().includes('filiado') ||
        col.toLowerCase().includes('situacao')
      );
      
      if (filiadosColumn) {
        const filiadoValue = (emp as any)[filiadosColumn];
        const isFiliado = filiadoValue && 
                         String(filiadoValue).trim() !== '' && 
                         String(filiadoValue).toLowerCase() !== 'null' &&
                         String(filiadoValue).toLowerCase() !== 'undefined' &&
                         String(filiadoValue).toLowerCase() !== 'n/a';
        
        if (isFiliado) {
          stat.filiados++;
        } else {
          stat.naoFiliados++;
        }
      }
    });
    
    return Array.from(seStats.values())
      .map(stat => ({
        ...stat,
        averageMensalidade: stat.filiados > 0 ? stat.totalMensalidade / stat.filiados : 0
      }))
      .sort((a, b) => b.count - a.count);
  };

  // Função para filtrar dados da tabela Municípios (Busca Rápida)
  const getFilteredMunicipalityStats = () => {
    if (!processedData || !municipalityFilter.trim()) return getMunicipalityStats().slice(0, 5);
    
    const filterLower = municipalityFilter.toLowerCase().trim();
    
    // Busca direta nos dados em memória (método rápido)
    const municipalityColumn = processedData.columns.find(col => 
      col.toLowerCase().includes('município') || 
      col.toLowerCase().includes('municipio') ||
      col.toLowerCase().includes('cidade') ||
      col.toLowerCase().includes('city') ||
      col.toLowerCase().includes('local') ||
      col.toLowerCase().includes('place')
    );
    
    if (!municipalityColumn) return getMunicipalityStats().slice(0, 5);
    
    // Filtra diretamente nos dados
    const filteredData = processedData.employees.filter(emp => {
      const municipalityValue = String((emp as any)[municipalityColumn] || '').toLowerCase();
      return municipalityValue.includes(filterLower);
    });
    
    // Agrupa os dados filtrados rapidamente
    const municipalityStats = new Map();
    
    filteredData.forEach(emp => {
      const municipalityValue = (emp as any)[municipalityColumn] || 'Não informado';
      
      if (!municipalityStats.has(municipalityValue)) {
        municipalityStats.set(municipalityValue, {
          name: municipalityValue,
          count: 0,
          totalMensalidade: 0,
          filiados: 0,
          naoFiliados: 0
        });
      }
      
      const stat = municipalityStats.get(municipalityValue);
      stat.count++;
      
      // Calcula mensalidade rapidamente
      const mensalidadeColumn = processedData.columns.find(col => 
        col.toLowerCase().includes('valor') && col.toLowerCase().includes('mensalidade')
      );
      
      if (mensalidadeColumn) {
        const mensalidadeValue = (emp as any)[mensalidadeColumn];
        if (mensalidadeValue !== null && mensalidadeValue !== undefined && mensalidadeValue !== '') {
          let valorNumerico = mensalidadeValue;
          if (typeof mensalidadeValue === 'string') {
            const valorLimpo = mensalidadeValue.replace(/[^\d,./-]/g, '').replace(',', '.');
            valorNumerico = parseFloat(valorLimpo);
          }
          
          if (valorNumerico && typeof valorNumerico === 'number' && !isNaN(valorNumerico)) {
            stat.totalMensalidade += valorNumerico;
          }
        }
      }
      
      // Verifica filiação rapidamente
      const filiadosColumn = processedData.columns.find(col => 
        col.toLowerCase().includes('filiados') || 
        col.toLowerCase().includes('filiado') ||
        col.toLowerCase().includes('situacao')
      );
      
      if (filiadosColumn) {
        const filiadoValue = (emp as any)[filiadosColumn];
        const isFiliado = filiadoValue && 
                         String(filiadoValue).trim() !== '' && 
                         String(filiadoValue).toLowerCase() !== 'null' &&
                         String(filiadoValue).toLowerCase() !== 'undefined' &&
                         String(filiadoValue).toLowerCase() !== 'n/a';
        
        if (isFiliado) {
          stat.filiados++;
        } else {
          stat.naoFiliados++;
        }
      }
        });
        
    return Array.from(municipalityStats.values())
      .map(stat => ({
        ...stat,
        averageMensalidade: stat.filiados > 0 ? stat.totalMensalidade / stat.filiados : 0
      }))
      .sort((a, b) => b.count - a.count);
  };






  const clearFilters = () => {
    setSeFilter('');
    setMunicipalityFilter('');
    setLocationFilter('');
  };

  const clearMunicipalityFilters = () => {
    setMunicipalityFilter('');
  };

  const clearLocationFilters = () => {
    setLocationFilter('');
  };

  // Função para calcular estatísticas por Municípios
  const getMunicipalityStats = () => {
    if (!processedData) return [];
    
    // Procura pela coluna de município/cidade nos dados
    const municipalityColumn = processedData.columns.find(col => 
      col.toLowerCase().includes('município') || 
      col.toLowerCase().includes('municipio') ||
      col.toLowerCase().includes('cidade') ||
      col.toLowerCase().includes('city') ||
      col.toLowerCase().includes('local') ||
      col.toLowerCase().includes('place')
    );
    
    // Procura pela coluna VALOR MENSALIDADE
    const mensalidadeColumn = processedData.columns.find(col => 
      col.toLowerCase().includes('valor') && col.toLowerCase().includes('mensalidade')
    );
    
    // Procura pela coluna FILIADOS
    const filiadosColumn = processedData.columns.find(col => 
      col.toLowerCase().includes('filiados') || 
      col.toLowerCase().includes('filiado') ||
      col.toLowerCase().includes('situacao')
    );
    
    if (!municipalityColumn) {
      return [];
    }
    
    const municipalityStats = processedData.employees.reduce((acc, emp) => {
      // Acessa o valor da coluna município dinamicamente
      const municipalityValue = (emp as any)[municipalityColumn] || 'Não informado';
      
      // Acessa o valor da mensalidade dinamicamente
      const mensalidadeValue = mensalidadeColumn ? (emp as any)[mensalidadeColumn] : 0;
      const mensalidade = typeof mensalidadeValue === 'number' ? mensalidadeValue : 
                         typeof mensalidadeValue === 'string' ? parseFloat(mensalidadeValue.replace(/[^\d,.-]/g, '').replace(',', '.')) || 0 : 0;
      
      // Verifica se é filiado (tem valor na coluna filiados)
      const isFiliado = filiadosColumn ? (emp as any)[filiadosColumn] && 
                       String((emp as any)[filiadosColumn]).trim() !== '' && 
                       String((emp as any)[filiadosColumn]).toLowerCase() !== 'null' &&
                       String((emp as any)[filiadosColumn]).toLowerCase() !== 'undefined' &&
                       String((emp as any)[filiadosColumn]).toLowerCase() !== 'n/a' : false;
      
      if (!acc[municipalityValue]) {
        acc[municipalityValue] = {
          name: municipalityValue,
          count: 0,
          totalMensalidade: 0,
          filiados: 0,
          naoFiliados: 0
        };
      }
      
      acc[municipalityValue].count++;
      acc[municipalityValue].totalMensalidade += mensalidade;
      
      if (isFiliado) {
        acc[municipalityValue].filiados++;
      } else {
        acc[municipalityValue].naoFiliados++;
      }
      
      return acc;
    }, {} as Record<string, { name: string; count: number; totalMensalidade: number; filiados: number; naoFiliados: number }>);
    
    // Retorna apenas as 10 cidades com maior número de empregados, ordenadas por count decrescente
    return Object.values(municipalityStats)
      .map(stat => ({
        ...stat,
        averageMensalidade: stat.filiados > 0 ? stat.totalMensalidade / stat.filiados : 0
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  };

  // Função para calcular estatísticas por Unidades de Lotação
  const getLocationStats = () => {
    if (!processedData) return [];
    
    // Procura pela coluna de lotação/localização nos dados
    const locationColumn = processedData.columns.find(col => 
      col.toLowerCase().includes('lotação') || 
      col.toLowerCase().includes('lotacao') ||
      col.toLowerCase().includes('localização') ||
      col.toLowerCase().includes('localizacao') ||
      col.toLowerCase().includes('location') ||
      col.toLowerCase().includes('unidade') ||
      col.toLowerCase().includes('unit') ||
      col.toLowerCase().includes('setor') ||
      col.toLowerCase().includes('sector')
    );
    
    // Procura pela coluna VALOR MENSALIDADE
    const mensalidadeColumn = processedData.columns.find(col => 
      col.toLowerCase().includes('valor') && col.toLowerCase().includes('mensalidade')
    );
    
    // Procura pela coluna FILIADOS
    const filiadosColumn = processedData.columns.find(col => 
      col.toLowerCase().includes('filiados') || 
      col.toLowerCase().includes('filiado') ||
      col.toLowerCase().includes('situacao')
    );
    
    if (!locationColumn) {
      return [];
    }
    
    const locationStats = processedData.employees.reduce((acc, emp) => {
      // Acessa o valor da coluna lotação dinamicamente
      const locationValue = (emp as any)[locationColumn] || 'Não informado';
      
      // Acessa o valor da mensalidade dinamicamente
      const mensalidadeValue = mensalidadeColumn ? (emp as any)[mensalidadeColumn] : 0;
      const mensalidade = typeof mensalidadeValue === 'number' ? mensalidadeValue : 
                         typeof mensalidadeValue === 'string' ? parseFloat(mensalidadeValue.replace(/[^\d,.-]/g, '').replace(',', '.')) || 0 : 0;
      
      // Verifica se é filiado (tem valor na coluna filiados)
      const isFiliado = filiadosColumn ? (emp as any)[filiadosColumn] && 
                       String((emp as any)[filiadosColumn]).trim() !== '' && 
                       String((emp as any)[filiadosColumn]).toLowerCase() !== 'null' &&
                       String((emp as any)[filiadosColumn]).toLowerCase() !== 'undefined' &&
                       String((emp as any)[filiadosColumn]).toLowerCase() !== 'n/a' : false;
      
      if (!acc[locationValue]) {
        acc[locationValue] = {
          name: locationValue,
          count: 0,
          totalMensalidade: 0,
          filiados: 0,
          naoFiliados: 0
        };
      }
      
      acc[locationValue].count++;
      acc[locationValue].totalMensalidade += mensalidade;
      
      if (isFiliado) {
        acc[locationValue].filiados++;
      } else {
        acc[locationValue].naoFiliados++;
      }
      
      return acc;
    }, {} as Record<string, { name: string; count: number; totalMensalidade: number; filiados: number; naoFiliados: number }>);
    
    // Retorna apenas as 10 unidades com maior número de empregados, ordenadas por count decrescente
    return Object.values(locationStats)
      .map(stat => ({
        ...stat,
        averageMensalidade: stat.filiados > 0 ? stat.totalMensalidade / stat.filiados : 0
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  };

  // Função para filtrar dados da tabela Unidades de Lotação (Busca Rápida)
  const getFilteredLocationStats = () => {
    if (!processedData || !locationFilter.trim()) return getLocationStats().slice(0, 5);
    
    const filterLower = locationFilter.toLowerCase().trim();
    
    // Busca direta nos dados em memória (método rápido)
    const locationColumn = processedData.columns.find(col => 
      col.toLowerCase().includes('lotação') || 
      col.toLowerCase().includes('lotacao') ||
      col.toLowerCase().includes('localização') ||
      col.toLowerCase().includes('localizacao') ||
      col.toLowerCase().includes('location') ||
      col.toLowerCase().includes('unidade') ||
      col.toLowerCase().includes('unit') ||
      col.toLowerCase().includes('setor') ||
      col.toLowerCase().includes('sector')
    );
    
    if (!locationColumn) return getLocationStats().slice(0, 5);
    
    // Filtra diretamente nos dados
    const filteredData = processedData.employees.filter(emp => {
      const locationValue = String((emp as any)[locationColumn] || '').toLowerCase();
      return locationValue.includes(filterLower);
    });
    
    // Agrupa os dados filtrados rapidamente
    const locationStats = new Map();
    
    filteredData.forEach(emp => {
      const locationValue = (emp as any)[locationColumn] || 'Não informado';
      
      if (!locationStats.has(locationValue)) {
        locationStats.set(locationValue, {
          name: locationValue,
          count: 0,
          totalMensalidade: 0,
          filiados: 0,
          naoFiliados: 0
        });
      }
      
      const stat = locationStats.get(locationValue);
      stat.count++;
      
      // Calcula mensalidade rapidamente
      const mensalidadeColumn = processedData.columns.find(col => 
        col.toLowerCase().includes('valor') && col.toLowerCase().includes('mensalidade')
      );
      
      if (mensalidadeColumn) {
        const mensalidadeValue = (emp as any)[mensalidadeColumn];
        if (mensalidadeValue !== null && mensalidadeValue !== undefined && mensalidadeValue !== '') {
          let valorNumerico = mensalidadeValue;
          if (typeof mensalidadeValue === 'string') {
            const valorLimpo = mensalidadeValue.replace(/[^\d,./-]/g, '').replace(',', '.');
            valorNumerico = parseFloat(valorLimpo);
          }
          
          if (valorNumerico && typeof valorNumerico === 'number' && !isNaN(valorNumerico)) {
            stat.totalMensalidade += valorNumerico;
          }
        }
      }
      
      // Verifica filiação rapidamente
      const filiadosColumn = processedData.columns.find(col => 
        col.toLowerCase().includes('filiados') || 
        col.toLowerCase().includes('filiado') ||
        col.toLowerCase().includes('situacao')
      );
      
      if (filiadosColumn) {
        const filiadoValue = (emp as any)[filiadosColumn];
        const isFiliado = filiadoValue && 
                         String(filiadoValue).trim() !== '' && 
                         String(filiadoValue).toLowerCase() !== 'null' &&
                         String(filiadoValue).toLowerCase() !== 'undefined' &&
                         String(filiadoValue).toLowerCase() !== 'n/a';
        
        if (isFiliado) {
          stat.filiados++;
        } else {
          stat.naoFiliados++;
        }
      }
    });
    
    return Array.from(locationStats.values())
      .map(stat => ({
        ...stat,
        averageMensalidade: stat.filiados > 0 ? stat.totalMensalidade / stat.filiados : 0
      }))
      .sort((a, b) => b.count - a.count);
  };

  // Função para calcular faixas salariais


  // Função para calcular estatísticas por gênero
  const getGenderStats = () => {
    if (!processedData) return [];
    
    // Procura pela coluna SEXO
    const genderColumn = processedData.columns.find(col => 
      col.toLowerCase().includes('sexo') || 
      col.toLowerCase().includes('genero') ||
      col.toLowerCase().includes('gênero') ||
      col.toLowerCase().includes('gender')
    );
    
    if (!genderColumn) {
      return [];
    }
    
    const genderCounts = new Map<string, number>();
    
    processedData.employees.forEach(emp => {
      const gender = (emp as any)[genderColumn];
      if (gender && gender !== '' && gender !== null && gender !== undefined) {
        const genderStr = gender.toString().trim().toUpperCase();
        if (genderStr === 'F' || genderStr === 'M') {
          const genderLabel = genderStr === 'F' ? 'Feminino' : 'Masculino';
          genderCounts.set(genderLabel, (genderCounts.get(genderLabel) || 0) + 1);
        }
      }
    });
    
    // Converte para array e ordena por quantidade
    return Array.from(genderCounts.entries())
      .map(([gender, count]) => ({ gender, count }))
      .sort((a, b) => b.count - a.count);
  };

  // Função para calcular estatísticas por raça
  const getRaceStats = () => {
    if (!processedData) return [];
    
    // Procura pela coluna RAÇA (com variações de acentuação e maiúsculas)
    const raceColumn = processedData.columns.find(col => 
      col.toLowerCase().includes('raça') || 
      col.toLowerCase().includes('raca') || 
      col.toLowerCase().includes('race') ||
      col.toLowerCase().includes('cor') ||
      col.toLowerCase().includes('etnia')
    );
    
    if (!raceColumn) {
      return [];
    }
    
    const raceCounts = new Map<string, number>();
    
    processedData.employees.forEach(emp => {
      const race = (emp as any)[raceColumn];
      if (race && race !== '' && race !== null && race !== undefined) {
        const raceStr = race.toString().trim();
        if (raceStr) {
          raceCounts.set(raceStr, (raceCounts.get(raceStr) || 0) + 1);
        }
      }
    });
    
    // Converte para array e ordena por quantidade
    return Array.from(raceCounts.entries())
      .map(([race, count]) => ({ race, count }))
      .sort((a, b) => b.count - a.count);
  };

  // Função para calcular estatísticas de filiados e não filiados
  const getFiliadosStats = () => {
    if (!processedData) return { filiados: 0, naoFiliados: 0, total: 0 };
    
    // Procura pela coluna FILIADO nos dados
    const filiadoColumn = processedData.columns.find(col => 
      col.toLowerCase().includes('filiado') ||
      col.toLowerCase().includes('filiados') ||
      col.toLowerCase().includes('situacao') ||
      col.toLowerCase().includes('situação')
    );
    
    if (!filiadoColumn) {
      return { filiados: 0, naoFiliados: 0, total: processedData.employees.length };
    }
    
    const stats = processedData.employees.reduce((acc, emp) => {
      const filiadoValue = (emp as any)[filiadoColumn];
      
      // Verifica se é filiado (tem valor na coluna filiado)
      // Filiado = tem algum valor na coluna
      // Não Filiado = não tem valor (vazio, nulo, undefined) ou é "N/A"
      const isFiliado = filiadoValue && 
                       String(filiadoValue).trim() !== '' && 
                       String(filiadoValue).toLowerCase() !== 'null' &&
                       String(filiadoValue).toLowerCase() !== 'undefined' &&
                       String(filiadoValue).toLowerCase() !== 'n/a';
      
      if (isFiliado) {
        acc.filiados++;
      } else {
        acc.naoFiliados++;
      }
      
      return acc;
    }, { filiados: 0, naoFiliados: 0 });
    
    return {
      ...stats,
      total: stats.filiados + stats.naoFiliados
    };
  };

  // Função para calcular valor total de mensalidade (versão segura)
  const getMensalidadeStats = () => {
    if (!processedData) return { total: 0, average: 0, count: 0, referenceMonth: '' };
    
    // Procura pela coluna VALOR MENSALIDADE
    const mensalidadeColumn = processedData.columns.find(col => 
      col.toLowerCase().includes('valor') && col.toLowerCase().includes('mensalidade')
    );
    
    // Procura pela coluna MÊS
    const mesColumn = processedData.columns.find(col => 
      col.toLowerCase().includes('mês') || 
      col.toLowerCase().includes('mes') || 
      col.toLowerCase().includes('month')
    );
    
    if (!mensalidadeColumn) {
      return { total: 0, average: 0, count: 0, referenceMonth: '' };
    }
    
    let total = 0;
    let count = 0;
    let referenceMonth = '';
    
    // Extrai o mês de referência do primeiro registro válido
    if (mesColumn) {
      for (const emp of processedData.employees) {
        const mes = (emp as any)[mesColumn];
        if (mes && mes !== '' && mes !== null && mes !== undefined) {
          // Converte formato AAAAMM para MM/AAAA
          if (typeof mes === 'string' && mes.length === 6) {
            const ano = mes.substring(0, 4);
            const mesNum = mes.substring(4, 6);
            if (!isNaN(Number(ano)) && !isNaN(Number(mesNum))) {
              referenceMonth = `${mesNum}/${ano}`;
              break;
            }
          } else if (typeof mes === 'number' && mes.toString().length === 6) {
            const mesStr = mes.toString();
            const ano = mesStr.substring(0, 4);
            const mesNum = mesStr.substring(4, 6);
            if (!isNaN(Number(ano)) && !isNaN(Number(mesNum))) {
              referenceMonth = `${mesNum}/${ano}`;
              break;
            }
          }
        }
      }
    }
    
    processedData.employees.forEach(emp => {
      const valor = (emp as any)[mensalidadeColumn];
      if (valor !== null && valor !== undefined && valor !== '') {
        let valorNumerico = valor;
        if (typeof valor === 'string') {
          const valorLimpo = valor.replace(/[^\d,.-]/g, '').replace(',', '.');
          valorNumerico = parseFloat(valorLimpo);
        }
        
        if (valorNumerico && typeof valorNumerico === 'number' && !isNaN(valorNumerico)) {
          total += valorNumerico;
          count++;
        }
      }
    });
    
    return {
      total,
      average: count > 0 ? total / count : 0,
      count,
      referenceMonth
    };
  };

  // Função para calcular estatísticas de contribuição mínima, máxima e média
  const getContribuicaoMinMaxStats = () => {
    if (!processedData) return { min: 0, max: 0, average: 0, count: 0 };
    
    // Procura pela coluna VALOR MENSALIDADE
    const mensalidadeColumn = processedData.columns.find(col => 
      col.toLowerCase().includes('valor') && col.toLowerCase().includes('mensalidade')
    );
    
    if (!mensalidadeColumn) {
      return { min: 0, max: 0, average: 0, count: 0 };
    }
    
    let min = Infinity;
    let max = -Infinity;
    let total = 0;
    let count = 0;
    
    processedData.employees.forEach(emp => {
      const valor = (emp as any)[mensalidadeColumn];
      if (valor !== null && valor !== undefined && valor !== '') {
        let valorNumerico = valor;
        if (typeof valor === 'string') {
          const valorLimpo = valor.replace(/[^\d,.-]/g, '').replace(',', '.');
          valorNumerico = parseFloat(valorLimpo);
        }
        
        if (valorNumerico && typeof valorNumerico === 'number' && !isNaN(valorNumerico)) {
          if (valorNumerico < min) min = valorNumerico;
          if (valorNumerico > max) max = valorNumerico;
          total += valorNumerico;
          count++;
        }
      }
    });
    
    return {
      min: min === Infinity ? 0 : min,
      max: max === -Infinity ? 0 : max,
      average: count > 0 ? total / count : 0,
      count
    };
  };

  // Função para calcular estatísticas por estado
  const getStateStats = () => {
    if (!processedData) return [];
    
    const stateStats = processedData.employees.reduce((acc, emp) => {
      if (!emp.state) return acc;
      
      if (!acc[emp.state]) {
        acc[emp.state] = {
          name: emp.state,
          count: 0,
          totalSalary: 0,
          cities: new Set()
        };
      }
      
      acc[emp.state].count++;
      acc[emp.state].totalSalary += emp.salary || 0;
      if (emp.city) {
        acc[emp.state].cities.add(emp.city);
      }
      
      return acc;
    }, {} as Record<string, { name: string; count: number; totalSalary: number; cities: Set<string> }>);
    
    return Object.values(stateStats)
      .map(stat => ({
        ...stat,
        averageSalary: stat.totalSalary / stat.count,
        cityCount: stat.cities.size,
        percentage: processedData.summary.validRecords > 0 ? (stat.count / processedData.summary.validRecords) * 100 : 0
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  };

  // Função para calcular estatísticas por tempo de filiação
  const getMembershipTimeStats = () => {
    if (!processedData) return [];
    
    const now = new Date();
    const ranges = [
      { min: 0, max: 1, label: 'Menos de 1 ano' },
      { min: 1, max: 3, label: '1-3 anos' },
      { min: 3, max: 5, label: '3-5 anos' },
      { min: 5, max: 10, label: '5-10 anos' },
      { min: 10, max: 20, label: '10-20 anos' },
      { min: 20, max: Infinity, label: 'Mais de 20 anos' }
    ];
    
    const membershipStats = ranges.map(range => {
      const count = processedData.employees.filter(emp => {
        if (!emp.unionMemberSince) return false;
        
        const memberDate = new Date(emp.unionMemberSince);
        const yearsDiff = (now.getTime() - memberDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
        
        return yearsDiff >= range.min && yearsDiff < range.max;
      }).length;
      
      return {
        range: range.label,
        count,
        percentage: processedData.summary.validRecords > 0 ? (count / processedData.summary.validRecords) * 100 : 0
      };
    }).filter(stat => stat.count > 0);
    
    return membershipStats;
  };



  // Função para calcular estatísticas por faixa etária (baseada na data de admissão)
  const getAgeGroupStats = () => {
    if (!processedData) return [];
    
    const ageGroups = [
      { range: '18-25 anos', min: 18, max: 25 },
      { range: '26-35 anos', min: 26, max: 35 },
      { range: '36-45 anos', min: 36, max: 45 },
      { range: '46-55 anos', min: 46, max: 55 },
      { range: '56-65 anos', min: 56, max: 65 },
      { range: 'Acima de 65 anos', min: 66, max: 999 }
    ];
    
    const stats = ageGroups.map(group => {
      const count = processedData.employees.filter(emp => {
        if (!emp.admissionDate) return false;
        const admissionYear = new Date(emp.admissionDate).getFullYear();
        const currentYear = new Date().getFullYear();
        const age = currentYear - admissionYear;
        return age >= group.min && age <= group.max;
      }).length;
      
      return {
        range: group.range,
        count,
        percentage: processedData.summary.validRecords > 0 ? (count / processedData.summary.validRecords) * 100 : 0
      };
    }).filter(stat => stat.count > 0);
    
    return stats.sort((a, b) => b.count - a.count);
  };

  // Função para calcular estatísticas por CARGO
  const getCargoStats = () => {
    if (!processedData) return [];
    
    const cargoColumn = processedData.columns.find(col => 
      col.toLowerCase().includes('cargo') && 
      !col.toLowerCase().includes('especialidade') && 
      !col.toLowerCase().includes('nível')
    );
    
    // Procurar pela coluna de filiados
    const filiadosColumn = processedData.columns.find(col => 
      col.toLowerCase().includes('filiado') || 
      col.toLowerCase().includes('filiacao')
    );
    
    if (!cargoColumn) return [];
    
    const cargoStats = processedData.employees.reduce((acc, emp) => {
      const cargo = emp[cargoColumn as keyof typeof emp] as string;
      if (!cargo) return acc;
      
      // Verifica se é filiado (tem valor na coluna filiados)
      const isFiliado = filiadosColumn ? (emp as any)[filiadosColumn] && 
                       String((emp as any)[filiadosColumn]).trim() !== '' && 
                       String((emp as any)[filiadosColumn]).toLowerCase() !== 'null' &&
                       String((emp as any)[filiadosColumn]).toLowerCase() !== 'undefined' &&
                       String((emp as any)[filiadosColumn]).toLowerCase() !== 'n/a' : false;
      
      if (!acc[cargo]) {
        acc[cargo] = { 
          name: cargo, 
          count: 0, 
          filiados: 0, 
          naoFiliados: 0 
        };
      }
      
      acc[cargo].count++;
      
      if (isFiliado) {
        acc[cargo].filiados++;
      } else {
        acc[cargo].naoFiliados++;
      }
      
      return acc;
    }, {} as Record<string, { name: string; count: number; filiados: number; naoFiliados: number }>);
    
    return Object.values(cargoStats)
      .map(stat => ({
        ...stat,
        percentage: processedData.summary.validRecords > 0 ? (stat.count / processedData.summary.validRecords) * 100 : 0,
        percentualFiliados: stat.count > 0 ? (stat.filiados / stat.count) * 100 : 0,
        percentualNaoFiliados: stat.count > 0 ? (stat.naoFiliados / stat.count) * 100 : 0
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Top 5
  };

  // Função para calcular estatísticas por CARGO ESPECIALIDADE
  const getCargoEspecialidadeStats = () => {
    if (!processedData) return [];
    
    const especialidadeColumn = processedData.columns.find(col => 
      col.toLowerCase().includes('especialidade')
    );
    
    if (!especialidadeColumn) return [];
    
    const especialidadeStats = processedData.employees.reduce((acc, emp) => {
      const especialidade = emp[especialidadeColumn as keyof typeof emp] as string;
      if (!especialidade) return acc;
      
      if (!acc[especialidade]) {
        acc[especialidade] = { name: especialidade, count: 0 };
      }
      acc[especialidade].count++;
      return acc;
    }, {} as Record<string, { name: string; count: number }>);
    
    return Object.values(especialidadeStats)
      .map(stat => ({
        ...stat,
        percentage: processedData.summary.validRecords > 0 ? (stat.count / processedData.summary.validRecords) * 100 : 0
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Top 5
  };

  // Função para calcular estatísticas por CARGO NÍVEL
  const getCargoNivelStats = () => {
    if (!processedData) return [];
    
    const nivelColumn = processedData.columns.find(col => 
      col.toLowerCase().includes('nível') || col.toLowerCase().includes('nivel')
    );
    
    // Procurar pela coluna de filiados
    const filiadosColumn = processedData.columns.find(col => 
      col.toLowerCase().includes('filiado') || 
      col.toLowerCase().includes('filiacao')
    );
    
    if (!nivelColumn) return [];
    
    const nivelStats = processedData.employees.reduce((acc, emp) => {
      const nivel = emp[nivelColumn as keyof typeof emp] as string;
      if (!nivel) return acc;
      
      // Verifica se é filiado (tem valor na coluna filiados)
      const isFiliado = filiadosColumn ? (emp as any)[filiadosColumn] && 
                       String((emp as any)[filiadosColumn]).trim() !== '' && 
                       String((emp as any)[filiadosColumn]).toLowerCase() !== 'null' &&
                       String((emp as any)[filiadosColumn]).toLowerCase() !== 'undefined' &&
                       String((emp as any)[filiadosColumn]).toLowerCase() !== 'n/a' : false;
      
      if (!acc[nivel]) {
        acc[nivel] = { 
          name: nivel, 
          count: 0, 
          filiados: 0, 
          naoFiliados: 0 
        };
      }
      
      acc[nivel].count++;
      
      if (isFiliado) {
        acc[nivel].filiados++;
      } else {
        acc[nivel].naoFiliados++;
      }
      
      return acc;
    }, {} as Record<string, { name: string; count: number; filiados: number; naoFiliados: number }>);
    
    return Object.values(nivelStats)
      .map(stat => ({
        ...stat,
        percentage: processedData.summary.validRecords > 0 ? (stat.count / processedData.summary.validRecords) * 100 : 0,
        percentualFiliados: stat.count > 0 ? (stat.filiados / stat.count) * 100 : 0,
        percentualNaoFiliados: stat.count > 0 ? (stat.naoFiliados / stat.count) * 100 : 0
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Top 5
  };

  // Função para calcular estatísticas por FUNÇÃO
  const getFuncaoStats = () => {
    if (!processedData) return [];
    
    const funcaoColumn = processedData.columns.find(col => 
      col.toLowerCase().includes('função') || col.toLowerCase().includes('funcao')
    );
    
    // Procurar pela coluna de filiados
    const filiadosColumn = processedData.columns.find(col => 
      col.toLowerCase().includes('filiado') || 
      col.toLowerCase().includes('filiacao')
    );
    
    if (!funcaoColumn) return [];
    
    const funcaoStats = processedData.employees.reduce((acc, emp) => {
      const funcao = emp[funcaoColumn as keyof typeof emp] as string;
      
      // Tratar valores NULL, undefined, vazios e strings "null"
      if (!funcao || 
          funcao === '' || 
          funcao === null || 
          funcao === undefined || 
          String(funcao).toLowerCase() === 'null' ||
          String(funcao).toLowerCase() === 'undefined' ||
          String(funcao).trim() === '') {
        return acc;
      }
      
      const funcaoClean = String(funcao).trim();
      
      // Verifica se é filiado (tem valor na coluna filiados)
      const isFiliado = filiadosColumn ? (emp as any)[filiadosColumn] && 
                       String((emp as any)[filiadosColumn]).trim() !== '' && 
                       String((emp as any)[filiadosColumn]).toLowerCase() !== 'null' &&
                       String((emp as any)[filiadosColumn]).toLowerCase() !== 'undefined' &&
                       String((emp as any)[filiadosColumn]).toLowerCase() !== 'n/a' : false;
      
      if (!acc[funcaoClean]) {
        acc[funcaoClean] = { 
          name: funcaoClean, 
          count: 0, 
          filiados: 0, 
          naoFiliados: 0 
        };
      }
      
      acc[funcaoClean].count++;
      
      if (isFiliado) {
        acc[funcaoClean].filiados++;
      } else {
        acc[funcaoClean].naoFiliados++;
      }
      
      return acc;
    }, {} as Record<string, { name: string; count: number; filiados: number; naoFiliados: number }>);
    
    // Calcular o total de empregados com função válida (não nula/vazia)
    const totalComFuncao = Object.values(funcaoStats).reduce((sum, stat) => sum + stat.count, 0);
    
    return Object.values(funcaoStats)
      .map(stat => ({
        ...stat,
        percentage: totalComFuncao > 0 ? (stat.count / totalComFuncao) * 100 : 0,
        percentualFiliados: stat.count > 0 ? (stat.filiados / stat.count) * 100 : 0,
        percentualNaoFiliados: stat.count > 0 ? (stat.naoFiliados / stat.count) * 100 : 0
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Top 5
  };

  // Função para calcular estatísticas por JORNADA DE TRABALHO
  const getJornadaStats = () => {
    if (!processedData) return [];
    
    const jornadaColumn = processedData.columns.find(col => 
      col.toLowerCase().includes('jornada') || 
      col.toLowerCase().includes('horário') || 
      col.toLowerCase().includes('horario') ||
      col.toLowerCase().includes('turno')
    );
    
    if (!jornadaColumn) return [];
    
    const jornadaStats = processedData.employees.reduce((acc, emp) => {
      const jornada = emp[jornadaColumn as keyof typeof emp] as string;
      
      // Tratar valores NULL, undefined, vazios e strings "null"
      if (!jornada || 
          jornada === '' || 
          jornada === null || 
          jornada === undefined || 
          String(jornada).toLowerCase() === 'null' ||
          String(jornada).toLowerCase() === 'undefined' ||
          String(jornada).trim() === '') {
        return acc;
      }
      
      const jornadaClean = String(jornada).trim();
      
      if (!acc[jornadaClean]) {
        acc[jornadaClean] = { name: jornadaClean, count: 0 };
      }
      acc[jornadaClean].count++;
      return acc;
    }, {} as Record<string, { name: string; count: number }>);
    
    return Object.values(jornadaStats)
      .map(stat => ({
        ...stat,
        percentage: processedData.summary.validRecords > 0 ? (stat.count / processedData.summary.validRecords) * 100 : 0
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Top 5
  };

  // Função para calcular estatísticas por TIPO DE DEFICIÊNCIA
  const getDeficiencyStats = () => {
    if (!processedData) return [];
    
    // Procura pela coluna TIPO DEFICIÊNCIA nos dados
    const deficiencyColumn = processedData.columns.find(col => 
      col.toLowerCase().includes('tipo') && 
      (col.toLowerCase().includes('deficiência') || col.toLowerCase().includes('deficiencia') || col.toLowerCase().includes('defici') || col.toLowerCase().includes('pcd'))
    );
    
    if (!deficiencyColumn) return [];
    
    const deficiencyStats = processedData.employees.reduce((acc, emp) => {
      const deficiency = (emp as any)[deficiencyColumn];
      
      // Tratar valores NULL, undefined, vazios e strings "null"
      if (!deficiency || 
          deficiency === '' || 
          deficiency === null || 
          deficiency === undefined || 
          String(deficiency).toLowerCase() === 'null' ||
          String(deficiency).toLowerCase() === 'undefined' ||
          String(deficiency).trim() === '') {
        // Categoriza como "Sem Deficiência" se não houver informação
        if (!acc['Sem Deficiência']) {
          acc['Sem Deficiência'] = { name: 'Sem Deficiência', count: 0, color: '#e5e7eb' };
        }
        acc['Sem Deficiência'].count++;
        return acc;
      }
      
      // Normaliza o valor da deficiência
      let normalizedDeficiency = String(deficiency).trim();
      
      // Mapeia variações comuns para categorias padronizadas
      const deficiencyMapping: Record<string, string> = {
        'física': 'Física',
        'fisica': 'Física',
        'visual': 'Visual',
        'auditiva': 'Auditiva',
        'intelectual': 'Intelectual',
        'mental': 'Mental',
        'psicossocial': 'Psicossocial',
        'múltipla': 'Múltipla',
        'multiple': 'Múltipla',
        'múltiplas': 'Múltipla',
        'multiplas': 'Múltipla',
        'outras': 'Outras',
        'outra': 'Outras',
        'não informado': 'Não Informado',
        'nao informado': 'Não Informado',
        'n/a': 'Não Informado',
        'n/a.': 'Não Informado'
      };
      
      // Aplica o mapeamento se existir
      for (const [key, value] of Object.entries(deficiencyMapping)) {
        if (normalizedDeficiency.toLowerCase().includes(key.toLowerCase())) {
          normalizedDeficiency = value;
          break;
        }
      }
      
      // Se não foi mapeado, mantém o valor original
      if (!acc[normalizedDeficiency]) {
        // Define cores específicas para cada tipo de deficiência
        const colors: Record<string, string> = {
          'Física': '#3b82f6',
          'Visual': '#8b5cf6',
          'Auditiva': '#06b6d4',
          'Intelectual': '#10b981',
          'Mental': '#f59e0b',
          'Psicossocial': '#ef4444',
          'Múltipla': '#ec4899',
          'Outras': '#6b7280',
          'Não Informado': '#9ca3af',
          'Sem Deficiência': '#e5e7eb'
        };
        
        acc[normalizedDeficiency] = { 
          name: normalizedDeficiency, 
          count: 0, 
          color: colors[normalizedDeficiency] || '#6b7280' 
        };
      }
      
      acc[normalizedDeficiency].count++;
      return acc;
    }, {} as Record<string, { name: string; count: number; color: string }>);
    
    return Object.values(deficiencyStats)
      .map(stat => ({
        ...stat,
        percentage: processedData.summary.validRecords > 0 ? (stat.count / processedData.summary.validRecords) * 100 : 0
      }))
      .sort((a, b) => b.count - a.count);
  };

  // Função para calcular estatísticas por MOTIVO DE AFASTAMENTO
  const getMotivoAfastamentoStats = () => {
    if (!processedData) return [];
    
    // Procura pela coluna MOTIVO AFASTAMENTO nos dados
    const motivoAfastamentoColumn = processedData.columns.find(col => 
      col.toLowerCase().includes('motivo') && 
      (col.toLowerCase().includes('afastamento') || col.toLowerCase().includes('afast') || col.toLowerCase().includes('ausência') || col.toLowerCase().includes('ausencia'))
    );
    
    // Procura pela coluna FILIADOS
    const filiadosColumn = processedData.columns.find(col => 
      col.toLowerCase().includes('filiados') || 
      col.toLowerCase().includes('filiado') ||
      col.toLowerCase().includes('situacao')
    );
    
    if (!motivoAfastamentoColumn) return [];
    
    const motivoAfastamentoStats = processedData.employees.reduce((acc, emp) => {
      const motivo = (emp as any)[motivoAfastamentoColumn];
      
      // Tratar valores NULL, undefined, vazios e strings "null"
      if (!motivo || 
          motivo === '' || 
          motivo === null || 
          motivo === undefined || 
          String(motivo).toLowerCase() === 'null' ||
          String(motivo).toLowerCase() === 'undefined' ||
          String(motivo).trim() === '') {
        // Categoriza como "Sem Afastamento" se não houver informação
        if (!acc['Sem Afastamento']) {
          acc['Sem Afastamento'] = { 
            name: 'Sem Afastamento', 
            count: 0, 
            color: '#10b981',
            icon: '✅',
            category: 'Ativo',
            filiados: 0,
            naoFiliados: 0
          };
        }
        acc['Sem Afastamento'].count++;
        
        // Verifica se é filiado
        const isFiliado = filiadosColumn ? (emp as any)[filiadosColumn] && 
                         String((emp as any)[filiadosColumn]).trim() !== '' && 
                         String((emp as any)[filiadosColumn]).toLowerCase() !== 'null' &&
                         String((emp as any)[filiadosColumn]).toLowerCase() !== 'undefined' &&
                         String((emp as any)[filiadosColumn]).toLowerCase() !== 'n/a' : false;
        
        if (isFiliado) {
          acc['Sem Afastamento'].filiados++;
        } else {
          acc['Sem Afastamento'].naoFiliados++;
        }
        
        return acc;
      }
      
      // Normaliza o valor do motivo
      let normalizedMotivo = motivo.toString().trim();
      
      // Mapeia variações comuns para categorias padronizadas
      const motivoMapping: Record<string, { name: string; category: string; icon: string; color: string }> = {
        'doença': { name: 'Doença', category: 'Saúde', icon: '🏥', color: '#ef4444' },
        'doenca': { name: 'Doença', category: 'Saúde', icon: '🏥', color: '#ef4444' },
        'acidente': { name: 'Acidente', category: 'Acidente', icon: '🚨', color: '#dc2626' },
        'acidente trabalho': { name: 'Acidente de Trabalho', category: 'Acidente', icon: '🚨', color: '#dc2626' },
        'maternidade': { name: 'Maternidade', category: 'Familiar', icon: '👶', color: '#ec4899' },
        'paternidade': { name: 'Paternidade', category: 'Familiar', icon: '👨‍👩‍👧‍👦', color: '#ec4899' },
        'licença': { name: 'Licença', category: 'Administrativa', icon: '📋', color: '#8b5cf6' },
        'férias': { name: 'Férias', category: 'Administrativa', icon: '🏖️', color: '#8b5cf6' },
        'ferias': { name: 'Férias', category: 'Administrativa', icon: '🏖️', color: '#8b5cf6' },
        'suspensão': { name: 'Suspensão', category: 'Disciplinar', icon: '⚠️', color: '#f59e0b' },
        'suspensao': { name: 'Suspensão', category: 'Disciplinar', icon: '⚠️', color: '#f59e0b' },
        'demissão': { name: 'Demissão', category: 'Desligamento', icon: '🚪', color: '#6b7280' },
        'demissao': { name: 'Demissão', category: 'Desligamento', icon: '🚪', color: '#6b7280' },
        'aposentadoria': { name: 'Aposentadoria', category: 'Desligamento', icon: '👴', color: '#6b7280' },
        'falecimento': { name: 'Falecimento', category: 'Desligamento', icon: '🕊️', color: '#6b7280' },
        'outros': { name: 'Outros Motivos', category: 'Diversos', icon: '❓', color: '#9ca3af' },
        'outro': { name: 'Outros Motivos', category: 'Diversos', icon: '❓', color: '#9ca3af' },
        'não informado': { name: 'Não Informado', category: 'Diversos', icon: '❓', color: '#9ca3af' },
        'nao informado': { name: 'Não Informado', category: 'Diversos', icon: '❓', color: '#9ca3af' },
        'n/a': { name: 'Não Informado', category: 'Diversos', icon: '❓', color: '#9ca3af' }
      };
      
      // Aplica o mapeamento se existir
      let mappedMotivo = null;
      for (const [key, value] of Object.entries(motivoMapping)) {
        if (normalizedMotivo.toLowerCase().includes(key.toLowerCase())) {
          mappedMotivo = value;
          break;
        }
      }
      
      // Se não foi mapeado, cria uma entrada genérica
      if (!mappedMotivo) {
        mappedMotivo = {
          name: normalizedMotivo,
          category: 'Diversos',
          icon: '📝',
          color: '#6b7280'
        };
      }
      
      // Cria ou atualiza a entrada no acumulador
      if (!acc[mappedMotivo.name]) {
        acc[mappedMotivo.name] = {
          name: mappedMotivo.name,
          count: 0,
          color: mappedMotivo.color,
          icon: mappedMotivo.icon,
          category: mappedMotivo.category,
          filiados: 0,
          naoFiliados: 0
        };
      }
      
      acc[mappedMotivo.name].count++;
      
      // Verifica se é filiado
      const isFiliado = filiadosColumn ? (emp as any)[filiadosColumn] && 
                       String((emp as any)[filiadosColumn]).trim() !== '' && 
                       String((emp as any)[filiadosColumn]).toLowerCase() !== 'null' &&
                       String((emp as any)[filiadosColumn]).toLowerCase() !== 'undefined' &&
                       String((emp as any)[filiadosColumn]).toLowerCase() !== 'n/a' : false;
      
      if (isFiliado) {
        acc[mappedMotivo.name].filiados++;
      } else {
        acc[mappedMotivo.name].naoFiliados++;
      }
      
      return acc;
    }, {} as Record<string, { name: string; count: number; color: string; icon: string; category: string; filiados: number; naoFiliados: number }>);
    
    return Object.values(motivoAfastamentoStats)
      .map(stat => ({
        ...stat,
        percentage: processedData.summary.validRecords > 0 ? (stat.count / processedData.summary.validRecords) * 100 : 0
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Limita a 10 registros
  };

  // Função para calcular estatísticas de aniversariantes por mês
  const getBirthdayStats = () => {
    if (!processedData) return [];
    
    // Procura pela coluna de data de nascimento nos dados
    const birthDateColumn = processedData.columns.find(col => 
      col.toLowerCase().includes('nascimento') || 
      col.toLowerCase().includes('nasc') ||
      col.toLowerCase().includes('birth') ||
      (col.toLowerCase().includes('data') && col.toLowerCase().includes('nasc'))
    );
    
    if (!birthDateColumn) {
      return [];
    }
    
    const monthNames = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    
    const monthStats = new Array(12).fill(0).map((_, index) => ({
      month: monthNames[index],
      monthNumber: index + 1,
      count: 0
    }));
    
    processedData.employees.forEach(emp => {
      const birthDate = (emp as any)[birthDateColumn];
      if (birthDate && birthDate !== '' && birthDate !== null && birthDate !== undefined) {
        try {
          let date: Date;
          
          // Tenta diferentes formatos de data
          if (typeof birthDate === 'string') {
            // Formato DD/MM/AAAA
            if (birthDate.includes('/')) {
              const parts = birthDate.split('/');
              if (parts.length === 3) {
                date = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
              } else {
                return;
              }
            }
            // Formato AAAA-MM-DD
            else if (birthDate.includes('-')) {
              date = new Date(birthDate);
            }
            // Formato DDMMAAAA
            else if (birthDate.length === 8) {
              const day = parseInt(birthDate.substring(0, 2));
              const month = parseInt(birthDate.substring(2, 4));
              const year = parseInt(birthDate.substring(4, 8));
              date = new Date(year, month - 1, day);
            }
            // Formato AAAAMMDD
            else if (birthDate.length === 8) {
              const year = parseInt(birthDate.substring(0, 4));
              const month = parseInt(birthDate.substring(4, 6));
              const day = parseInt(birthDate.substring(6, 8));
              date = new Date(year, month - 1, day);
            }
            else {
              return;
            }
          } else if (birthDate instanceof Date) {
            date = birthDate;
          } else {
            return;
          }
          
          // Verifica se a data é válida
          if (isNaN(date.getTime())) {
            return;
          }
          
          const month = date.getMonth(); // 0-11
          monthStats[month].count++;
          
        } catch (error) {
          // Ignora erros de parsing de data
          return;
        }
      }
    });
    
    // Filtra apenas meses com aniversariantes e ordena por mês
    return monthStats
      .filter(stat => stat.count > 0)
      .sort((a, b) => a.monthNumber - b.monthNumber);
  };



  // Função para calcular aniversariantes da semana
  const getWeeklyBirthdays = (weekOffset: number = 0) => {
    if (!processedData) return [];
    
    // Procura pelas colunas necessárias
    const birthDateColumn = processedData.columns.find(col => 
      col.toLowerCase().includes('nascimento') || 
      col.toLowerCase().includes('nasc') ||
      col.toLowerCase().includes('birth') ||
      (col.toLowerCase().includes('data') && col.toLowerCase().includes('nasc'))
    );
    
    const nameColumn = processedData.columns.find(col => 
      col.toLowerCase().includes('nome') || 
      col.toLowerCase().includes('name')
    );
    
    const genderColumn = processedData.columns.find(col => 
      col.toLowerCase().includes('sexo') || 
      col.toLowerCase().includes('genero') ||
      col.toLowerCase().includes('gênero') ||
      col.toLowerCase().includes('gender')
    );
    
    const locationColumn = processedData.columns.find(col => 
      col.toLowerCase().includes('lotação') || 
      col.toLowerCase().includes('lotacao') ||
      col.toLowerCase().includes('localização') ||
      col.toLowerCase().includes('localizacao') ||
      col.toLowerCase().includes('location') ||
      col.toLowerCase().includes('unidade') ||
      col.toLowerCase().includes('unit') ||
      col.toLowerCase().includes('setor') ||
      col.toLowerCase().includes('sector')
    );
    
    const filiadosColumn = processedData.columns.find(col => 
      col.toLowerCase().includes('filiado') || 
      col.toLowerCase().includes('filiacao')
    );
    
    if (!birthDateColumn || !nameColumn) {
      return [];
    }
    
    const today = new Date();
    
    // Calcula a semana atual baseada na data de hoje (não no mês)
    const currentWeekStart = new Date(today);
    currentWeekStart.setDate(today.getDate() - today.getDay()); // Domingo da semana atual
    currentWeekStart.setHours(0, 0, 0, 0);
    
    const currentWeekEnd = new Date(currentWeekStart);
    currentWeekEnd.setDate(currentWeekStart.getDate() + 6); // Sábado da semana atual
    currentWeekEnd.setHours(23, 59, 59, 999);
    
    // Calcula a semana selecionada baseada no offset
    const selectedWeekStart = new Date(currentWeekStart);
    selectedWeekStart.setDate(currentWeekStart.getDate() + (weekOffset * 7));
    
    const selectedWeekEnd = new Date(selectedWeekStart);
    selectedWeekEnd.setDate(selectedWeekStart.getDate() + 6);
    selectedWeekEnd.setHours(23, 59, 59, 999);
    
    const weeklyBirthdays: Array<{
      name: string;
      gender: string;
      location: string;
      birthDate: string;
      age: number;
      formattedBirthDate: string;
      day: number; // Para ordenação
      month: number; // Para ordenação
      isFiliado: boolean;
      filiadoText: string;
    }> = [];
    
    processedData.employees.forEach(emp => {
      const birthDate = (emp as any)[birthDateColumn];
      if (birthDate && birthDate !== '' && birthDate !== null && birthDate !== undefined) {
        try {
          let date: Date;
          
          // Tenta diferentes formatos de data
          if (typeof birthDate === 'string') {
            // Formato DD/MM/AAAA
            if (birthDate.includes('/')) {
              const parts = birthDate.split('/');
              if (parts.length === 3) {
                date = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
              } else {
                return;
              }
            }
            // Formato AAAA-MM-DD
            else if (birthDate.includes('-')) {
              date = new Date(birthDate);
            }
            // Formato DDMMAAAA
            else if (birthDate.length === 8) {
              const day = parseInt(birthDate.substring(0, 2));
              const month = parseInt(birthDate.substring(2, 4));
              const year = parseInt(birthDate.substring(4, 8));
              date = new Date(year, month - 1, day);
            }
            // Formato AAAAMMDD
            else if (birthDate.length === 8) {
              const year = parseInt(birthDate.substring(0, 4));
              const month = parseInt(birthDate.substring(4, 6));
              const day = parseInt(birthDate.substring(6, 8));
              date = new Date(year, month - 1, day);
            }
            else {
              return;
            }
          } else if (birthDate instanceof Date) {
            date = birthDate;
          } else {
            return;
          }
          
          // Verifica se a data é válida
          if (isNaN(date.getTime())) {
            return;
          }
          
          // Cria uma data para o aniversário deste ano
          const thisYearBirthday = new Date(today.getFullYear(), date.getMonth(), date.getDate());
          
          // Verifica se o aniversário está na semana selecionada
          if (thisYearBirthday >= selectedWeekStart && thisYearBirthday <= selectedWeekEnd) {
            const name = (emp as any)[nameColumn] || 'Nome não informado';
            const gender = genderColumn ? (emp as any)[genderColumn] || 'Não informado' : 'Não informado';
            const location = locationColumn ? (emp as any)[locationColumn] || 'Não informado' : 'Não informado';
            
            // Verifica se é filiado (tem valor na coluna filiados)
            const isFiliado = filiadosColumn ? (emp as any)[filiadosColumn] && 
                             String((emp as any)[filiadosColumn]).trim() !== '' && 
                             String((emp as any)[filiadosColumn]).toLowerCase() !== 'null' &&
                             String((emp as any)[filiadosColumn]).toLowerCase() !== 'undefined' &&
                             String((emp as any)[filiadosColumn]).toLowerCase() !== 'n/a' : false;
            
            // Calcula a idade
            const age = today.getFullYear() - date.getFullYear();
            const monthDiff = today.getMonth() - date.getMonth();
            const dayDiff = today.getDate() - date.getDate();
            
            const finalAge = monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? age - 1 : age;
            
            // Formata a data de nascimento
            const formattedBirthDate = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
            
            weeklyBirthdays.push({
              name,
              gender: gender.toString().toUpperCase() === 'F' ? 'Feminino' : 
                     gender.toString().toUpperCase() === 'M' ? 'Masculino' : gender,
              location,
              birthDate: birthDate.toString(),
              age: finalAge,
              formattedBirthDate,
              day: date.getDate(), // Para ordenação por dia
              month: date.getMonth(), // Para ordenação por mês
              isFiliado,
              filiadoText: isFiliado ? 'Sim' : 'Não'
            });
          }
          
        } catch (error) {
          // Ignora erros de parsing de data
          return;
        }
      }
    });
    
    // Ordena por mês e dia (crescente) e depois por nome (alfabético)
    return weeklyBirthdays.sort((a, b) => {
      // Primeiro ordena por mês
      if (a.month !== b.month) {
        return a.month - b.month;
      }
      // Depois por dia
      if (a.day !== b.day) {
        return a.day - b.day;
      }
      // Por último por nome
      return a.name.localeCompare(b.name, 'pt-BR');
    });
  };

  // Função para obter informações da semana selecionada
  const getWeekInfo = (weekOffset: number = 0) => {
    const today = new Date();
    
    // Calcula a semana atual baseada na data de hoje
    const currentWeekStart = new Date(today);
    currentWeekStart.setDate(today.getDate() - today.getDay()); // Domingo da semana atual
    currentWeekStart.setHours(0, 0, 0, 0);
    
    // Calcula a semana selecionada baseada no offset
    const selectedWeekStart = new Date(currentWeekStart);
    selectedWeekStart.setDate(currentWeekStart.getDate() + (weekOffset * 7));
    
    const selectedWeekEnd = new Date(selectedWeekStart);
    selectedWeekEnd.setDate(selectedWeekStart.getDate() + 6);
    selectedWeekEnd.setHours(23, 59, 59, 999);
    
    const monthNames = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    
    // Determina se pode navegar para semanas anteriores/posteriores
    // Limita a navegação para evitar ir muito longe
    const canGoPrevious = weekOffset > -3; // Máximo 3 semanas anteriores
    const canGoNext = weekOffset < 3; // Máximo 3 semanas posteriores
    
    return {
      start: selectedWeekStart,
      end: selectedWeekEnd,
      monthName: monthNames[selectedWeekStart.getMonth()],
      year: selectedWeekStart.getFullYear(),
      isCurrentWeek: weekOffset === 0,
      canGoPrevious,
      canGoNext
    };
  };

  // Função para navegar para a semana anterior
  const goToPreviousWeek = () => {
    if (selectedWeekOffset > -3) { // Limita a 3 semanas anteriores
      setSelectedWeekOffset(selectedWeekOffset - 1);
    }
  };

  // Função para navegar para a próxima semana
  const goToNextWeek = () => {
    if (selectedWeekOffset < 3) { // Limita a 3 semanas posteriores
      setSelectedWeekOffset(selectedWeekOffset + 1);
    }
  };

  // Função para voltar para a semana atual
  const goToCurrentWeek = () => {
    setSelectedWeekOffset(0);
  };

  // Debug: Log dos dados processados
  console.log('🔍 Dashboard - processedData:', {
    hasData: !!processedData,
    employeesCount: processedData?.employees?.length || 0,
    columnsCount: processedData?.columns?.length || 0,
    dataSource: processedData?.dataSource,
    selectedMonthYear: processedData?.selectedMonthYear,
    availableMonths: processedData?.availableMonths,
    availableMonthsLength: processedData?.availableMonths?.length || 0
  });
  
  // Debug: Log específico para availableMonths
  console.log('🔍 Dashboard - availableMonths debug:', {
    availableMonths: processedData?.availableMonths,
    isArray: Array.isArray(processedData?.availableMonths),
    length: processedData?.availableMonths?.length,
    firstItem: processedData?.availableMonths?.[0]
  });

  if (!hasData) {
    return (
      <>
        <DashboardLoading 
          isLoading={isLoadingBaseDados}
          progress={loadingProgress}
          currentStep={currentLoadingStep}
          totalSteps={totalLoadingSteps}
        />
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#1d335b' }}>Dashboard</h1>
            <p className="text-gray-600">
              Os dados estão sendo carregados, aguarde um momento!
            </p>
          </div>
        </div>
      </>
    );
  }

  if (!processedData) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#1d335b' }}>Dashboard</h1>
          <p className="text-red-600">Erro: Dados não processados</p>
          {!isSystemOwnerAdmin() && (
            <p className="text-sm text-gray-500 mt-1">
              Entre em contato com um administrador da empresa dona do sistema para fazer upload de arquivos
            </p>
          )}
        </div>
      </div>
    );
  }

  const genderStats = getGenderStats();
  const raceStats = getRaceStats();

  const mensalidadeStats = getMensalidadeStats();
  const contribuicaoMinMaxStats = getContribuicaoMinMaxStats();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: '#1d335b' }}>Dashboard</h1>
        <p className="text-gray-600">
          {dataSource === 'base_dados' 
            ? `O Dashboard é criado de forma dinâmica com base nas informações de sua empresa.`
            : `Análise dos dados carregados em ${formatDate(processedData.uploadedAt)}`
          }
        </p>
        
        {/* Caixa de seleção de dados */}
        <div className="mt-4 bg-white border border-gray-200 rounded-lg shadow-sm p-4">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <Gift className="h-5 w-5 mr-2" style={{ color: '#ffc9c0' }} />
              Selecione os dados desejados:
            </h3>
          </div>
          
          <div className="space-y-4">
            {/* Seletores na mesma linha */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-8 space-y-4 lg:space-y-0">
              {/* Seletor de mês sempre visível */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5" style={{ color: '#ffc9c0' }} />
                  <span className="text-sm font-medium text-gray-700">Período dos dados:</span>
                </div>
                <div className="relative month-selector">
                  <button
                    onClick={() => setShowMonthSelector(!showMonthSelector)}
                    className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                  >
                    <span className="text-sm font-medium text-gray-700">
                      {selectedMonth ? formatMonthDisplay(selectedMonth) : 'Selecionar mês/ano'}
                    </span>
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  </button>
                  
                  {showMonthSelector && (
                    <div className="absolute left-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                      <div className="p-2">
                        <div className="text-xs font-medium text-gray-500 mb-2 px-2">Selecionar período:</div>
                        <div className="max-h-60 overflow-y-auto">
                          {processedData?.availableMonths && processedData.availableMonths.length > 0 ? (
                            processedData.availableMonths.map((monthYear) => (
                              <button
                                key={monthYear}
                                onClick={() => handleMonthChange(monthYear)}
                                className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                                  monthYear === selectedMonth
                                    ? 'bg-blue-100 text-blue-800 font-medium'
                                    : 'hover:bg-gray-100 text-gray-700'
                                }`}
                              >
                                {formatMonthDisplay(monthYear)}
                              </button>
                            ))
                          ) : processedData?.dataSource === 'base_dados' ? (
                            <div className="text-sm text-gray-500 px-3 py-2">
                              Nenhum mês disponível encontrado
                            </div>
                          ) : (
                            <div className="text-sm text-gray-500 px-3 py-2">
                              Carregando meses disponíveis...
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Seletor de base sindical - apenas para admin da empresa dona do sistema */}
              {isSystemOwnerAdmin() && (
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Users className="h-5 w-5" style={{ color: '#ffc9c0' }} />
                    <span className="text-sm font-medium text-gray-700">Base Sindical:</span>
                  </div>
                  {/* Seletor de base sindical - apenas para dono do sistema */}
                  {isSystemOwnerAdmin() && (
                    <div className="relative base-sindical-selector">
                      <button
                        onClick={() => setShowBaseSindicalSelector(!showBaseSindicalSelector)}
                        className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                      >
                        <span className="text-sm font-medium text-gray-700">
                          {selectedBaseSindical || 'Todas as bases'}
                        </span>
                        <ChevronDown className="h-4 w-4 text-gray-500" />
                      </button>
                      
                      {showBaseSindicalSelector && (
                        <div className="absolute left-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                          <div className="p-2">
                            <div className="text-xs font-medium text-gray-500 mb-2 px-2">Selecionar base sindical:</div>
                            <div className="max-h-60 overflow-y-auto">
                              <button
                                onClick={() => handleBaseSindicalChange('')}
                                className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                                  !selectedBaseSindical
                                    ? 'bg-blue-100 text-blue-800 font-medium'
                                    : 'hover:bg-gray-100 text-gray-700'
                                }`}
                              >
                                Todas as bases
                              </button>
                              {processedData?.availableBasesSindicais && processedData.availableBasesSindicais.length > 0 ? (
                                processedData.availableBasesSindicais.map((baseSindical) => (
                                  <button
                                    key={baseSindical}
                                    onClick={() => handleBaseSindicalChange(baseSindical)}
                                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                                      baseSindical === selectedBaseSindical
                                        ? 'bg-blue-100 text-blue-800 font-medium'
                                        : 'hover:bg-gray-100 text-gray-700'
                                    }`}
                                  >
                                    {baseSindical}
                                  </button>
                                ))
                              ) : (
                                <div className="text-sm text-gray-500 px-3 py-2">
                                  Nenhuma base sindical encontrada
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Para usuários normais, mostrar apenas a base sindical atual */}
                  {!isSystemOwnerAdmin() && (
                    <div className="flex items-center space-x-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">
                        {selectedBaseSindical || user?.base_sindical || 'Base não definida'}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Card de informações do período selecionado */}
            {processedData.selectedMonthYear && (
              <div className="p-3 rounded-lg" style={{ backgroundColor: '#fff5f5', borderColor: '#ffc9c0', borderWidth: '1px', borderStyle: 'solid' }}>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#ffc9c0' }}></div>
                  <span className="text-sm font-medium" style={{ color: '#8b5a5a' }}>
                    Dados do período: <strong>{formatMonthDisplay(processedData.selectedMonthYear)}</strong>
                  </span>
                </div>
                <div className="mt-1 text-xs" style={{ color: '#a67a7a' }}>
                  {processedData.totalRecordsInDatabase && processedData.filteredRecords && (
                    <>
                      Exibindo {processedData.filteredRecords.toLocaleString('pt-BR')} de {processedData.totalRecordsInDatabase.toLocaleString('pt-BR')} registros disponíveis
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>



      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <Users className="h-8 w-8" style={{ color: '#1d335b' }} />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total de Empregados</p>
                <p className="text-2xl font-bold" style={{ color: '#1d335b' }}>
                  {processedData.summary.totalRecords.toLocaleString('pt-BR')}
                </p>
                {/* Estatísticas de filiados e não filiados */}
                {(() => {
                  const filiadosStats = getFiliadosStats();
                  if (filiadosStats.filiados > 0 || filiadosStats.naoFiliados > 0) {
                    const total = filiadosStats.filiados + filiadosStats.naoFiliados;
                    const percentualFiliados = total > 0 ? ((filiadosStats.filiados / total) * 100).toFixed(1) : '0.0';
                    const percentualNaoFiliados = total > 0 ? ((filiadosStats.naoFiliados / total) * 100).toFixed(1) : '0.0';
                    
                    return (
                      <div className="mt-2 space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium" style={{ color: '#1d335b' }}>Filiados:</span>
                          <div className="flex items-center space-x-2">
                            <span className="font-bold" style={{ color: '#1d335b' }}>
                              {filiadosStats.filiados.toLocaleString('pt-BR')}
                            </span>
                            <span className="text-xs" style={{ color: '#1d335b', opacity: 0.8 }}>
                              ({percentualFiliados}%)
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium" style={{ color: '#c9504c' }}>Não Filiados:</span>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium" style={{ color: '#c9504c' }}>
                              {filiadosStats.naoFiliados.toLocaleString('pt-BR')}
                            </span>
                            <span className="text-xs" style={{ color: '#c9504c', opacity: 0.8 }}>
                              ({percentualNaoFiliados}%)
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>
            </div>
          </div>
        </div>

        {mensalidadeStats.total > 0 && (
          <div className="card">
            <div className="card-content">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8" style={{ color: '#1d335b' }} />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">
                    Mensalidade{mensalidadeStats.referenceMonth ? ` - ${mensalidadeStats.referenceMonth}` : ''}
                  </p>
                  <p className="text-2xl font-bold" style={{ color: '#1d335b' }}>
                    {formatCurrency(mensalidadeStats.total)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {contribuicaoMinMaxStats.count > 0 && (
          <div className="card">
            <div className="card-content">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8" style={{ color: '#1d335b' }} />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Estatísticas de Mensalidades</p>
                  <div className="space-y-1">
                    <p className="text-lg font-bold" style={{ color: '#1d335b' }}>
                      {formatCurrency(contribuicaoMinMaxStats.average)}
                    </p>
                    <p className="text-sm text-gray-500">
                      Mín: {formatCurrency(contribuicaoMinMaxStats.min)} | Média: {formatCurrency(contribuicaoMinMaxStats.average)} | Máx: {formatCurrency(contribuicaoMinMaxStats.max)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      


      {/* Estatísticas por Gênero */}
      {genderStats.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium" style={{ color: '#1d335b' }}>Distribuição por Gênero</h3>
          </div>
          <div className="card-content">
            {/* Gráfico de Barras */}
            <div className="mb-6">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={genderStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="gender" 
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    tickFormatter={(value) => value.toLocaleString('pt-BR')}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip 
                    formatter={(value: number) => [value.toLocaleString('pt-BR'), 'Funcionários']}
                    labelStyle={{ color: '#1d335b' }}
                  />
                  <Bar 
                    dataKey="count" 
                    fill="#1d335b"
                    radius={[4, 4, 0, 0]}
                  >
                    {genderStats.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.gender === 'Feminino' ? '#c9504c' : '#1d335b'} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            {/* Cards de Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {genderStats.map((gender, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-900">{gender.gender}</h4>
                    <span className="text-xs text-gray-500">{gender.count.toLocaleString('pt-BR')} funcionários</span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-600">
                      {((gender.count / processedData.summary.validRecords) * 100).toFixed(1)}% do total
                    </p>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full transition-all duration-300"
                        style={{ 
                          backgroundColor: gender.gender === 'Feminino' ? '#c9504c' : '#1d335b',
                          width: `${(gender.count / Math.max(...genderStats.map(g => g.count))) * 100}%`
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Estatísticas por Raça */}
      {raceStats.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium" style={{ color: '#1d335b' }}>Distribuição por Raça</h3>
          </div>
          <div className="card-content">
            {/* Gráfico de Barras */}
            <div className="mb-6">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={raceStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="race" 
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis 
                    tickFormatter={(value) => value.toLocaleString('pt-BR')}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip 
                    formatter={(value: number) => [value.toLocaleString('pt-BR'), 'Funcionários']}
                    labelStyle={{ color: '#1d335b' }}
                  />
                  <Bar 
                    dataKey="count" 
                    fill="#1d335b"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            {/* Cards de Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {raceStats.map((race, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-900">{race.race}</h4>
                    <span className="text-xs text-gray-500">{race.count.toLocaleString('pt-BR')} funcionários</span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-600">
                      {((race.count / processedData.summary.validRecords) * 100).toFixed(1)}% do total
                    </p>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full transition-all duration-300"
                        style={{ 
                          backgroundColor: '#1d335b',
                          width: `${(race.count / Math.max(...raceStats.map(r => r.count))) * 100}%`
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Estatísticas por SE e Base Sindical */}
      {getSEStats().length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium" style={{ color: '#1d335b' }}>Estatísticas por SE e Base Sindical</h3>
          </div>
          <div className="card-content">
            {/* Filtro e Controles */}
            <div className="mb-6 space-y-4">
              {/* Filtro */}
              <div className="flex flex-wrap gap-4 items-end">
                <div className="flex-1 min-w-64">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Filtrar por SE ou Base Sindical
                  </label>
                  <input
                    type="text"
                    value={seFilter}
                    onChange={(e) => setSeFilter(e.target.value)}
                    placeholder="Digite o nome da SE ou Base Sindical..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
                  />
                </div>
                
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-sm font-medium text-white rounded-md transition-colors"
                  style={{ backgroundColor: '#c9504c' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#d65a56'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#c9504c'}
                >
                  Limpar Filtro
                </button>
              </div>
              
              {/* Informações dos Filtros */}
              <div className="flex justify-end">
                <div className="text-sm text-gray-600">
                  {getFilteredSEStats().length.toLocaleString('pt-BR')} registros encontrados
                </div>
              </div>
            </div>
            
            <div>
              <p className="text-sm text-gray-600 mb-4">
                {seFilter ? 'Mostrando todas as SEs e Bases Sindicais que correspondem ao filtro aplicado' : 'Mostrando as 5 SEs e Bases Sindicais com maior número de funcionários'}
              </p>
              
              <div className="overflow-x-auto">
              {getFilteredSEStats().length > 0 ? (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SE</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Base Sindical</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Funcionários</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Filiados</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Não Filiados</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Filiação Média</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Distribuição</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {getFilteredSEStats().map((se, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {se.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {se.baseSindical}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {se.count.toLocaleString('pt-BR')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="text-center">
                            <div className="font-medium text-green-600">
                              {se.filiados.toLocaleString('pt-BR')}
                            </div>
                            <div className="text-xs text-gray-500">
                              {((se.filiados / se.count) * 100).toFixed(1)}%
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="text-center">
                            <div className="font-medium text-red-600">
                              {se.naoFiliados.toLocaleString('pt-BR')}
                            </div>
                            <div className="text-xs text-gray-500">
                              {((se.naoFiliados / se.count) * 100).toFixed(1)}%
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatCurrency(se.averageMensalidade)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                              <div 
                                className="h-2 rounded-full transition-all duration-300"
                                style={{ 
                                  backgroundColor: '#c9504c',
                                  width: `${(se.count / Math.max(...getFilteredSEStats().map(s => s.count))) * 100}%`
                                }}
                              ></div>
                            </div>
                            <span className="text-xs text-gray-500">
                              {((se.count / processedData.summary.validRecords) * 100).toFixed(1)}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-500 text-lg mb-2">
                    Nenhum resultado encontrado para o filtro aplicado
                  </div>
                  <div className="text-gray-400 text-sm">
                    Tente ajustar os critérios de busca ou limpar o filtro
                  </div>
                </div>
              )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Análise por Municípios */}
      {getMunicipalityStats().length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium" style={{ color: '#1d335b' }}>Top 5 Municípios</h3>
          </div>
          <div className="card-content">
            {/* Filtro */}
            <div className="mb-6">
              <div className="flex flex-wrap gap-4 items-end">
                <div className="flex-1 min-w-64">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Filtrar por Município
                  </label>
                  <input
                    type="text"
                    value={municipalityFilter}
                    onChange={(e) => setMunicipalityFilter(e.target.value)}
                    placeholder="Digite o nome do município..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
                  />
                </div>
                
                <button
                  onClick={clearMunicipalityFilters}
                  className="px-4 py-2 text-sm font-medium text-white rounded-md transition-colors"
                  style={{ backgroundColor: '#c9504c' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#d65a56'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#c9504c'}
                >
                  Limpar Filtro
                </button>
              </div>
              
              {/* Informações dos Filtros */}
              <div className="flex justify-end mt-2">
                <div className="text-sm text-gray-600">
                  {getFilteredMunicipalityStats().length.toLocaleString('pt-BR')} registros encontrados
                </div>
              </div>
            </div>
            
            <div>
              <p className="text-sm text-gray-600 mb-4">
                {municipalityFilter ? 'Mostrando todos os municípios que correspondem ao filtro aplicado' : 'Mostrando as 5 cidades com maior número de funcionários'}
              </p>
              
              <div className="overflow-x-auto">
                {getFilteredMunicipalityStats().length > 0 ? (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Município</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Funcionários</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Filiados</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Não Filiados</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Filiação Média</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Distribuição</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {getFilteredMunicipalityStats().map((municipality, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {municipality.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {municipality.count.toLocaleString('pt-BR')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="text-center">
                              <div className="font-medium text-green-600">
                                {municipality.filiados.toLocaleString('pt-BR')}
                              </div>
                              <div className="text-xs text-gray-500">
                                {((municipality.filiados / municipality.count) * 100).toFixed(1)}%
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="text-center">
                              <div className="font-medium text-red-600">
                                {municipality.naoFiliados.toLocaleString('pt-BR')}
                              </div>
                              <div className="text-xs text-gray-500">
                                {((municipality.naoFiliados / municipality.count) * 100).toFixed(1)}%
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatCurrency(municipality.averageMensalidade)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                                <div 
                                  className="h-2 rounded-full transition-all duration-300"
                                  style={{ 
                                    backgroundColor: '#c9504c',
                                    width: `${(municipality.count / Math.max(...getFilteredMunicipalityStats().map(m => m.count))) * 100}%`
                                  }}
                                ></div>
                              </div>
                              <span className="text-xs text-gray-500">
                                {((municipality.count / processedData.summary.validRecords) * 100).toFixed(1)}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-gray-500 text-lg mb-2">
                      Nenhum resultado encontrado para o filtro aplicado
                    </div>
                    <div className="text-gray-400 text-sm">
                      Tente ajustar os critérios de busca ou limpar o filtro
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Análise por Unidades de Lotação */}
      {getLocationStats().length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium" style={{ color: '#1d335b' }}>Top 5 Unidades de Lotação</h3>
          </div>
          <div className="card-content">
            {/* Filtro */}
            <div className="mb-6">
              <div className="flex flex-wrap gap-4 items-end">
                <div className="flex-1 min-w-64 relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Filtrar por Unidade
                  </label>
                  <input
                    type="text"
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                    placeholder="Digite o nome da unidade..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
                  />
                </div>
                
                <button
                  onClick={clearLocationFilters}
                  className="px-4 py-2 text-sm font-medium text-white rounded-md transition-colors"
                  style={{ backgroundColor: '#c9504c' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#d65a56'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#c9504c'}
                >
                  Limpar Filtro
                </button>
              </div>
              
              {/* Informações dos Filtros */}
              <div className="flex justify-end mt-2">
                <div className="text-sm text-gray-600">
                  {getFilteredLocationStats().length.toLocaleString('pt-BR')} registros encontrados
                </div>
              </div>
            </div>
            
            <div>
              <p className="text-sm text-gray-600 mb-4">
                {locationFilter ? 'Mostrando todas as unidades que correspondem ao filtro aplicado' : 'Mostrando as 5 unidades com maior número de funcionários'}
              </p>
              <div className="overflow-x-auto">
                {getFilteredLocationStats().length > 0 ? (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unidade</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Funcionários</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Filiados</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Não Filiados</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Filiação Média</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Distribuição</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {getFilteredLocationStats().map((location, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {location.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {location.count.toLocaleString('pt-BR')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="text-center">
                              <div className="font-medium text-green-600">
                                {location.filiados.toLocaleString('pt-BR')}
                              </div>
                              <div className="text-xs text-gray-500">
                                {((location.filiados / location.count) * 100).toFixed(1)}%
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="text-center">
                              <div className="font-medium text-red-600">
                                {location.naoFiliados.toLocaleString('pt-BR')}
                              </div>
                              <div className="text-xs text-gray-500">
                                {((location.naoFiliados / location.count) * 100).toFixed(1)}%
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatCurrency(location.averageMensalidade)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                                <div 
                                  className="h-2 rounded-full transition-all duration-300"
                                  style={{ 
                                    backgroundColor: '#c9504c',
                                    width: `${(location.count / Math.max(...getFilteredLocationStats().map(l => l.count))) * 100}%`
                                  }}
                                ></div>
                              </div>
                              <span className="text-xs text-gray-500">
                                {((location.count / processedData.summary.validRecords) * 100).toFixed(1)}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-gray-500 text-lg mb-2">
                      Nenhum resultado encontrado para o filtro aplicado
                    </div>
                    <div className="text-gray-400 text-sm">
                      Tente ajustar os critérios de busca ou limpar o filtro
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}



      {/* Estatísticas por Estado */}
      {getStateStats().length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium" style={{ color: '#1d335b' }}>Top 10 Estados</h3>
          </div>
          <div className="card-content">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Funcionários</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Filiação Média</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Distribuição</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {getStateStats().map((state, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {state.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {state.count.toLocaleString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatCurrency(state.averageSalary)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className="h-2 rounded-full transition-all duration-300"
                              style={{ 
                                backgroundColor: '#c9504c',
                                width: `${state.percentage}%`
                              }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-500">
                            {state.percentage.toFixed(1)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Estatísticas por Tempo de Filiação */}
      {getMembershipTimeStats().length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium" style={{ color: '#1d335b' }}>Tempo de Filiação</h3>
          </div>
          <div className="card-content">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tempo</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Funcionários</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Distribuição</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {getMembershipTimeStats().map((time, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {time.range}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {time.count.toLocaleString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="h-2 rounded-full transition-all duration-300"
                            style={{ 
                              backgroundColor: '#c9504c',
                              width: `${time.percentage}%`
                            }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-500">
                          {time.percentage.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}



      {/* Estatísticas por Faixa Etária */}
      {getAgeGroupStats().length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium" style={{ color: '#1d335b' }}>Faixa Etária</h3>
          </div>
          <div className="card-content">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Faixa</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Funcionários</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Distribuição</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {getAgeGroupStats().map((age, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {age.range}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {age.count.toLocaleString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="h-2 rounded-full transition-all duration-300"
                            style={{ 
                              backgroundColor: '#c9504c',
                              width: `${age.percentage}%`
                            }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-500">
                          {age.percentage.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Principais Cargos - Cards Clean em Linha */}
      {getCargoStats().length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium" style={{ color: '#1d335b' }}>Principais Cargos</h3>
          </div>
          <div className="card-content">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {getCargoStats().map((cargo, index) => {
                const colors = [
                  'bg-[#f8f9fa]',
                  'bg-[#e9ecef]',
                  'bg-[#dee2e6]',
                  'bg-[#ced4da]',
                  'bg-[#adb5bd]'
                ];
                const textColors = [
                  'text-[#1d335b]',
                  'text-[#1d335b]',
                  'text-[#1d335b]',
                  'text-[#1d335b]',
                  'text-[#1d335b]'
                ];
                return (
                  <div key={cargo.name} className="relative overflow-hidden rounded-lg border border-gray-300 hover:shadow-md hover:border-[#1d335b] transition-all duration-300 min-h-[130px] lg:min-h-[150px]">
                    <div className={`${colors[index % colors.length]} p-3 ${textColors[index % textColors.length]} text-center h-full flex flex-col justify-center`}>
                      <div className="space-y-1 flex-1 flex flex-col justify-center">
                        <h4 className="font-semibold text-xs truncate leading-tight mb-1">{cargo.name}</h4>
                        <div className="text-lg lg:text-xl font-bold mb-1">{cargo.percentage.toFixed(1)}%</div>
                        <p className="text-xs opacity-90 mb-2">{cargo.count.toLocaleString('pt-BR')} funcionários</p>
                        
                        {/* Percentuais e quantidades de filiação */}
                        <div className="space-y-1">
                          <div className="flex justify-between items-center text-xs">
                            <span className="opacity-80">Filiados:</span>
                            <span className="font-semibold text-green-600">
                              {cargo.filiados.toLocaleString('pt-BR')} ({cargo.percentualFiliados.toFixed(1)}%)
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-xs">
                            <span className="opacity-80">Não Filiados:</span>
                            <span className="font-semibold text-red-600">
                              {cargo.naoFiliados.toLocaleString('pt-BR')} ({cargo.percentualNaoFiliados.toFixed(1)}%)
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div 
                            className="bg-[#1d335b] h-1.5 rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${cargo.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Principais Especialidades - Cards Clean */}
      {getCargoEspecialidadeStats().length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium" style={{ color: '#1d335b' }}>Principais Cargos por Especialidades</h3>
          </div>
          <div className="card-content">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {getCargoEspecialidadeStats().map((especialidade, index) => {
                const colors = [
                  'bg-[#f8f9fa]',
                  'bg-[#e9ecef]',
                  'bg-[#dee2e6]',
                  'bg-[#ced4da]',
                  'bg-[#adb5bd]'
                ];
                const textColors = [
                  'text-[#1d335b]',
                  'text-[#1d335b]',
                  'text-[#1d335b]',
                  'text-[#1d335b]',
                  'text-[#1d335b]'
                ];
                
                return (
                  <div key={especialidade.name} className="relative overflow-hidden rounded-lg border border-gray-300 hover:shadow-md hover:border-[#1d335b] transition-all duration-300 min-h-[100px] lg:min-h-[120px]">
                    <div className={`${colors[index % colors.length]} p-3 ${textColors[index % textColors.length]} text-center h-full flex flex-col justify-center`}>
                      <div className="space-y-1 flex-1 flex flex-col justify-center">
                        <h4 className="font-semibold text-xs truncate leading-tight mb-1">{especialidade.name}</h4>
                        <div className="text-lg lg:text-xl font-bold mb-1">{especialidade.percentage.toFixed(1)}%</div>
                        <p className="text-xs opacity-90">{especialidade.count.toLocaleString('pt-BR')} funcionários</p>
                      </div>
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div 
                            className="bg-[#1d335b] h-1.5 rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${especialidade.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Principais Níveis - Timeline Horizontal com Cores UniSafe */}
      {getCargoNivelStats().length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium" style={{ color: '#1d335b' }}>Principais Níveis dos Cargos</h3>
          </div>
          <div className="card-content">
            <div className="relative">
              {/* Linha de conexão horizontal */}
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-300 transform -translate-y-1/2 hidden lg:block"></div>
              
              {/* Container dos níveis */}
              <div className="flex justify-center">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 lg:gap-8 max-w-4xl">
                  {getCargoNivelStats().map((nivel, index) => {
                    const isEven = index % 2 === 0;
                    const isFirst = index === 0;
                    const isLast = index === getCargoNivelStats().length - 1;
                    
                    return (
                      <div key={nivel.name} className="relative group">
                        {/* Card principal */}
                        <div className={`relative z-10 bg-white border-2 border-gray-200 rounded-xl p-5 hover:shadow-lg hover:border-[#c9504c] transition-all duration-300 ${isEven ? 'lg:transform lg:-translate-y-2' : 'lg:transform lg:translate-y-2'}`}>
                          {/* Indicador de nível */}
                          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-6 h-6 rounded-full border-2 border-white shadow-md flex items-center justify-center">
                            <div className={`w-3 h-3 rounded-full ${isEven ? 'bg-[#c9504c]' : 'bg-[#ffc9c0]'}`}></div>
                          </div>
                          
                          {/* Conteúdo do card */}
                          <div className="text-center space-y-3">
                            <h4 className="font-bold text-sm text-gray-800 truncate leading-tight">{nivel.name}</h4>
                            <div className="text-2xl font-bold text-[#c9504c]">{nivel.percentage.toFixed(1)}%</div>
                            <p className="text-xs text-gray-600 mb-2">{nivel.count.toLocaleString('pt-BR')} funcionários</p>
                            
                            {/* Percentuais e quantidades de filiação */}
                            <div className="space-y-1">
                              <div className="flex justify-between items-center text-xs">
                                <span className="text-gray-600">Filiados:</span>
                                <span className="font-semibold text-green-600">
                                  {nivel.filiados.toLocaleString('pt-BR')} ({nivel.percentualFiliados.toFixed(1)}%)
                                </span>
                              </div>
                              <div className="flex justify-between items-center text-xs">
                                <span className="text-gray-600">Não Filiados:</span>
                                <span className="font-semibold text-red-600">
                                  {nivel.naoFiliados.toLocaleString('pt-BR')} ({nivel.percentualNaoFiliados.toFixed(1)}%)
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Barra de progresso */}
                          <div className="mt-4">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className={`${isEven ? 'bg-[#c9504c]' : 'bg-[#ffc9c0]'} h-2 rounded-full transition-all duration-500 ease-out`}
                                style={{ width: `${nivel.percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Linha de conexão vertical (apenas para desktop) */}
                        {!isFirst && !isLast && (
                          <div className="absolute top-1/2 left-1/2 w-0.5 h-8 bg-gray-300 transform -translate-x-1/2 -translate-y-1/2 hidden lg:block"></div>
                        )}
                        
                        {/* Indicador de posição */}
                        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 text-xs text-gray-500 font-medium hidden lg:block">
                          #{index + 1}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {/* Legenda */}
              <div className="mt-6 flex items-center justify-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-[#c9504c]"></div>
                  <span>Níveis Principais</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-[#ffc9c0]"></div>
                  <span>Níveis Secundários</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Principais Funções - Grid de Badges */}
      {getFuncaoStats().length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium" style={{ color: '#1d335b' }}>Principais Funções</h3>
          </div>
          <div className="card-content">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {getFuncaoStats().map((funcao, index) => {
                const colors = ['bg-[#ffc9c0]', 'bg-[#f9695f]', 'bg-[#ffc9c0]', 'bg-[#f9695f]', 'bg-[#ffc9c0]'];
                const textColors = ['text-[#c9504c]', 'text-white', 'text-[#c9504c]', 'text-white', 'text-[#c9504c]'];
                
                return (
                  <div key={funcao.name} className={`${colors[index % colors.length]} ${textColors[index % textColors.length]} rounded-xl p-5 hover:shadow-md transition-all duration-300`}>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-sm truncate">{funcao.name}</h4>
                      <span className="text-xs opacity-75">#{index + 1}</span>
                    </div>
                    <div className="text-center mb-3">
                      <div className="text-3xl font-bold mb-1">{funcao.count.toLocaleString('pt-BR')}</div>
                      <div className="text-sm opacity-75">funcionários</div>
                    </div>
                    
                    {/* Percentuais e quantidades de filiação */}
                    <div className="space-y-1 mb-3">
                      <div className="flex justify-between items-center text-xs">
                        <span className="opacity-80">Filiados:</span>
                        <span className="font-semibold text-green-600">
                          {funcao.filiados.toLocaleString('pt-BR')} ({funcao.percentualFiliados.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="opacity-80">Não Filiados:</span>
                        <span className="font-semibold text-red-600">
                          {funcao.naoFiliados.toLocaleString('pt-BR')} ({funcao.percentualNaoFiliados.toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span>Distribuição</span>
                        <span className="font-medium">{funcao.percentage.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-white bg-opacity-50 rounded-full h-2">
                        <div 
                          className={`${textColors[index % textColors.length].replace('text-', 'bg-').replace('white', '#f9695f').replace('-800', '-500')} h-2 rounded-full transition-all duration-500 ease-out`}
                          style={{ width: `${funcao.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Jornadas de Trabalho - Gráfico de Pizza Visual */}
      {getJornadaStats().length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium" style={{ color: '#1d335b' }}>Jornadas de Trabalho</h3>
          </div>
          <div className="card-content">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Gráfico de Pizza Visual */}
              <div className="flex items-center justify-center">
                <div className="relative w-48 h-48">
                  {getJornadaStats().map((jornada, index) => {
                    const colors = ['#2f4a8c', '#f9695f', '#1d335b', '#c9504c', '#ffc9c0'];
                    const total = getJornadaStats().reduce((sum, j) => sum + j.count, 0);
                    const startAngle = getJornadaStats()
                      .slice(0, index)
                      .reduce((sum, j) => sum + (j.count / total) * 360, 0);
                    const angle = (jornada.count / total) * 360;
                    const isHighlighted = highlightedJornada === jornada.name;
                    
                    return (
                      <div
                        key={jornada.name}
                        data-jornada={jornada.name}
                        className={`absolute inset-0 rounded-full transition-all duration-300 ${
                          isHighlighted 
                            ? 'ring-4 ring-white ring-opacity-70 scale-105 shadow-lg' 
                            : 'hover:scale-102'
                        }`}
                        style={{
                          background: `conic-gradient(from ${startAngle}deg, ${colors[index % colors.length]} 0deg, ${colors[index % colors.length]} ${angle}deg, transparent ${angle}deg)`,
                          filter: isHighlighted ? 'brightness(1.1) saturate(1.2)' : 'none'
                        }}
                      ></div>
                    );
                  })}
                  
                  {/* Centro do gráfico */}
                  <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-700">
                        {getJornadaStats().reduce((sum, j) => sum + j.count, 0).toLocaleString('pt-BR')}
                      </div>
                      <div className="text-xs text-gray-500">Total</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Legenda */}
              <div className="space-y-3">
                {getJornadaStats().map((jornada, index) => {
                  const colors = ['#2f4a8c', '#f9695f', '#1d335b', '#c9504c', '#ffc9c0'];
                  const isHighlighted = highlightedJornada === jornada.name;
                  
                  return (
                    <div 
                      key={jornada.name} 
                      className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all duration-300 group ${
                        isHighlighted 
                          ? 'bg-blue-50 shadow-md scale-105 border-2 border-blue-200' 
                          : 'hover:bg-gray-50 hover:shadow-md hover:scale-105'
                      }`}
                      onMouseEnter={() => setHighlightedJornada(jornada.name)}
                      onMouseLeave={() => setHighlightedJornada(null)}
                    >
                      <div 
                        className={`w-4 h-4 rounded-full transition-all duration-300 ${
                          isHighlighted ? 'scale-125 ring-2 ring-white' : 'group-hover:scale-125'
                        }`}
                        style={{ 
                          backgroundColor: colors[index % colors.length],
                          boxShadow: isHighlighted ? '0 0 0 2px white, 0 0 10px rgba(0,0,0,0.3)' : 'none'
                        }}
                      ></div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className={`font-medium text-sm truncate transition-colors duration-300 ${
                            isHighlighted ? 'text-[#1d335b]' : 'group-hover:text-[#1d335b]'
                          }`}>{jornada.name}</span>
                          <span className={`text-sm font-bold transition-colors duration-300 ${
                            isHighlighted ? 'text-[#c9504c]' : 'text-gray-700 group-hover:text-[#c9504c]'
                          }`}>{jornada.count.toLocaleString('pt-BR')}</span>
                        </div>
                        <div className={`text-xs transition-colors duration-300 ${
                          isHighlighted ? 'text-[#2f4a8c]' : 'text-gray-500 group-hover:text-[#2f4a8c]'
                        }`}>{jornada.percentage.toFixed(1)}% do total</div>
                      </div>
                      
                      {/* Indicador de hover */}
                      <div className={`transition-opacity duration-300 ${
                        isHighlighted ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                      }`}>
                        <div className="w-2 h-2 bg-[#c9504c] rounded-full"></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}



      {/* Tipos de Deficiência */}
      {getDeficiencyStats().length > 0 && (
        <div className="card">
          <div className="card-header">
            <div className="flex items-center space-x-3">
              <h3 className="text-lg font-medium" style={{ color: '#1d335b' }}>Tipos de Deficiência</h3>
            </div>
          </div>
          <div className="card-content">
            


            <div className="mb-8">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {getDeficiencyStats().filter(d => d.name !== 'Sem Deficiência').map((deficiency, index) => {
                  const iconMap: Record<string, string> = {
                    'Física': '🦽',
                    'Visual': '👁️',
                    'Auditiva': '👂',
                    'Intelectual': '🧠',
                    'Mental': '💭',
                    'Psicossocial': '💙',
                    'Múltipla': '🔄',
                    'Outras': '♿',
                    'Não Informado': '❓'
                  };
                  
                  const gradientColors = [
                    'from-blue-400 to-cyan-400',
                    'from-purple-400 to-pink-400',
                    'from-green-400 to-emerald-400',
                    'from-orange-400 to-red-400',
                    'from-indigo-400 to-purple-400',
                    'from-pink-400 to-rose-400',
                    'from-cyan-400 to-blue-400',
                    'from-emerald-400 to-teal-400',
                    'from-red-400 to-orange-400'
                  ];
                  
                  return (
                    <div 
                      key={deficiency.name} 
                      className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white hover:shadow-lg transition-all duration-300 hover:scale-102 cursor-pointer"
                    >
                      {/* Fundo com gradiente animado */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${gradientColors[index % gradientColors.length]} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                      
                      {/* Cabeçalho do card */}
                      <div className="relative p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="text-2xl">{iconMap[deficiency.name] || '♿'}</div>
                          <div className="text-right">
                            <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                              #{index + 1}
                            </div>
                          </div>
                        </div>
                        
                        <h4 className="text-base font-bold text-gray-800 mb-2 group-hover:text-[#1d335b] transition-colors duration-300">
                          {deficiency.name}
                        </h4>
                        
                        {/* Estatísticas principais */}
                        <div className="space-y-3">
                          <div className="text-center p-2 bg-gray-50 rounded-lg">
                            <div className="text-xl font-bold text-[#1d335b]">
                              {deficiency.count.toLocaleString('pt-BR')}
                            </div>
                            <div className="text-xs text-gray-600">funcionários</div>
                          </div>
                          
                          {/* Barra de progresso circular */}
                          <div className="flex items-center justify-center">
                            <div className="relative w-12 h-12">
                              <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
                                <path
                                  className="text-gray-200"
                                  strokeWidth="3"
                                  fill="none"
                                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                />
                                <path
                                  className="text-[#1d335b]"
                                  strokeWidth="3"
                                  fill="none"
                                  strokeDasharray={`${deficiency.percentage * 1.13}, 100`}
                                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                  strokeLinecap="round"
                                />
                              </svg>
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-xs font-bold text-[#1d335b]">
                                  {deficiency.percentage.toFixed(1)}%
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Informações adicionais */}
                          <div className="text-center text-xs text-gray-500 space-y-1">
                            <div className="flex items-center justify-center space-x-2">
                              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: deficiency.color }}></div>
                              <span>Cor identificadora</span>
                            </div>
                            <div className="text-xs">
                              {deficiency.count > 1 ? 'Pessoas com deficiência' : 'Pessoa com deficiência'}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Indicador de hover */}
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#1d335b] to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
                    </div>
                  );
                })}
              </div>
            </div>






          </div>
        </div>
      )}

            {/* Motivo de Afastamento */}
      {getMotivoAfastamentoStats().length > 0 && (
        <div className="card">
          <div className="card-header">
            <div className="flex items-center space-x-3">
              <h3 className="text-lg font-medium" style={{ color: '#1d335b' }}>Motivo de Afastamento</h3>
              <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                Top 10 motivos
              </span>
            </div>
          </div>
          <div className="card-content">
            <p className="text-sm text-gray-600 mb-4">
              Mostrando os 10 principais motivos de afastamento com distribuição entre filiados e não filiados
            </p>
                         {/* Tabela Simples */}
             <div className="overflow-hidden">
               <div className="overflow-x-auto">
                 <table className="min-w-full divide-y divide-gray-200">
                   <thead className="bg-gray-50">
                     <tr>
                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Motivo</th>
                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Funcionários</th>
                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Filiados</th>
                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Não Filiados</th>
                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Percentual</th>
                     </tr>
                   </thead>
                   <tbody className="bg-white divide-y divide-gray-200">
                     {getMotivoAfastamentoStats().map((motivo, index) => (
                       <tr key={index} className="hover:bg-gray-50 transition-colors duration-200">
                         <td className="px-6 py-4 whitespace-nowrap">
                           <span className="text-sm font-medium" style={{ color: '#1d335b' }}>{motivo.name}</span>
                         </td>
                         <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: '#2f4a8c' }}>
                           {motivo.count.toLocaleString('pt-BR')}
                         </td>
                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                           <div className="text-center">
                             <div className="font-medium text-green-600">
                               {motivo.filiados.toLocaleString('pt-BR')}
                             </div>
                             <div className="text-xs text-gray-500">
                               {motivo.count > 0 ? ((motivo.filiados / motivo.count) * 100).toFixed(1) : '0'}%
                             </div>
                           </div>
                         </td>
                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                           <div className="text-center">
                             <div className="font-medium text-red-600">
                               {motivo.naoFiliados.toLocaleString('pt-BR')}
                             </div>
                             <div className="text-xs text-gray-500">
                               {motivo.count > 0 ? ((motivo.naoFiliados / motivo.count) * 100).toFixed(1) : '0'}%
                             </div>
                           </div>
                         </td>
                         <td className="px-6 py-4 whitespace-nowrap">
                           <div className="flex items-center space-x-3">
                             <div className="flex-1">
                               <div className="w-full bg-gray-200 rounded-full h-2">
                                 <div 
                                   className="h-2 rounded-full transition-all duration-500 ease-out"
                                   style={{ 
                                     backgroundColor: '#c9504c',
                                     width: `${motivo.percentage}%`
                                   }}
                                 ></div>
                               </div>
                             </div>
                             <span className="text-sm font-medium" style={{ color: '#c9504c' }}>
                               {motivo.percentage.toFixed(1)}%
                             </span>
                           </div>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
             </div>
          </div>
        </div>
      )}

      {/* Aniversariantes do Mês - Gráfico de Barras */}
      {getBirthdayStats().length > 0 ? (
        <div className="card">
          <div className="card-header">
            <div className="flex items-center space-x-2">
              <Gift className="h-5 w-5" style={{ color: '#1d335b' }} />
              <h3 className="text-lg font-medium" style={{ color: '#1d335b' }}>Aniversariantes do Mês</h3>
            </div>
          </div>
          <div className="card-content">
            {/* Gráfico de Barras - Parte Superior */}
            <div className="mb-8">
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={getBirthdayStats()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis 
                    tickFormatter={(value) => value.toLocaleString('pt-BR')}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip 
                    formatter={(value: number) => [value.toLocaleString('pt-BR'), 'Aniversariantes']}
                    labelStyle={{ color: '#1d335b' }}
                    contentStyle={{ color: '#1d335b' }}
                  />
                  <Bar 
                    dataKey="count" 
                    fill="#ffc9c0"
                    radius={[4, 4, 0, 0]}
                  >
                    {getBirthdayStats().map((entry, index) => {
                      const currentMonth = new Date().getMonth() + 1; // Mês atual (1-12)
                      const isCurrentMonth = entry.monthNumber === currentMonth;
                      
                      return (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={isCurrentMonth ? '#c9504c' : '#ffc9c0'} 
                        />
                      );
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            {/* Cards Mensais - Parte Inferior */}
            <div className="space-y-4">
              {/* Grid de Cards por Mês - 6 por linha */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {getBirthdayStats().map((month) => {
                  const currentMonth = new Date().getMonth() + 1; // Mês atual (1-12)
                  const isCurrentMonth = month.monthNumber === currentMonth;
                  const totalAniversariantes = getBirthdayStats().reduce((sum, m) => sum + m.count, 0);
                  const percentual = ((month.count / totalAniversariantes) * 100).toFixed(1);
                  
                  return (
                    <div 
                      key={month.month} 
                      className={`p-3 rounded-lg border-2 transition-all duration-300 hover:shadow-lg ${
                        isCurrentMonth 
                          ? 'border-[#c9504c] bg-red-50 shadow-md' 
                          : 'border-gray-200 bg-white hover:border-[#ffc9c0]'
                      }`}
                    >
                      {/* Cabeçalho do Card */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <div 
                            className={`w-2 h-2 rounded-full ${
                              isCurrentMonth ? 'bg-[#c9504c]' : 'bg-[#ffc9c0]'
                            }`}
                          ></div>
                          <span className={`text-xs font-medium ${
                            isCurrentMonth ? 'text-[#c9504c] font-bold' : 'text-gray-900'
                          }`}>
                            {month.month}
                          </span>
                        </div>
                        {isCurrentMonth && (
                          <span className="text-xs bg-[#c9504c] text-white px-1.5 py-0.5 rounded-full font-medium">
                            Atual
                          </span>
                        )}
                      </div>
                      
                      {/* Quantidade de Aniversariantes */}
                      <div className="text-center mb-2">
                        <div className={`text-lg font-bold ${
                          isCurrentMonth ? 'text-[#c9504c]' : 'text-gray-900'
                        }`}>
                          {month.count.toLocaleString('pt-BR')}
                        </div>
                        <div className="text-xs text-gray-500">aniversariantes</div>
                      </div>
                      
                      {/* Barra de Progresso */}
                      <div className="mb-2">
                        <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                          <span className="text-xs">%</span>
                          <span className="font-medium text-xs">{percentual}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div 
                            className={`h-1.5 rounded-full transition-all duration-300 ${
                              isCurrentMonth ? 'bg-[#c9504c]' : 'bg-[#ffc9c0]'
                            }`}
                            style={{ width: `${percentual}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      {/* Informações Adicionais */}
                      <div className="text-center text-xs text-gray-500">
                        {month.count.toLocaleString('pt-BR')} de {totalAniversariantes.toLocaleString('pt-BR')}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Tabela de Aniversariantes da Semana */}
            {getWeeklyBirthdays(selectedWeekOffset).length > 0 && (
              <div className="mt-8">
                <div className="border-t border-gray-200 pt-6">
                  {/* Cabeçalho com controles de navegação */}
                  <div className="mb-4">
                    {/* Título e indicador - sempre na mesma linha */}
                    <div className="flex items-center space-x-3 mb-3">
                      <h4 className="text-lg font-medium text-gray-900 flex items-center">
                        <span className="w-2 h-2 bg-[#c9504c] rounded-full mr-3"></span>
                        Aniversariantes da Semana
                      </h4>
                      
                      {/* Indicador de aniversariantes do dia */}
                      {(() => {
                        const today = new Date();
                        const todaysBirthdays = getWeeklyBirthdays(selectedWeekOffset).filter(person => 
                          person.month === today.getMonth() && person.day === today.getDate()
                        );
                        
                        if (todaysBirthdays.length > 0) {
                          return (
                            <div className="flex items-center space-x-2 px-3 py-1.5 bg-[#fff5f4] border border-[#ffc9c0] text-[#8b2e2a] rounded-full shadow-sm">
                              <span className="text-[#c9504c] text-sm">🎂</span>
                              <span className="text-sm font-medium">
                                {todaysBirthdays.length.toLocaleString('pt-BR')} aniversariante{todaysBirthdays.length !== 1 ? 's' : ''} hoje!
                              </span>
                            </div>
                          );
                        }
                        return null;
                      })()}
                    </div>
                    
                    {/* Controles de navegação - responsivos */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-2">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={goToPreviousWeek}
                          disabled={!getWeekInfo(selectedWeekOffset).canGoPrevious}
                          className={`px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors duration-200 flex-1 sm:flex-none ${
                            getWeekInfo(selectedWeekOffset).canGoPrevious
                              ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          <span className="hidden sm:inline">← Semana Anterior</span>
                          <span className="sm:hidden">← Anterior</span>
                        </button>
                        
                        <button
                          onClick={goToCurrentWeek}
                          className={`px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors duration-200 flex-1 sm:flex-none ${
                            selectedWeekOffset === 0
                              ? 'bg-[#c9504c] text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          <span className="hidden sm:inline">Semana Atual</span>
                          <span className="sm:hidden">Atual</span>
                        </button>
                        
                        <button
                          onClick={goToNextWeek}
                          disabled={!getWeekInfo(selectedWeekOffset).canGoNext}
                          className={`px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors duration-200 flex-1 sm:flex-none ${
                            getWeekInfo(selectedWeekOffset).canGoNext
                              ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          <span className="hidden sm:inline">Próxima Semana →</span>
                          <span className="sm:hidden">Próxima →</span>
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Informações da semana selecionada */}
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>
                        <strong>Semana selecionada:</strong> {getWeekInfo(selectedWeekOffset).start.getDate().toString().padStart(2, '0')} a {getWeekInfo(selectedWeekOffset).end.getDate().toString().padStart(2, '0')} de {getWeekInfo(selectedWeekOffset).monthName} de {getWeekInfo(selectedWeekOffset).year}
                      </span>
                      {selectedWeekOffset !== 0 && (
                        <span className="text-[#c9504c] font-medium">
                          {selectedWeekOffset > 0 ? '+' : ''}{selectedWeekOffset} semana{selectedWeekOffset !== 1 ? 's' : ''} {selectedWeekOffset > 0 ? 'à frente' : 'atrás'}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="overflow-hidden">
                    <div className="max-h-80 overflow-y-auto border border-gray-200 rounded-lg custom-scrollbar">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50 sticky top-0 z-10">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              NOME
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              SEXO
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              LOTAÇÃO
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              DATA NASCIMENTO
                          </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              IDADE
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              FILIADO
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {getWeeklyBirthdays(selectedWeekOffset).map((person, index) => {
                            // Verifica se é aniversário hoje
                            const today = new Date();
                            const isBirthdayToday = person.month === today.getMonth() && person.day === today.getDate();
                            
                            return (
                              <tr 
                                key={index} 
                                className={`transition-all duration-200 ${
                                  isBirthdayToday 
                                    ? 'bg-[#fff5f4] border-l-4 border-[#ffc9c0] shadow-sm' 
                                    : 'hover:bg-gray-50'
                                }`}
                              >
                                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                                  <div className="flex items-center space-x-2">
                                    {isBirthdayToday && (
                                      <span className="text-[#c9504c] text-lg">🎂</span>
                                    )}
                                    <span className={isBirthdayToday ? 'text-[#8b2e2a]' : 'text-gray-900'}>
                                      {person.name}
                                    </span>
                                  </div>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm">
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    isBirthdayToday
                                      ? 'bg-[#ffc9c0] text-[#8b2e2a] border border-[#e85d5a]'
                                      : person.gender === 'Feminino' 
                                      ? 'bg-pink-100 text-pink-800' 
                                      : person.gender === 'Masculino'
                                      ? 'bg-blue-100 text-blue-800'
                                      : 'bg-gray-100 text-gray-800'
                                  }`}>
                                    {person.gender}
                                  </span>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm">
                                  <span className={isBirthdayToday ? 'text-[#8b2e2a]' : 'text-gray-600'}>
                                    {person.location}
                                  </span>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm">
                                  <span className={isBirthdayToday ? 'text-[#8b2e2a]' : 'text-gray-600'}>
                                    {person.formattedBirthDate}
                                  </span>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm">
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    isBirthdayToday
                                      ? 'bg-[#ffc9c0] text-[#8b2e2a] border border-[#e85d5a]'
                                      : 'bg-[#ffc9c0] text-[#c9504c]'
                                  }`}>
                                    {person.age} anos
                                  </span>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm">
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    isBirthdayToday
                                      ? person.isFiliado
                                        ? 'bg-green-100 text-green-800 border border-green-300'
                                        : 'bg-red-100 text-red-800 border border-red-300'
                                      : person.isFiliado
                                      ? 'bg-green-100 text-green-800'
                                      : 'bg-red-100 text-red-800'
                                  }`}>
                                    {person.filiadoText}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                    
                    {/* Indicador de registros e barra de rolagem */}
                    {getWeeklyBirthdays(selectedWeekOffset).length > 0 && (
                      <div className="mt-3 text-center">
                        <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600">
                          <span className="w-2 h-2 bg-[#ffc9c0] rounded-full"></span>
                          <span>
                            {getWeeklyBirthdays(selectedWeekOffset).length.toLocaleString('pt-BR')} aniversariante{getWeeklyBirthdays(selectedWeekOffset).length !== 1 ? 's' : ''} na semana
                          </span>
                          {getWeeklyBirthdays(selectedWeekOffset).length > 6 && (
                            <span className="text-xs text-[#c9504c] font-medium">
                              (Role para ver todos)
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Mensagem quando não há aniversariantes na semana */}
            {getWeeklyBirthdays(selectedWeekOffset).length === 0 && (
              <div className="mt-8">
                <div className="border-t border-gray-200 pt-6">
                  {/* Cabeçalho com controles de navegação */}
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-medium text-gray-900 flex items-center">
                      <span className="w-2 h-2 bg-gray-400 rounded-full mr-3"></span>
                      Aniversariantes da Semana
                    </h4>
                    
                    {/* Controles de navegação */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={goToPreviousWeek}
                        disabled={!getWeekInfo(selectedWeekOffset).canGoPrevious}
                        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors duration-200 ${
                          getWeekInfo(selectedWeekOffset).canGoPrevious
                            ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        ← Semana Anterior
                      </button>
                      
                      <button
                        onClick={goToCurrentWeek}
                        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors duration-200 ${
                          selectedWeekOffset === 0
                            ? 'bg-[#c9504c] text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Semana Atual
                      </button>
                      
                      <button
                        onClick={goToNextWeek}
                        disabled={!getWeekInfo(selectedWeekOffset).canGoNext}
                        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors duration-200 ${
                          getWeekInfo(selectedWeekOffset).canGoNext
                            ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        Próxima Semana →
                      </button>
                    </div>
                  </div>
                  
                  {/* Informações da semana selecionada */}
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>
                        <strong>Semana selecionada:</strong> {getWeekInfo(selectedWeekOffset).start.getDate().toString().padStart(2, '0')} a {getWeekInfo(selectedWeekOffset).end.getDate().toString().padStart(2, '0')} de {getWeekInfo(selectedWeekOffset).monthName} de {getWeekInfo(selectedWeekOffset).year}
                      </span>
                      {selectedWeekOffset !== 0 && (
                        <span className="text-[#c9504c] font-medium">
                          {selectedWeekOffset > 0 ? '+' : ''}{selectedWeekOffset} semana{selectedWeekOffset !== 1 ? 's' : ''} {selectedWeekOffset > 0 ? 'à frente' : 'atrás'}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-center py-6">
                    <Gift className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                    <p className="text-gray-500">
                      Nenhum aniversariante na semana selecionada
                    </p>
                    
                    {/* Verifica se há aniversariantes do dia em outras semanas */}
                    {(() => {
                      const today = new Date();
                      const todaysBirthdays = processedData?.employees.filter(emp => {
                        const birthDateColumn = processedData.columns.find(col => 
                          col.toLowerCase().includes('nascimento') || 
                          col.toLowerCase().includes('nasc') ||
                          col.toLowerCase().includes('birth') ||
                          (col.toLowerCase().includes('data') && col.toLowerCase().includes('nasc'))
                        );
                        
                        if (!birthDateColumn) return false;
                        
                        const birthDate = (emp as any)[birthDateColumn];
                        if (!birthDate) return false;
                        
                        try {
                          let date: Date;
                          if (typeof birthDate === 'string') {
                            if (birthDate.includes('/')) {
                              const parts = birthDate.split('/');
                              if (parts.length === 3) {
                                date = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
                              } else return false;
                            } else if (birthDate.includes('-')) {
                              date = new Date(birthDate);
                            } else if (birthDate.length === 8) {
                              const day = parseInt(birthDate.substring(0, 2));
                              const month = parseInt(birthDate.substring(2, 4));
                              const year = parseInt(birthDate.substring(4, 8));
                              date = new Date(year, month - 1, day);
                            } else return false;
                          } else if (birthDate instanceof Date) {
                            date = birthDate;
                          } else return false;
                          
                          return date.getMonth() === today.getMonth() && date.getDate() === today.getDate();
                        } catch {
                          return false;
                        }
                      }) || [];
                      
                                             if (todaysBirthdays.length > 0) {
                         return (
                           <div className="mt-4 p-4 bg-[#fff5f4] border border-[#ffc9c0] text-[#8b2e2a] rounded-lg shadow-sm">
                             <div className="flex items-center justify-center space-x-2 mb-2">
                               <span className="text-[#c9504c] text-xl">🎂</span>
                               <span className="font-medium">Parabéns!</span>
                             </div>
                             <p className="text-sm">
                               Hoje é aniversário de <strong>{todaysBirthdays.length.toLocaleString('pt-BR')} funcionário{todaysBirthdays.length !== 1 ? 's' : ''}</strong>!
                             </p>
                             <p className="text-xs mt-1 opacity-90">
                               Navegue pelas semanas para encontrá-los
                             </p>
                           </div>
                         );
                       }
                      return null;
                    })()}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="card-header">
            <div className="flex items-center space-x-2">
              <Gift className="h-5 w-5" style={{ color: '#1d335b' }} />
              <h3 className="text-lg font-medium" style={{ color: '#1d335b' }}>Aniversariantes do Mês</h3>
            </div>
          </div>
          <div className="card-content">
            <div className="text-center py-8">
              <Gift className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Dados de aniversário não encontrados
              </h3>
              <p className="text-gray-500">
                Para visualizar os aniversariantes do mês, certifique-se de que o arquivo contenha uma coluna com data de nascimento.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Gráficos */}
      <div className="grid grid-cols-1 gap-6">






        {/* Gráfico de Barras - Funcionários por Estado */}
        {getStateStats().length > 0 && (
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium" style={{ color: '#1d335b' }}>Funcionários por Estado</h3>
            </div>
            <div className="card-content">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={getStateStats()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => [value, 'Funcionários']} />
                  <Bar dataKey="count" fill="#1d335b" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Gráfico de Linha - Tempo de Filiação */}
        {getMembershipTimeStats().length > 0 && (
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium" style={{ color: '#1d335b' }}>Distribuição por Tempo de Filiação</h3>
            </div>
            <div className="card-content">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={getMembershipTimeStats()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="range" />
                  <YAxis />
                  <Tooltip formatter={(value) => [value, 'Funcionários']} />
                  <Line type="monotone" dataKey="count" stroke="#059669" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}



        {/* Gráfico de Pizza - Distribuição por Faixa Etária */}
        {getAgeGroupStats().length > 0 && (
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium" style={{ color: '#1d335b' }}>Distribuição por Faixa Etária</h3>
            </div>
            <div className="card-content">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={getAgeGroupStats()}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {getAgeGroupStats().map((_, index) => (
                      <Cell key={`cell-${index}`} fill={['#1d335b', '#c9504c', '#4f46e5', '#059669', '#dc2626', '#ea580c'][index % 6]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [value, 'Funcionários']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
