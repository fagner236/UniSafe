import { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { 
  Users, 
  FileText, 
  DollarSign,
  User,
  Gift
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const Dashboard = () => {
  const { processedData, hasData } = useData();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hour = date.getHours().toString().padStart(2, '0');
    const minute = date.getMinutes().toString().padStart(2, '0');
    
    return `${day}/${month}/${year} às ${hour}h${minute}`;
  };

  // Função para calcular estatísticas por empresa
  const getCompanyStats = () => {
    if (!processedData) return [];
    
    const companyStats = processedData.employees.reduce((acc, emp) => {
      if (!emp.company) return acc;
      
      if (!acc[emp.company]) {
        acc[emp.company] = {
          name: emp.company,
          count: 0,
          totalSalary: 0,
          departments: new Set()
        };
      }
      
      acc[emp.company].count++;
      acc[emp.company].totalSalary += emp.salary || 0;
      if (emp.department) {
        acc[emp.company].departments.add(emp.department);
      }
      
      return acc;
    }, {} as Record<string, { name: string; count: number; totalSalary: number; departments: Set<string> }>);
    
    return Object.values(companyStats).map(stat => ({
      ...stat,
      averageSalary: stat.totalSalary / stat.count,
      departmentCount: stat.departments.size
    }));
  };

  // Função para calcular estatísticas por departamento
  const getDepartmentStats = () => {
    if (!processedData) return [];
    
    const deptStats = processedData.employees.reduce((acc, emp) => {
      if (!emp.department) return acc;
      
      if (!acc[emp.department]) {
        acc[emp.department] = {
          name: emp.department,
          count: 0,
          totalSalary: 0
        };
      }
      
      acc[emp.department].count++;
      acc[emp.department].totalSalary += emp.salary || 0;
      
      return acc;
    }, {} as Record<string, { name: string; count: number; totalSalary: number }>);
    
    return Object.values(deptStats).map(stat => ({
      ...stat,
      averageSalary: stat.totalSalary / stat.count
    }));
  };

  // Função para calcular estatísticas por SE (Sindicato/Entidade)
  const getSEStats = () => {
    if (!processedData) return [];
    
    // Procura pela coluna SE nos dados
    const seColumn = processedData.columns.find(col => 
      col.toLowerCase().includes('se') || 
      col.toLowerCase().includes('sindicato') || 
      col.toLowerCase().includes('entidade')
    );
    
    // Procura pela coluna VALOR MENSALIDADE
    const mensalidadeColumn = processedData.columns.find(col => 
      col.toLowerCase().includes('valor') && col.toLowerCase().includes('mensalidade')
    );
    
    if (!seColumn) {
      return [];
    }
    
    const seStats = processedData.employees.reduce((acc, emp) => {
      // Acessa o valor da coluna SE dinamicamente
      const seValue = (emp as any)[seColumn] || 'Não informado';
      
      // Acessa o valor da mensalidade dinamicamente
      const mensalidadeValue = mensalidadeColumn ? (emp as any)[mensalidadeColumn] : 0;
      const mensalidade = typeof mensalidadeValue === 'number' ? mensalidadeValue : 
                         typeof mensalidadeValue === 'string' ? parseFloat(mensalidadeValue.replace(/[^\d,.-]/g, '').replace(',', '.')) || 0 : 0;
      
      if (!acc[seValue]) {
        acc[seValue] = {
          name: seValue,
          count: 0,
          totalMensalidade: 0
        };
      }
      
      acc[seValue].count++;
      acc[seValue].totalMensalidade += mensalidade;
      
      return acc;
    }, {} as Record<string, { name: string; count: number; totalMensalidade: number }>);
    
    // Retorna as estatísticas ordenadas por quantidade de efetivo (decrescente)
    return Object.values(seStats)
      .map(stat => ({
        ...stat,
        averageMensalidade: stat.totalMensalidade / stat.count
      }))
      .sort((a, b) => b.count - a.count);
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
      
      if (!acc[municipalityValue]) {
        acc[municipalityValue] = {
          name: municipalityValue,
          count: 0,
          totalMensalidade: 0
        };
      }
      
      acc[municipalityValue].count++;
      acc[municipalityValue].totalMensalidade += mensalidade;
      
      return acc;
    }, {} as Record<string, { name: string; count: number; totalMensalidade: number }>);
    
    // Retorna apenas as 10 cidades com maior número de empregados, ordenadas por count decrescente
    return Object.values(municipalityStats)
      .map(stat => ({
        ...stat,
        averageMensalidade: stat.totalMensalidade / stat.count
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
      
      if (!acc[locationValue]) {
        acc[locationValue] = {
          name: locationValue,
          count: 0,
          totalMensalidade: 0
        };
      }
      
      acc[locationValue].count++;
      acc[locationValue].totalMensalidade += mensalidade;
      
      return acc;
    }, {} as Record<string, { name: string; count: number; totalMensalidade: number }>);
    
    // Retorna apenas as 10 unidades com maior número de empregados, ordenadas por count decrescente
    return Object.values(locationStats)
      .map(stat => ({
        ...stat,
        averageMensalidade: stat.totalMensalidade / stat.count
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
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

  // Função para calcular estatísticas por faixa salarial


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
    
    if (!cargoColumn) return [];
    
    const cargoStats = processedData.employees.reduce((acc, emp) => {
      const cargo = emp[cargoColumn as keyof typeof emp] as string;
      if (!cargo) return acc;
      
      if (!acc[cargo]) {
        acc[cargo] = { name: cargo, count: 0 };
      }
      acc[cargo].count++;
      return acc;
    }, {} as Record<string, { name: string; count: number }>);
    
    return Object.values(cargoStats)
      .map(stat => ({
        ...stat,
        percentage: processedData.summary.validRecords > 0 ? (stat.count / processedData.summary.validRecords) * 100 : 0
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
    
    if (!nivelColumn) return [];
    
    const nivelStats = processedData.employees.reduce((acc, emp) => {
      const nivel = emp[nivelColumn as keyof typeof emp] as string;
      if (!nivel) return acc;
      
      if (!acc[nivel]) {
        acc[nivel] = { name: nivel, count: 0 };
      }
      acc[nivel].count++;
      return acc;
    }, {} as Record<string, { name: string; count: number }>);
    
    return Object.values(nivelStats)
      .map(stat => ({
        ...stat,
        percentage: processedData.summary.validRecords > 0 ? (stat.count / processedData.summary.validRecords) * 100 : 0
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
    
    if (!funcaoColumn) return [];
    
    const funcaoStats = processedData.employees.reduce((acc, emp) => {
      const funcao = emp[funcaoColumn as keyof typeof emp] as string;
      if (!funcao) return acc;
      
      if (!acc[funcao]) {
        acc[funcao] = { name: funcao, count: 0 };
      }
      acc[funcao].count++;
      return acc;
    }, {} as Record<string, { name: string; count: number }>);
    
    return Object.values(funcaoStats)
      .map(stat => ({
        ...stat,
        percentage: processedData.summary.validRecords > 0 ? (stat.count / processedData.summary.validRecords) * 100 : 0
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
      if (!jornada) return acc;
      
      if (!acc[jornada]) {
        acc[jornada] = { name: jornada, count: 0 };
      }
      acc[jornada].count++;
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

  // Estado para controle da semana selecionada
  const [selectedWeekOffset, setSelectedWeekOffset] = useState(0);

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
              month: date.getMonth() // Para ordenação por mês
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

  if (!hasData) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#1d335b' }}>Dashboard</h1>
          <p className="text-gray-600">
            Faça upload de um arquivo para visualizar as informações no dashboard
          </p>
        </div>
        
        <div className="card">
          <div className="card-content">
            <div className="text-center py-12">
              <FileText className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum arquivo carregado
              </h3>
              <p className="text-gray-500 mb-6">
                Para visualizar o dashboard, faça upload de um arquivo Excel ou CSV na página de Upload.
              </p>
              <a
                href="/upload"
                className="inline-flex items-center px-4 py-2 rounded-lg text-white font-medium transition-colors"
                style={{ backgroundColor: '#1d335b' }}
              >
                Ir para Upload
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!processedData) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#1d335b' }}>Dashboard</h1>
          <p className="text-red-600">Erro: Dados não processados</p>
        </div>
      </div>
    );
  }

  const companyStats = getCompanyStats();
  const departmentStats = getDepartmentStats();
  const seStats = getSEStats();
  const municipalityStats = getMunicipalityStats();
  const locationStats = getLocationStats();
  const genderStats = getGenderStats();
  const raceStats = getRaceStats();

  const mensalidadeStats = getMensalidadeStats();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: '#1d335b' }}>Dashboard</h1>
        <p className="text-gray-600">
          Análise dos dados carregados em {formatDate(processedData.uploadedAt)}
        </p>
        <p className="text-sm text-gray-500">
          Arquivo: {processedData.fileName}
        </p>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <Users className="h-8 w-8" style={{ color: '#1d335b' }} />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total de Registros</p>
                <p className="text-2xl font-bold" style={{ color: '#1d335b' }}>
                  {processedData.summary.totalRecords.toLocaleString('pt-BR')}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <User className="h-8 w-8" style={{ color: '#1d335b' }} />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Distribuição por Gênero</p>
                <p className="text-2xl font-bold" style={{ color: '#1d335b' }}>
                  {genderStats.length > 0 ? genderStats.length : 0} categorias
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <Users className="h-8 w-8" style={{ color: '#1d335b' }} />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Distribuição por Raça</p>
                <p className="text-2xl font-bold" style={{ color: '#1d335b' }}>
                  {raceStats.length > 0 ? raceStats.length : 0} categorias
                </p>
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
      </div>
      
      {/* Estatísticas por Departamento */}
      {departmentStats.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium" style={{ color: '#1d335b' }}>Estatísticas por Departamento</h3>
          </div>
          <div className="card-content">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {departmentStats.map((dept, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-900">{dept.name}</h4>
                    <span className="text-xs text-gray-500">{dept.count} funcionários</span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-600">
                      Salário médio: {formatCurrency(dept.averageSalary)}
                    </p>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full transition-all duration-300"
                        style={{ 
                          backgroundColor: '#1d335b',
                          width: `${(dept.count / Math.max(...departmentStats.map(d => d.count))) * 100}%`
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
      
      {/* Estatísticas por SE (Sindicato/Entidade) */}
      {seStats.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium" style={{ color: '#1d335b' }}>Estatísticas por SE (Sindicato/Entidade)</h3>
          </div>
          <div className="card-content">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SE</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Funcionários</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Filiação Média</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Distribuição</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {seStats.map((se, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {se.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {se.count.toLocaleString('pt-BR')}
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
                                width: `${(se.count / Math.max(...seStats.map(s => s.count))) * 100}%`
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
            </div>
          </div>
        </div>
      )}

      {/* Análise por Municípios */}
      {municipalityStats.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium" style={{ color: '#1d335b' }}>Top 10 Municípios</h3>
          </div>
          <div className="card-content">
            <div>
              <p className="text-sm text-gray-600 mb-4">
                Mostrando as 10 cidades com maior número de funcionários
              </p>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Município</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Funcionários</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Filiação Média</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Distribuição</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {municipalityStats.map((municipality, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {municipality.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {municipality.count.toLocaleString('pt-BR')}
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
                                  width: `${(municipality.count / Math.max(...municipalityStats.map(m => m.count))) * 100}%`
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
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Análise por Unidades de Lotação */}
      {locationStats.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium" style={{ color: '#1d335b' }}>Top 10 Unidades de Lotação</h3>
          </div>
          <div className="card-content">
            <div>
              <p className="text-sm text-gray-600 mb-4">
                Mostrando as 10 unidades com maior número de funcionários
              </p>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unidade</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Funcionários</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Filiação Média</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Distribuição</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {locationStats.map((location, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {location.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {location.count.toLocaleString('pt-BR')}
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
                                  width: `${(location.count / Math.max(...locationStats.map(l => l.count))) * 100}%`
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
                  <div key={cargo.name} className="relative overflow-hidden rounded-lg border border-gray-300 hover:shadow-md hover:border-[#1d335b] transition-all duration-300 min-h-[100px] lg:min-h-[120px]">
                    <div className={`${colors[index % colors.length]} p-3 ${textColors[index % textColors.length]} text-center h-full flex flex-col justify-center`}>
                      <div className="space-y-1 flex-1 flex flex-col justify-center">
                        <h4 className="font-semibold text-xs truncate leading-tight mb-1">{cargo.name}</h4>
                        <div className="text-lg lg:text-xl font-bold mb-1">{cargo.percentage.toFixed(1)}%</div>
                        <p className="text-xs opacity-90">{cargo.count.toLocaleString('pt-BR')} funcionários</p>
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
                        <div className={`relative z-10 bg-white border-2 border-gray-200 rounded-xl p-4 hover:shadow-lg hover:border-[#c9504c] transition-all duration-300 ${isEven ? 'lg:transform lg:-translate-y-2' : 'lg:transform lg:translate-y-2'}`}>
                          {/* Indicador de nível */}
                          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-6 h-6 rounded-full border-2 border-white shadow-md flex items-center justify-center">
                            <div className={`w-3 h-3 rounded-full ${isEven ? 'bg-[#c9504c]' : 'bg-[#ffc9c0]'}`}></div>
                          </div>
                          
                          {/* Conteúdo do card */}
                          <div className="text-center space-y-3">
                            <h4 className="font-bold text-sm text-gray-800 truncate leading-tight">{nivel.name}</h4>
                            <div className="text-2xl font-bold text-[#c9504c]">{nivel.percentage.toFixed(1)}%</div>
                            <p className="text-xs text-gray-600">{nivel.count.toLocaleString('pt-BR')} funcionários</p>
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
                  <div key={funcao.name} className={`${colors[index % colors.length]} ${textColors[index % textColors.length]} rounded-xl p-4 hover:shadow-md transition-all duration-300`}>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-sm truncate">{funcao.name}</h4>
                      <span className="text-xs opacity-75">#{index + 1}</span>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold mb-1">{funcao.count.toLocaleString('pt-BR')}</div>
                      <div className="text-sm opacity-75">funcionários</div>
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
                    
                    return (
                      <div
                        key={jornada.name}
                        data-jornada={jornada.name}
                        className="absolute inset-0 rounded-full"
                        style={{
                          background: `conic-gradient(from ${startAngle}deg, ${colors[index % colors.length]} 0deg, ${colors[index % colors.length]} ${angle}deg, transparent ${angle}deg)`
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
                  
                  return (
                    <div 
                      key={jornada.name} 
                      className="flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all duration-300 hover:bg-gray-50 hover:shadow-md hover:scale-105 group"
                      onMouseEnter={() => {
                        // Destacar a fatia correspondente no gráfico
                        const fatia = document.querySelector(`[data-jornada="${jornada.name}"]`);
                        if (fatia) {
                          fatia.classList.add('ring-4', 'ring-white', 'ring-opacity-50');
                        }
                      }}
                      onMouseLeave={() => {
                        // Remover destaque da fatia
                        const fatia = document.querySelector(`[data-jornada="${jornada.name}"]`);
                        if (fatia) {
                          fatia.classList.remove('ring-4', 'ring-white', 'ring-opacity-50');
                        }
                      }}
                    >
                      <div 
                        className="w-4 h-4 rounded-full transition-transform duration-300 group-hover:scale-125"
                        style={{ backgroundColor: colors[index % colors.length] }}
                      ></div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm truncate group-hover:text-[#1d335b] transition-colors duration-300">{jornada.name}</span>
                          <span className="text-sm font-bold text-gray-700 group-hover:text-[#c9504c] transition-colors duration-300">{jornada.count.toLocaleString('pt-BR')}</span>
                        </div>
                        <div className="text-xs text-gray-500 group-hover:text-[#2f4a8c] transition-colors duration-300">{jornada.percentage.toFixed(1)}% do total</div>
                      </div>
                      
                      {/* Indicador de hover */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
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
                {getBirthdayStats().map((month, index) => {
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
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
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
                                {todaysBirthdays.length} aniversariante{todaysBirthdays.length !== 1 ? 's' : ''} hoje!
                              </span>
                            </div>
                          );
                        }
                        return null;
                      })()}
                    </div>
                    
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
                            {getWeeklyBirthdays(selectedWeekOffset).length} aniversariante{getWeeklyBirthdays(selectedWeekOffset).length !== 1 ? 's' : ''} na semana
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
                  <div className="mt-3 text-sm text-gray-500 text-center">
                    Total de {getWeeklyBirthdays(selectedWeekOffset).length} aniversariante{getWeeklyBirthdays(selectedWeekOffset).length !== 1 ? 's' : ''} na semana selecionada
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
                               Hoje é aniversário de <strong>{todaysBirthdays.length} funcionário{todaysBirthdays.length !== 1 ? 's' : ''}</strong>!
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
        {/* Gráfico de Barras - Funcionários por Empresa */}
        {companyStats.length > 0 && (
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium" style={{ color: '#1d335b' }}>Funcionários por Empresa</h3>
            </div>
            <div className="card-content">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={companyStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip formatter={(value) => [value, 'Funcionários']} />
                  <Bar dataKey="count" fill="#1d335b" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Gráfico de Linha - Salário Médio por Departamento */}
        {departmentStats.length > 0 && (
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium" style={{ color: '#1d335b' }}>Salário Médio por Departamento</h3>
            </div>
            <div className="card-content">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={departmentStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => [formatCurrency(value as number), 'Salário Médio']} />
                  <Line type="monotone" dataKey="averageSalary" stroke="#c9504c" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}



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
                    label={({ percentage }: { percentage: number }) => `${percentage.toFixed(1)}%`}
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

      {/* Informações sobre as colunas */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium" style={{ color: '#1d335b' }}>Colunas Detectadas</h3>
        </div>
        <div className="card-content">
          <div className="flex flex-wrap gap-2">
            {processedData.columns.map((column, index) => (
              <span 
                key={index} 
                className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full"
              >
                {column}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
