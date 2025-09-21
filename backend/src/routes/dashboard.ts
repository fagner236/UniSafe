import express from 'express';
import { PrismaClient } from '@prisma/client';
import { auth, AuthRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Função para formatar datas no formato DD/MM/AAAA
const formatDate = (date: Date | null, columnName?: string): string => {
  if (!date) return '-';
  
  // Para DATA_CRIACAO e DATA_ATUALIZACAO, usar o comportamento anterior que estava correto
  if (columnName === 'data_criacao' || columnName === 'data_atualizacao') {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }
  
  // Para outras colunas de data, usar a correção para evitar perda de dias
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'UTC' // Forçar uso de UTC para evitar conversões de fuso horário
  });
};

// Função para formatar valores monetários no formato brasileiro (R$)
const formatCurrency = (value: number | null | undefined): string => {
  if (value === null || value === undefined || isNaN(value)) return 'R$ 0,00';
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};

// Função para extrair mês/ano de uma string de mês (otimizada)
const extractMonthYear = (mes: string | null): string => {
  if (!mes) return '';
  
  // Tentar diferentes formatos de mês/ano
  const formats = [
    /(\d{1,2})\/(\d{4})/,  // MM/YYYY ou M/YYYY
    /(\d{1,2})-(\d{4})/,   // MM-YYYY ou M-YYYY
    /(\d{4})-(\d{1,2})/,   // YYYY-MM ou YYYY-M
    /(\d{4})\/(\d{1,2})/,  // YYYY/MM ou YYYY/M
  ];
  
  for (const format of formats) {
    const match = mes.match(format);
    if (match) {
      const [, part1, part2] = match;
      // Se o primeiro grupo tem 4 dígitos, é ano
      if (part1.length === 4) {
        return `${part2.padStart(2, '0')}/${part1}`;
      } else {
        return `${part1.padStart(2, '0')}/${part2}`;
      }
    }
  }
  
  return mes; // Retornar como está se não conseguir extrair
};

// Função para encontrar o mês/ano mais recente
const findLatestMonthYear = (records: any[]): string => {
  if (records.length === 0) return '';
  
  const monthYears = records
    .map(record => extractMonthYear(record.mes))
    .filter(monthYear => monthYear !== '');
  
  if (monthYears.length === 0) return '';
  
  // Converter para objetos Date para comparação
  const monthYearDates = monthYears.map(monthYear => {
    const [month, year] = monthYear.split('/');
    return {
      monthYear,
      date: new Date(parseInt(year), parseInt(month) - 1, 1)
    };
  });
  
  // Encontrar o mais recente
  const latest = monthYearDates.reduce((latest, current) => {
    return current.date > latest.date ? current : latest;
  });
  
  return latest.monthYear;
};

// Função para obter todos os meses/anos disponíveis (otimizada)
const getAvailableMonths = (records: any[]): string[] => {
  if (records.length === 0) return [];
  
  const monthYears = records
    .map(record => extractMonthYear(record.mes))
    .filter(monthYear => monthYear !== '');
  
  if (monthYears.length === 0) return [];
  
  // Remover duplicatas e ordenar por data (mais recente primeiro)
  const uniqueMonthYears = [...new Set(monthYears)];
  
  const monthYearDates = uniqueMonthYears.map(monthYear => {
    const [month, year] = monthYear.split('/');
    return {
      monthYear,
      date: new Date(parseInt(year), parseInt(month) - 1, 1)
    };
  });
  
  // Ordenar por data (mais recente primeiro)
  monthYearDates.sort((a, b) => b.date.getTime() - a.date.getTime());
  
  return monthYearDates.map(item => item.monthYear);
};

