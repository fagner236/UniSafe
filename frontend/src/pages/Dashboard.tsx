import { useData } from '@/contexts/DataContext';
import { 
  Users, 
  FileText, 
  DollarSign,
  User
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

  // Função para calcular estatísticas por cargo/posição
  const getPositionStats = () => {
    if (!processedData) return [];
    
    const positionStats = processedData.employees.reduce((acc, emp) => {
      if (!emp.position) return acc;
      
      if (!acc[emp.position]) {
        acc[emp.position] = {
          name: emp.position,
          count: 0,
          totalSalary: 0,
          departments: new Set()
        };
      }
      
      acc[emp.position].count++;
      acc[emp.position].totalSalary += emp.salary || 0;
      if (emp.department) {
        acc[emp.position].departments.add(emp.department);
      }
      
      return acc;
    }, {} as Record<string, { name: string; count: number; totalSalary: number; departments: Set<string> }>);
    
    return Object.values(positionStats)
      .map(stat => ({
        ...stat,
        averageSalary: stat.totalSalary / stat.count,
        departmentCount: stat.departments.size,
        percentage: processedData.summary.validRecords > 0 ? (stat.count / processedData.summary.validRecords) * 100 : 0
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  };

  // Função para calcular estatísticas por faixa etária (baseada na data de admissão)
  const getAgeGroupStats = () => {
    if (!processedData) return [];
    
    const now = new Date();
    const ranges = [
      { min: 18, max: 25, label: '18-25 anos' },
      { min: 26, max: 35, label: '26-35 anos' },
      { min: 36, max: 45, label: '36-45 anos' },
      { min: 46, max: 55, label: '46-55 anos' },
      { min: 56, max: 65, label: '56-65 anos' },
      { min: 66, max: Infinity, label: 'Acima de 65 anos' }
    ];
    
    const ageStats = ranges.map(range => {
      const count = processedData.employees.filter(emp => {
        if (!emp.admissionDate) return false;
        
        const admissionDate = new Date(emp.admissionDate);
        const age = now.getFullYear() - admissionDate.getFullYear();
        const monthDiff = now.getMonth() - admissionDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < admissionDate.getDate())) {
          return age - 1 >= range.min && age - 1 < range.max;
        }
        
        return age >= range.min && age < range.max;
      }).length;
      
      return {
        range: range.label,
        count,
        percentage: processedData.summary.validRecords > 0 ? (count / processedData.summary.validRecords) * 100 : 0
      };
    }).filter(stat => stat.count > 0);
    
    return ageStats;
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

      {/* Estatísticas por Cargo/Posição */}
      {getPositionStats().length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium" style={{ color: '#1d335b' }}>Top 10 Cargos/Posições</h3>
          </div>
          <div className="card-content">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cargo</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Funcionários</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Distribuição</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {getPositionStats().map((position, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {position.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {position.count.toLocaleString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="h-2 rounded-full transition-all duration-300"
                            style={{ 
                              backgroundColor: '#c9504c',
                              width: `${position.percentage}%`
                            }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-500">
                          {position.percentage.toFixed(1)}%
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

        {/* Gráfico de Barras - Top Cargos */}
        {getPositionStats().length > 0 && (
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium" style={{ color: '#1d335b' }}>Top 10 Cargos/Posições</h3>
            </div>
            <div className="card-content">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={getPositionStats()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip formatter={(value) => [value, 'Funcionários']} />
                  <Bar dataKey="count" fill="#4f46e5" />
                </BarChart>
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