// GET /api/dashboard/base-dados - Versão otimizada para melhor performance
router.get('/base-dados', auth, async (req: AuthRequest, res) => {
  try {
    const startTime = Date.now();
    console.log('🚀 Iniciando busca de dados do dashboard...');
    
    const userBaseSindical = req.user?.base_sindical;
    const userCompanyId = req.user?.id_empresa;
    const selectedMonthYear = req.query.monthYear as string;
    const selectedBaseSindical = req.query.baseSindical as string;
    const page = parseInt(req.query.page as string) || 1;
    
    // Verificar se é admin da empresa dona do sistema
    const isOwnerByCNPJ = req.user?.empresa?.cnpj === '41.115.030/0001-20' && req.user?.perfil === 'admin';
    const isOwnerByID = userCompanyId === 'cmeqd06530000xvojyzk5f2qn' && req.user?.perfil === 'admin';
    const isOwnerCompanyAdmin = isOwnerByCNPJ || isOwnerByID;
    
    console.log('🔍 Usuário:', req.user?.email, 'Admin:', isOwnerCompanyAdmin);
    
    // Construir filtros de forma mais eficiente
    let whereClause: any = {};
    
    // Todos os usuários (incluindo dono do sistema) usam sua base sindical como padrão
    if (!userBaseSindical) {
      return res.status(400).json({
        success: false,
        message: 'Usuário não possui base sindical configurada'
      });
    }
    
    // Se o dono do sistema escolheu uma base específica, usar ela
    if (isOwnerCompanyAdmin && selectedBaseSindical) {
      whereClause.base_sindical = selectedBaseSindical;
    } else if (selectedBaseSindical) {
      // Se qualquer usuário especificou uma base sindical, usar ela
      whereClause.base_sindical = selectedBaseSindical;
    } else {
      // Caso contrário, usar a base sindical do usuário
      whereClause.base_sindical = userBaseSindical;
    }
    
    // Remover paginação para todas as bases sindicais - carregar todos os registros do mês
    const limit = undefined; // Sem limite para todas as bases
    const skip = 0; // Sem paginação
    
    // Buscar dados com filtros otimizados e paginação
    console.log('📊 Buscando dados com filtros:', whereClause);
    
    // Primeiro, buscar apenas o total de registros para estatísticas
    const totalCount = await prisma.baseDados.count({
      where: whereClause
    });
    
    // Buscar dados - sem paginação para todas as bases sindicais
    const allBaseDados = await prisma.baseDados.findMany({
      where: whereClause,
      select: {
        id: true,
        mes: true,
        data_criacao: true,
        nome: true,
        matricula: true,
        data_nasc: true,
        data_admissao: true,
        data_afast: true,
        valor_mensalidade: true,
        base_sindical: true,
        data_atualizacao: true,
        se: true,
        lotacao: true,
        municipio: true,
        sexo: true,
        raca: true,
        grau_instrucao: true,
        cargo: true,
        cargo_esp: true,
        cargo_nivel: true,
        funcao: true,
        jornada_trab: true,
        tipo_deficiencia: true,
        motivo_afast: true,
        filiado: true
      },
      orderBy: { data_criacao: 'desc' }
    });
    
    console.log(`📊 Carregando TODOS os registros da base sindical: ${allBaseDados.length} registros`);

    if (allBaseDados.length === 0) {
      return res.json({
        success: true,
        data: {
          employees: [],
          columns: [],
          summary: {
            totalRecords: 0,
            validRecords: 0,
            invalidRecords: 0,
            companies: [],
            departments: [],
            averageSalary: 0
          },
          errors: [],
          uploadedAt: new Date().toISOString(),
          fileName: 'Nenhum dado encontrado na base_dados',
          dataSource: 'base_dados',
          pagination: null
        }
      });
    }

    // Identificar o mês/ano a ser usado
    const targetMonthYear = selectedMonthYear || findLatestMonthYear(allBaseDados);
    console.log('📅 Mês/Ano selecionado:', targetMonthYear);
    
    // Obter bases sindicais disponíveis (apenas para admin)
    let availableBasesSindicais: string[] = [];
    if (isOwnerCompanyAdmin) {
      // Dono do sistema pode ver todas as bases sindicais disponíveis
      const basesSindicais = await prisma.baseDados.findMany({
        select: { base_sindical: true },
        distinct: ['base_sindical'],
        orderBy: { base_sindical: 'asc' }
      });
      availableBasesSindicais = basesSindicais
        .map(b => b.base_sindical)
        .filter(Boolean)
        .sort();
    } else {
      // Outros usuários veem apenas sua própria base sindical
      availableBasesSindicais = [userBaseSindical];
    }

    // Filtrar dados do mês/ano selecionado
    const baseDados = allBaseDados.filter(record => {
      const recordMonthYear = extractMonthYear(record.mes);
      return recordMonthYear === targetMonthYear;
    });
    
    console.log(`📊 Registros do mês selecionado: ${baseDados.length}`);

    if (baseDados.length === 0) {
      return res.json({
        success: true,
        data: {
          employees: [],
          columns: [],
          summary: {
            totalRecords: 0,
            validRecords: 0,
            invalidRecords: 0,
            companies: [],
            departments: [],
            averageSalary: 0
          },
          errors: [],
          uploadedAt: new Date().toISOString(),
          fileName: 'Nenhum dado encontrado na base_dados',
          dataSource: 'base_dados'
        }
      });
    }

    // Definir a ordem das colunas conforme o schema do banco (excluindo apenas o ID)
    const columnOrder = [
      'mes',
      'se',
      'lotacao',
      'municipio',
      'matricula',
      'nome',
      'sexo',
      'data_nasc',
      'raca',
      'grau_instrucao',
      'data_admissao',
      'cargo',
      'cargo_esp',
      'cargo_nivel',
      'funcao',
      'jornada_trab',
      'tipo_deficiencia',
      'data_afast',
      'motivo_afast',
      'base_sindical',
      'filiado',
      'valor_mensalidade',
      'data_criacao',
      'data_atualizacao'
    ];

    // Processar dados de forma otimizada com chunking para melhor performance
    console.log('⚡ Processando dados...');
    
    // Otimização para todas as bases sindicais - chunking para melhor performance
    const chunkSize = 1000; // Chunks otimizados para todas as bases
    
    const processDataInChunks = (data: any[], chunkSize: number = 1000) => {
      const employees: any[] = [];
      
      for (let i = 0; i < data.length; i += chunkSize) {
        const chunk = data.slice(i, i + chunkSize);
        
        const processedChunk = chunk.map(record => {
          const employee: any = {};
          
          // Mapear campos de forma otimizada
          for (const column of columnOrder) {
            const fieldValue = record[column as keyof typeof record];
            
            if (column === 'valor_mensalidade') {
              const numericValue = fieldValue ? parseFloat(fieldValue.toString()) : 0;
              employee[column] = formatCurrency(numericValue);
            } else if (['data_nasc', 'data_admissao', 'data_afast', 'data_criacao', 'data_atualizacao'].includes(column)) {
              employee[column] = formatDate(fieldValue as Date, column);
            } else {
              employee[column] = fieldValue;
            }
          }
          
          // Adicionar campos de compatibilidade
          employee.company = 'Empresa Principal';
          employee.department = record.lotacao || 'Não informado';
          employee.salary = record.valor_mensalidade ? parseFloat(record.valor_mensalidade.toString()) : 0;
          employee.status = 'Ativo';
          
          return employee;
        });
        
        employees.push(...processedChunk);
        
        // Log de progresso para bases com muitos registros
        if (data.length > 5000) {
          console.log(`⚡ Processados ${Math.min(i + chunkSize, data.length)} de ${data.length} registros`);
        }
      }
      
      return employees;
    };
    
    const employees = processDataInChunks(baseDados, chunkSize);

    // Calcular estatísticas de forma otimizada
    const companies = [...new Set(employees.map(emp => emp.company).filter(Boolean))];
    const departments = [...new Set(employees.map(emp => emp.department).filter(Boolean))];
    const averageSalary = employees.length > 0 
      ? employees.reduce((sum, emp) => sum + (emp.salary || 0), 0) / employees.length 
      : 0;
    
    const availableMonths = getAvailableMonths(allBaseDados);
    // Para donos do sistema, usar a base sindical do usuário se não especificada
    const finalBaseSindical = selectedBaseSindical || (isOwnerCompanyAdmin ? userBaseSindical : null);
    
    const endTime = Date.now();
    console.log(`✅ Processamento concluído em ${endTime - startTime}ms`);

    return res.json({
      success: true,
      data: {
        employees,
        columns: columnOrder,
        summary: {
          totalRecords: employees.length,
          validRecords: employees.length,
          invalidRecords: 0,
          companies,
          departments,
          averageSalary
        },
        errors: [],
        uploadedAt: baseDados[0]?.data_criacao?.toISOString() || new Date().toISOString(),
        fileName: 'Dados da Base de Dados',
        dataSource: 'base_dados',
        selectedMonthYear: targetMonthYear,
        totalRecordsInDatabase: totalCount,
        filteredRecords: baseDados.length,
        availableMonths: availableMonths,
        availableBasesSindicais: availableBasesSindicais,
        selectedBaseSindical: finalBaseSindical,
        processingTime: endTime - startTime,
        pagination: null
      }
    });
  } catch (error) {
    console.error('Erro ao buscar dados da base_dados:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// GET /api/dashboard/stats - Modificado para priorizar dados da base_dados
router.get('/stats', auth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id_usuario;
    const companyId = req.user!.id_empresa;

    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: 'Usuário não possui empresa vinculada'
      });
    }

    // Primeiro, tentar buscar dados da tabela base_dados
    let baseDadosCount = 0;
    let baseDadosStats = null;

    try {
      const userBaseSindical = req.user?.base_sindical;
      const userCompanyId = req.user?.id_empresa;
      
      // Verificar se é admin da empresa dona do sistema (Evia)
      const isOwnerByCNPJ = req.user?.empresa?.cnpj === '41.115.030/0001-20' && req.user?.perfil === 'admin';
      const isOwnerByID = userCompanyId === 'cmeqd06530000xvojyzk5f2qn' && req.user?.perfil === 'admin';
      const isOwnerCompanyAdmin = isOwnerByCNPJ || isOwnerByID;
      
      let baseDados;
      
      if (isOwnerCompanyAdmin) {
        // Admin da empresa dona do sistema vê todos os dados
        console.log('🔍 Admin da empresa dona do sistema - buscando TODOS os dados para estatísticas');
        baseDados = await prisma.baseDados.findMany();
      } else if (userBaseSindical) {
        // Outros usuários veem apenas dados da sua base sindical
        baseDados = await prisma.baseDados.findMany({
          where: {
            base_sindical: userBaseSindical
          }
        });
      }
      
      if (baseDados) {
        baseDadosCount = baseDados.length;

        if (baseDadosCount > 0) {
        // Calcular estatísticas da base_dados
        const activeEmployees = baseDados.filter(emp => {
          // Verificar se há data de afastamento
          if (emp.data_afast && emp.data_afast < new Date()) {
            return false;
          }
          return true;
        }).length;

        const inactiveEmployees = baseDadosCount - activeEmployees;

        // Calcular salário médio
        const totalSalary = baseDados.reduce((sum, emp) => {
          const salary = emp.valor_mensalidade ? parseFloat(emp.valor_mensalidade.toString()) : 0;
          return sum + salary;
        }, 0);
        const averageSalary = baseDadosCount > 0 ? totalSalary / baseDadosCount : 0;

        // Contar departamentos únicos
        const departments = new Set<string>();
        baseDados.forEach(emp => {
          if (emp.lotacao) {
            departments.add(emp.lotacao);
          }
        });

        baseDadosStats = {
          totalEmployees: baseDadosCount,
          activeEmployees,
          inactiveEmployees,
          pendingEmployees: 0,
          totalCompanies: 1,
          totalDepartments: departments.size,
          averageSalary,
          recentUploads: 0,
          dataSource: 'base_dados'
        };
        }
      }
    } catch (error) {
      console.log('Erro ao buscar dados da base_dados, tentando employee_data:', error);
    }

    // Se não houver dados na base_dados, buscar do upload mais recente
    if (!baseDadosStats) {
      const latestUpload = await prisma.upload.findFirst({
        where: { 
          id_empresa: companyId,
          status: { in: ['completed', 'completed_with_errors'] }
        },
        orderBy: { uploadedAt: 'desc' },
        select: { id: true }
      });

      if (!latestUpload) {
        return res.json({
          success: true,
          data: {
            totalEmployees: 0,
            activeEmployees: 0,
            inactiveEmployees: 0,
            pendingEmployees: 0,
            totalCompanies: 1,
            totalDepartments: 0,
            averageSalary: 0,
            recentUploads: 0,
            dataSource: 'employee_data'
          }
        });
      }

      // Buscar dados dos funcionários apenas do upload mais recente
      const employeeData = await prisma.employeeData.findMany({
        where: { 
          id_empresa: companyId,
          uploadId: latestUpload.id
        },
        select: { employeeData: true }
      });

      // Processar dados para estatísticas
      const employees = employeeData.map(ed => ed.employeeData as any);
      
      // Calcular estatísticas
      const totalEmployees = employees.length;
      const activeEmployees = employees.filter(emp => {
        // Verificar se há coluna de status ou situação
        const statusColumns = ['Status', 'Situacao', 'STATUS', 'SITUACAO', 'Ativo', 'ATIVO'];
        const statusCol = statusColumns.find(col => emp[col]);
        if (statusCol) {
          const status = String(emp[statusCol]).toLowerCase();
          return status.includes('ativo') || status.includes('at') || status === '1';
        }
        return true; // Se não encontrar coluna de status, considera ativo
      }).length;

      const inactiveEmployees = totalEmployees - activeEmployees;
      const pendingEmployees = 0; // Por enquanto, sempre 0

      // Calcular salário médio
      const salaryColumns = ['Salario', 'SALARIO', 'Salary', 'SALARY', 'Remuneracao', 'REMUNERACAO'];
      const totalSalary = employees.reduce((sum, emp) => {
        const salaryCol: string | undefined = salaryColumns.find(col => emp[col]);
        if (salaryCol && emp[salaryCol]) {
          const salary = parseFloat(String(emp[salaryCol]).replace(/[^\d,.-]/g, '').replace(',', '.')) || 0;
          return sum + salary;
        }
        return sum;
      }, 0);
      const averageSalary = totalEmployees > 0 ? totalSalary / totalEmployees : 0;

      // Contar departamentos únicos
      const departmentColumns = ['Departamento', 'DEPARTAMENTO', 'Department', 'DEPARTMENT', 'Setor', 'SETOR'];
      const departments = new Set<string>();
      employees.forEach(emp => {
        const deptCol: string | undefined = departmentColumns.find(col => emp[col]);
        if (deptCol && emp[deptCol]) {
          departments.add(String(emp[deptCol]));
        }
      });

      // Contar uploads recentes da empresa
      const recentUploads = await prisma.upload.count({
        where: { 
          empresa: { id_empresa: companyId },
          uploadedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        }
      });

      baseDadosStats = {
        totalEmployees,
        activeEmployees,
        inactiveEmployees,
        pendingEmployees,
        totalCompanies: 1, // Apenas a empresa do usuário
        totalDepartments: departments.size,
        averageSalary,
        recentUploads,
        dataSource: 'employee_data'
      };
    }

    return res.json({
      success: true,
      data: baseDadosStats
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// GET /api/dashboard/employees - Modificado para priorizar dados da base_dados
router.get('/employees', auth, async (req: AuthRequest, res) => {
  try {
    const companyId = req.user!.id_empresa;

    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: 'Usuário não possui empresa vinculada'
      });
    }

    // Primeiro, tentar buscar dados da tabela base_dados
    let baseDadosData = null;

    try {
      const userBaseSindical = req.user?.base_sindical;
      const userCompanyId = req.user?.id_empresa;
      
      // Verificar se é admin da empresa dona do sistema (Evia)
      const isOwnerByCNPJ = req.user?.empresa?.cnpj === '41.115.030/0001-20' && req.user?.perfil === 'admin';
      const isOwnerByID = userCompanyId === 'cmeqd06530000xvojyzk5f2qn' && req.user?.perfil === 'admin';
      const isOwnerCompanyAdmin = isOwnerByCNPJ || isOwnerByID;
      
      let baseDados;
      
      if (isOwnerCompanyAdmin) {
        // Admin da empresa dona do sistema vê todos os dados
        console.log('🔍 Admin da empresa dona do sistema - buscando TODOS os dados para employees');
        baseDados = await prisma.baseDados.findMany({
          orderBy: { data_criacao: 'desc' }
        });
      } else {
        // Outros usuários veem apenas dados da sua base sindical
        if (!userBaseSindical) {
          return res.status(400).json({
            success: false,
            message: 'Usuário não possui base sindical configurada'
          });
        }

        baseDados = await prisma.baseDados.findMany({
          where: {
            base_sindical: userBaseSindical
          },
          orderBy: { data_criacao: 'desc' }
        });
      }

      if (baseDados.length > 0) {
        // Definir a ordem das colunas conforme o schema do banco (excluindo apenas o ID)
        const columnOrder = [
          'mes',
          'se',
          'lotacao',
          'municipio',
          'matricula',
          'nome',
          'sexo',
          'data_nasc',
          'raca',
          'grau_instrucao',
          'data_admissao',
          'cargo',
          'cargo_esp',
          'cargo_nivel',
          'funcao',
          'jornada_trab',
          'tipo_deficiencia',
          'data_afast',
          'motivo_afast',
          'base_sindical',
          'filiado',
          'valor_mensalidade',
          'data_criacao',
          'data_atualizacao'
        ];

        // Converter dados da base_dados para o formato esperado pelo frontend
        const employees = baseDados.map(record => {
          const employee: any = {};
          
          // Mapear campos na ordem definida
          columnOrder.forEach(column => {
            const fieldValue = record[column as keyof typeof record];
            
            if (column === 'valor_mensalidade') {
              // Formatar campo de valor monetário no formato brasileiro (R$)
              console.log(`💰 Formatando valor monetário para coluna ${column}:`, fieldValue);
              const numericValue = fieldValue ? parseFloat(fieldValue.toString()) : 0;
              employee[column] = formatCurrency(numericValue);
              console.log(`✅ Valor formatado:`, employee[column]);
            } else if (column === 'data_nasc' || column === 'data_admissao' || column === 'data_afast' || column === 'data_criacao' || column === 'data_atualizacao') {
              // Formatar campos de data no formato DD/MM/AAAA
              console.log(`🔧 Formatando data para coluna ${column}:`, fieldValue);
              employee[column] = formatDate(fieldValue as Date, column);
              console.log(`✅ Data formatada:`, employee[column]);
            } else {
              employee[column] = fieldValue;
            }
          });

          // Adicionar campos de compatibilidade
          employee.company = 'Empresa Principal';
          employee.department = record.lotacao || 'Não informado';
          // Manter salary como número para cálculos estatísticos
          employee.salary = record.valor_mensalidade ? parseFloat(record.valor_mensalidade.toString()) : 0;
          employee.status = 'Ativo';

          return employee;
        });

        // Usar a ordem definida das colunas
        const columns = columnOrder;

        // Calcular estatísticas
        const companies = [...new Set(employees.map(emp => emp.company).filter(Boolean))];
        const departments = [...new Set(employees.map(emp => emp.department).filter(Boolean))];
        const averageSalary = employees.length > 0 
          ? employees.reduce((sum, emp) => sum + (emp.salary || 0), 0) / employees.length 
          : 0;

        baseDadosData = {
          employees,
          columns,
          summary: {
            totalRecords: employees.length,
            validRecords: employees.length,
            invalidRecords: 0,
            companies,
            departments,
            averageSalary
          },
          errors: [],
          uploadedAt: baseDados[0]?.data_criacao?.toISOString() || new Date().toISOString(),
          fileName: 'Dados da Base de Dados',
          dataSource: 'base_dados'
        };
      }
    } catch (error) {
      console.log('Erro ao buscar dados da base_dados, tentando employee_data:', error);
    }

    // Se não houver dados na base_dados, buscar do upload mais recente
    if (!baseDadosData) {
      const latestUpload = await prisma.upload.findFirst({
        where: { 
          id_empresa: companyId,
          status: { in: ['completed', 'completed_with_errors'] }
        },
        orderBy: { uploadedAt: 'desc' },
        select: {
          id: true,
          originalName: true,
          uploadedAt: true,
          status: true
        }
      });

      if (!latestUpload) {
        return res.json({
          success: true,
          data: {
            employees: [],
            columns: [],
            summary: {
              totalRecords: 0,
              validRecords: 0,
              invalidRecords: 0,
              companies: [],
              departments: [],
              averageSalary: 0
            },
            errors: [],
            uploadedAt: new Date().toISOString(),
            fileName: 'Nenhum arquivo encontrado',
            dataSource: 'employee_data'
          }
        });
      }

      // Buscar apenas os dados do upload mais recente
      const employeeData = await prisma.employeeData.findMany({
        where: { 
          id_empresa: companyId,
          uploadId: latestUpload.id
        },
        select: { 
          employeeData: true,
          processedAt: true
        }
      });

      // Processar dados para o formato esperado pelo frontend
      const employees = employeeData.map(ed => ed.employeeData as any);
      
      // Extrair colunas únicas
      const columns = employees.length > 0 ? Object.keys(employees[0]) : [];

      // Calcular estatísticas
      const companies = [...new Set(employees.map(emp => emp.company).filter(Boolean))];
      const departments = [...new Set(employees.map(emp => emp.department).filter(Boolean))];
      const averageSalary = employees.length > 0 
        ? employees.reduce((sum, emp) => {
            const salary = parseFloat(String(emp.salary || 0).replace(/[^\d,.-]/g, '').replace(',', '.')) || 0;
            return sum + salary;
          }, 0) / employees.length 
        : 0;

      baseDadosData = {
        employees,
        columns,
        summary: {
          totalRecords: employees.length,
          validRecords: employees.length,
          invalidRecords: 0,
          companies,
          departments,
          averageSalary
        },
        errors: [],
        uploadedAt: latestUpload.uploadedAt.toISOString(),
        fileName: latestUpload.originalName,
        dataSource: 'employee_data'
      };
    }

    return res.json({
      success: true,
      data: baseDadosData
    });
  } catch (error) {
    console.error('Erro ao buscar dados dos funcionários:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Debug endpoint para verificar usuário
router.get('/debug-user', auth, async (req: AuthRequest, res) => {
  try {
    const userCompanyId = req.user?.id_empresa;
    const isOwnerByCNPJ = req.user?.empresa?.cnpj === '41.115.030/0001-20' && req.user?.perfil === 'admin';
    const isOwnerByID = userCompanyId === 'cmeqd06530000xvojyzk5f2qn' && req.user?.perfil === 'admin';
    const isOwnerCompanyAdmin = isOwnerByCNPJ || isOwnerByID;
    
    const totalRecords = await prisma.baseDados.count();
    
    res.json({
      success: true,
      user: {
        id: req.user?.id_usuario,
        email: req.user?.email,
        perfil: req.user?.perfil,
        id_empresa: userCompanyId,
        empresa_cnpj: req.user?.empresa?.cnpj,
        empresa_razao_social: req.user?.empresa?.razao_social,
        base_sindical: req.user?.base_sindical
      },
      verification: {
        isOwnerByCNPJ,
        isOwnerByID,
        isOwnerCompanyAdmin
      },
      database: {
        totalRecords
      }
    });
  } catch (error) {
    console.error('Erro no debug:', error);
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' });
  }
});

export default router;
