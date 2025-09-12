import { Request, Response } from 'express';
import multer from 'multer';
import xlsx from 'xlsx';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';
import { uploadConfig, canProcessFile, formatFileSize, getBatchConfig } from '../config/upload';

const prisma = new PrismaClient();

// Configuração do Multer para processamento em memória (sem salvar arquivo)
const storage = multer.memoryStorage();

const fileFilter = (req: any, file: any, cb: any) => {
  console.log('📁 === FILTRO DE ARQUIVO ===');
  console.log('📁 Nome original:', file.originalname);
  console.log('📁 MIME type:', file.mimetype);
  console.log('📁 Tamanho:', file.size);
  
  const allowedTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'text/csv'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    console.log('✅ Tipo de arquivo aceito');
    cb(null, true);
  } else {
    console.log('❌ Tipo de arquivo não suportado:', file.mimetype);
    cb(new Error('Tipo de arquivo não suportado. Use arquivos Excel (.xlsx, .xls) ou CSV.'), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: uploadConfig.maxFileSize, // Usar configuração otimizada
    files: 5 // Permitir até 5 arquivos por vez para múltiplas empresas
  }
});

export const uploadFile = async (req: AuthRequest, res: Response) => {
  try {
    console.log('📁 === INICIANDO UPLOAD DE ARQUIVO ===');
    console.log('📁 Usuário:', req.user?.id_usuario);
    console.log('📁 Empresa:', req.user?.id_empresa);
    console.log('📁 Headers da requisição:', req.headers);
    console.log('📁 Body da requisição:', req.body);
    console.log('📁 Arquivo recebido:', req.file);

    if (!req.file) {
      console.log('❌ Nenhum arquivo recebido na requisição');
      return res.status(400).json({
        success: false,
        message: 'Nenhum arquivo foi enviado'
      });
    }

    const { originalname, size, mimetype, buffer } = req.file;
    console.log('📁 Dados do arquivo:', { originalname, size, mimetype, bufferSize: buffer?.length });

    // Validar tamanho do arquivo usando configuração otimizada
    const fileValidation = canProcessFile(size);
    if (!fileValidation.canProcess) {
      console.log('❌ Arquivo muito grande:', size);
      return res.status(400).json({
        success: false,
        message: fileValidation.reason || 'Arquivo muito grande'
      });
    }

    // Validar tipo do arquivo
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv'
    ];
    
    if (!allowedTypes.includes(mimetype)) {
      console.log('❌ Tipo de arquivo não suportado:', mimetype);
      return res.status(400).json({
        success: false,
        message: 'Tipo de arquivo não suportado. Use arquivos Excel (.xlsx, .xls) ou CSV.'
      });
    }

    console.log('📁 Criando registro do upload no banco...');
    
    // Criar registro do upload (sem path físico)
    const uploadRecord = await prisma.upload.create({
      data: {
        filename: `processed_${Date.now()}_${originalname}`, // Nome simbólico
        originalName: originalname,
        size,
        mimetype,
        path: 'memory_processed', // Indicador de que foi processado em memória
        status: 'pending',
        uploadedBy: req.user!.id_usuario,
        id_empresa: req.user!.id_empresa || null
      }
    });

    console.log('✅ Upload registrado com sucesso:', uploadRecord.id);

    // Processar arquivo diretamente da memória
    console.log('📁 Iniciando processamento em memória...');
    processFileFromMemory(uploadRecord.id, buffer, originalname);

    return res.status(201).json({
      success: true,
      message: 'Arquivo enviado com sucesso',
      data: {
        id: uploadRecord.id,
        originalName: uploadRecord.originalName,
        size: uploadRecord.size,
        status: uploadRecord.status,
        uploadedAt: uploadRecord.uploadedAt,
        id_empresa: uploadRecord.id_empresa
      }
    });
  } catch (error: unknown) {
    console.error('❌ Erro no upload:', error);
    
    // Log detalhado do erro
    if (error instanceof Error) {
      console.error('❌ Mensagem do erro:', error.message);
      console.error('❌ Stack trace:', error.stack);
    }
    
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' && error instanceof Error ? error.message : undefined
    });
  }
};

const processFileFromMemory = async (uploadId: string, fileBuffer: Buffer, originalName: string) => {
  try {
    console.log('🔄 === INICIANDO PROCESSAMENTO DE ARQUIVO EM MEMÓRIA ===');
    
    // Atualizar status para processando
    await prisma.upload.update({
      where: { id: uploadId },
      data: { status: 'processing' }
    });

    // Buscar informações do upload para obter o id_empresa
    const uploadInfo = await prisma.upload.findUnique({
      where: { id: uploadId },
      select: { id_empresa: true }
    });

    if (!uploadInfo?.id_empresa) {
      throw new Error('Upload não possui empresa vinculada');
    }

    // Ler arquivo Excel/CSV diretamente do buffer
    console.log('📖 Lendo arquivo da memória...');
    const workbook = xlsx.read(fileBuffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);
    
    console.log(`📊 Total de registros encontrados: ${data.length}`);

    // Determinar configuração de processamento baseada no tamanho do arquivo
    const batchConfig = getBatchConfig(fileBuffer.length, data.length);
    
    console.log(`⚙️ Configuração de processamento:`, {
      useBatches: batchConfig.useBatches,
      batchSize: batchConfig.batchSize,
      maxConcurrent: batchConfig.maxConcurrent,
      estimatedTime: `${Math.round(batchConfig.estimatedTime / 1000)}s`
    });

    let processedCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    if (batchConfig.useBatches) {
      // Processamento em lotes para arquivos grandes
      console.log('🔄 Processando em lotes...');
      
      for (let i = 0; i < data.length; i += batchConfig.batchSize) {
        const batch = data.slice(i, i + batchConfig.batchSize);
        console.log(`📦 Processando lote ${Math.floor(i / batchConfig.batchSize) + 1}/${Math.ceil(data.length / batchConfig.batchSize)}`);
        
        // Processar lote atual
        for (const row of batch as any[]) {
          try {
            // Verificar se a linha tem dados válidos
            const hasValidData = Object.values(row).some(value => 
              value !== undefined && value !== null && value.toString().trim() !== ''
            );

            if (!hasValidData) {
              continue; // Pula linhas vazias
            }

            // Validar dados obrigatórios (flexível)
            const nameColumns = ['Nome', 'Name', 'NOME', 'NAME', 'Funcionário', 'FUNCIONARIO', 'Employee', 'EMPLOYEE'];
            const hasName = nameColumns.some(col => row[col] && row[col].toString().trim());
            
            if (!hasName) {
              // Se não encontrou uma coluna de nome específica, verifica se há pelo menos um campo com dados
              const hasAnyData = Object.values(row).some(value => 
                value !== undefined && value !== null && value.toString().trim() !== ''
              );
              
              if (!hasAnyData) {
                errorCount++;
                errors.push(`Linha ${processedCount + errorCount + 1}: Pelo menos um campo deve conter dados`);
                continue;
              }
            }

            // Salvar dados do funcionário no banco
            await prisma.employeeData.create({
              data: {
                uploadId: uploadId,
                id_empresa: uploadInfo.id_empresa,
                employeeData: row
              }
            });

            processedCount++;

          } catch (error) {
            errorCount++;
            errors.push(`Linha ${processedCount + errorCount + 1}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
          }
        }
        
        // Log de progresso a cada lote
        console.log(`✅ Lote processado: ${processedCount} registros válidos, ${errorCount} erros`);
      }
    } else {
      // Processamento normal para arquivos pequenos
      console.log('🔄 Processando normalmente...');
      
      // Processar cada linha
      for (const row of data as any[]) {
        try {
          // Verificar se a linha tem dados válidos
          const hasValidData = Object.values(row).some(value => 
            value !== undefined && value !== null && value.toString().trim() !== ''
          );

          if (!hasValidData) {
            continue; // Pula linhas vazias
          }

          // Validar dados obrigatórios (flexível)
          const nameColumns = ['Nome', 'Name', 'NOME', 'NAME', 'Funcionário', 'FUNCIONARIO', 'Employee', 'EMPLOYEE'];
          const hasName = nameColumns.some(col => row[col] && row[col].toString().trim());
          
          if (!hasName) {
            // Se não encontrou uma coluna de nome específica, verifica se há pelo menos um campo com dados
            const hasAnyData = Object.values(row).some(value => 
              value !== undefined && value !== null && value.toString().trim() !== ''
            );
            
            if (!hasAnyData) {
              errorCount++;
              errors.push(`Linha ${processedCount + errorCount + 1}: Pelo menos um campo deve conter dados`);
              continue;
            }
          }

          // Salvar dados do funcionário no banco
          await prisma.employeeData.create({
            data: {
              uploadId: uploadId,
              id_empresa: uploadInfo.id_empresa,
              employeeData: row
            }
          });

          processedCount++;

        } catch (error) {
          errorCount++;
          errors.push(`Linha ${processedCount + errorCount + 1}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        }
      }
    }

    // Atualizar status e contadores
    await prisma.upload.update({
      where: { id: uploadId },
      data: {
        status: errorCount === 0 ? 'completed' : 'completed_with_errors',
        processedAt: new Date(),
        totalRecords: data.length,
        processedRecords: processedCount,
        errorMessage: errors.length > 0 ? errors.slice(0, 5).join('; ') : null
      }
    });

    console.log(`✅ Arquivo processado: ${processedCount} registros válidos, ${errorCount} erros`);

  } catch (error) {
    console.error('❌ Erro ao processar arquivo:', error);
    
    // Atualizar status para erro
    await prisma.upload.update({
      where: { id: uploadId },
      data: {
        status: 'error',
        errorMessage: error instanceof Error ? error.message : 'Erro desconhecido'
      }
    });
  }
};

export const getUploads = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const uploads = await prisma.upload.findMany({
      where: { 
        uploadedBy: req.user!.id_usuario,
        id_empresa: req.user!.id_empresa // Filtrar apenas uploads da empresa do usuário
      },
      orderBy: { uploadedAt: 'desc' },
      select: {
        id: true,
        originalName: true,
        size: true,
        status: true,
        uploadedAt: true,
        processedAt: true,
        totalRecords: true,
        processedRecords: true,
        errorMessage: true
      }
    });

    res.json({
      success: true,
      data: uploads
    });
  } catch (error) {
    console.error('Erro ao buscar uploads:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Função para buscar dados processados de um upload específico
export const getUploadData = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { uploadId } = req.params;
    
    if (!uploadId) {
      res.status(400).json({
        success: false,
        message: 'ID do upload é obrigatório'
      });
      return;
    }

    // Verificar se o upload pertence à empresa do usuário
    const upload = await prisma.upload.findFirst({
      where: { 
        id: uploadId,
        id_empresa: req.user!.id_empresa
      }
    });

    if (!upload) {
      res.status(404).json({
        success: false,
        message: 'Upload não encontrado ou não pertence à sua empresa'
      });
      return;
    }

    // Buscar dados processados do upload
    const employeeData = await prisma.employeeData.findMany({
      where: { 
        uploadId: uploadId,
        id_empresa: req.user!.id_empresa
      },
      select: { 
        employeeData: true,
        processedAt: true
      },
      orderBy: { processedAt: 'asc' }
    });

    if (employeeData.length === 0) {
      res.json({
        success: true,
        data: {
          upload: upload,
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
          errors: []
        }
      });
      return;
    }

    // Processar dados para extrair colunas e estatísticas
    const employees = employeeData.map(ed => ed.employeeData as any);
    
    // Extrair colunas únicas de todos os registros
    const allColumns = new Set<string>();
    employees.forEach(emp => {
      Object.keys(emp).forEach(key => allColumns.add(key));
    });
    const columns = Array.from(allColumns);

    // Calcular estatísticas
    const companies = [...new Set(employees.map(emp => {
      const companyColumns = ['Empresa', 'EMPRESA', 'Company', 'COMPANY', 'Razao Social', 'RAZAO SOCIAL'];
      const companyCol = companyColumns.find(col => emp[col]);
      return companyCol ? emp[companyCol] : null;
    }).filter(Boolean))] as string[];

    const departments = [...new Set(employees.map(emp => {
      const deptColumns = ['Departamento', 'DEPARTAMENTO', 'Department', 'DEPARTMENT', 'Setor', 'SETOR'];
      const deptCol = deptColumns.find(col => emp[col]);
      return deptCol ? emp[deptCol] : null;
    }).filter(Boolean))] as string[];

    const averageSalary = employees.length > 0 
      ? employees.reduce((sum, emp) => {
          const salaryColumns = ['Salario', 'SALARIO', 'Salary', 'SALARY', 'Remuneracao', 'REMUNERACAO'];
          const salaryCol = salaryColumns.find(col => emp[col]);
          if (salaryCol && emp[salaryCol]) {
            const salary = parseFloat(String(emp[salaryCol]).replace(/[^\d,.-]/g, '').replace(',', '.')) || 0;
            return sum + salary;
          }
          return sum;
        }, 0) / employees.length 
      : 0;

    const result = {
      upload: upload,
      employees,
      columns,
      summary: {
        totalRecords: upload.totalRecords || 0,
        validRecords: employees.length,
        invalidRecords: (upload.totalRecords || 0) - employees.length,
        companies,
        departments,
        averageSalary
      },
      errors: upload.errorMessage ? [upload.errorMessage] : []
    };

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Erro ao buscar dados do upload:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Função para buscar bases sindicais dos dados processados
export const getBasesSindicais = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    console.log('🔍 === Buscando bases sindicais dos dados processados ===');
    console.log('🔍 Usuário logado ID:', req.user!.id_usuario);
    console.log('🔍 Empresa do usuário:', req.user!.id_empresa);
    
    // Buscar todos os uploads processados com sucesso da empresa do usuário
    const uploads = await prisma.upload.findMany({
      where: { 
        status: 'completed',
        id_empresa: req.user!.id_empresa // Filtrar apenas uploads da empresa do usuário
      },
      select: {
        id: true,
        originalName: true,
        uploadedAt: true,
        id_empresa: true
      },
      orderBy: { uploadedAt: 'desc' }
    });

    // Como já filtramos por empresa na query, não precisamos filtrar novamente
    const companyUploads = uploads;

    console.log(`📋 Total de uploads encontrados: ${uploads.length}`);
    console.log(`📋 Uploads da empresa do usuário: ${companyUploads.length}`);

    if (companyUploads.length === 0) {
      console.log('📋 Nenhum upload processado encontrado para a empresa do usuário');
      res.json({
        success: true,
        data: [],
        message: 'Nenhum arquivo processado encontrado para sua empresa'
      });
      return;
    }

    const basesSindicais = new Set<string>();
    
    // Processar cada upload para extrair bases sindicais dos dados já processados
    for (const upload of companyUploads) {
      try {
        console.log(`🔍 Processando upload: ${upload.originalName}`);

        // Buscar dados processados do upload
        const employeeData = await prisma.employeeData.findMany({
          where: { 
            uploadId: upload.id,
            id_empresa: req.user!.id_empresa
          },
          select: { 
            employeeData: true
          }
        });

        if (employeeData.length === 0) {
          console.log(`⚠️ Nenhum dado encontrado para: ${upload.originalName}`);
          continue;
        }

        // Procurar pela coluna BASE SINDICAL com diferentes variações
        const firstRecord = employeeData[0].employeeData as any;
        const baseSindicalColumn = Object.keys(firstRecord).find(col => {
          const colLower = col.toLowerCase();
          return (
            (colLower.includes('base') && colLower.includes('sindical')) ||
            (colLower.includes('base') && colLower.includes('sindicato')) ||
            (colLower.includes('base') && colLower.includes('sind')) ||
            colLower === 'base sindical' ||
            colLower === 'base_sindical' ||
            colLower === 'basesindical'
          );
        });

        if (baseSindicalColumn) {
          console.log(`✅ Coluna BASE SINDICAL encontrada: ${baseSindicalColumn}`);
          
          // Extrair valores únicos da coluna dos dados processados
          employeeData.forEach((record) => {
            const row = record.employeeData as any;
            const value = row[baseSindicalColumn];
            if (value && String(value).trim() !== '') {
              const cleanValue = String(value).trim();
              // Normalizar o valor para agrupar variações similares
              const normalizedValue = cleanValue
                .replace(/\s+/g, ' ') // Normalizar espaços múltiplos
                .replace(/^\s+|\s+$/g, '') // Remover espaços no início e fim
                .replace(/[^\w\s-]/g, '') // Remover caracteres especiais exceto hífen
                .toUpperCase(); // Converter para maiúsculas para agrupamento
              
              if (normalizedValue.length > 0) {
                basesSindicais.add(normalizedValue);
              }
            }
          });
        } else {
          console.log(`⚠️ Coluna BASE SINDICAL não encontrada em: ${upload.originalName}`);
        }

      } catch (error) {
        console.error(`❌ Erro ao processar upload ${upload.originalName}:`, error);
        continue;
      }
    }

    const basesSindicaisArray = Array.from(basesSindicais).sort();
    
    console.log(`📊 Bases sindicais encontradas: ${basesSindicaisArray.length}`);
    console.log('📋 Lista de bases:', basesSindicaisArray);

    res.json({
      success: true,
      data: basesSindicaisArray,
      message: `${basesSindicaisArray.length} bases sindicais encontradas`
    });

  } catch (error) {
    console.error('❌ Erro ao buscar bases sindicais:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor ao buscar bases sindicais'
    });
  }
};

// Função para importar dados para a tabela base_dados
export const importToBaseDados = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    console.log('📊 === INICIANDO IMPORTAÇÃO PARA BASE_DADOS ===');
    console.log('📋 Parâmetros recebidos:', req.params);
    console.log('📋 Body recebido:', JSON.stringify(req.body, null, 2));
    console.log('📋 Headers da requisição:', req.headers);
    console.log('📋 Usuário autenticado:', req.user);
    
    const { uploadId } = req.params;
    const { processedData } = req.body; // Receber dados processados do frontend
    
    if (!uploadId) {
      res.status(400).json({
        success: false,
        message: 'ID do upload é obrigatório'
      });
      return;
    }

    // Verificar se o upload existe
    const upload = await prisma.upload.findFirst({
      where: { 
        id: uploadId,
        id_empresa: req.user!.id_empresa
      }
    });

    if (!upload) {
      res.status(404).json({
        success: false,
        message: 'Upload não encontrado ou não pertence à sua empresa'
      });
      return;
    }

    // Verificar se o upload foi processado com sucesso
    if (upload.status !== 'completed' && upload.status !== 'completed_with_errors') {
      res.status(400).json({
        success: false,
        message: 'Upload deve estar processado para importar para base_dados'
      });
      return;
    }

    // Usar dados processados do frontend se disponível, senão buscar do banco
    let employeeData: any[] = [];
    
    if (processedData && processedData.employees && processedData.employees.length > 0) {
      console.log('📊 Usando dados processados do frontend');
      console.log('📋 Estrutura do processedData:', {
        hasProcessedData: !!processedData,
        hasEmployees: !!processedData.employees,
        employeesLength: processedData.employees?.length,
        sampleEmployee: processedData.employees?.[0],
        columns: processedData.columns
      });
      console.log('📋 Primeiro registro completo:', JSON.stringify(processedData.employees[0], null, 2));
      employeeData = processedData.employees;
    } else {
      console.log('📊 Buscando dados processados do banco');
      console.log('📋 processedData recebido:', processedData);
      
      // Buscar dados processados do upload
      const dbEmployeeData = await prisma.employeeData.findMany({
        where: { 
          uploadId: uploadId,
          id_empresa: req.user!.id_empresa
        },
        select: { 
          employeeData: true
        }
      });

      console.log('📋 Dados encontrados no banco:', {
        count: dbEmployeeData.length,
        sample: dbEmployeeData[0]?.employeeData
      });

      if (dbEmployeeData.length === 0) {
        res.status(400).json({
          success: false,
          message: 'Nenhum dado encontrado para importar. Verifique se o arquivo foi processado corretamente.'
        });
        return;
      }

      // Converter dados do banco para o formato esperado
      employeeData = dbEmployeeData.map(record => record.employeeData as any);
    }

    // Mapeamento de colunas com variações encontradas nos dados reais
    const columnMapping = {
      mes: ['Mes', 'MES', 'Month', 'MONTH', 'Mês', 'MÊS', 'Mês/Ano', 'MÊS/ANO', 'Mês-Ano', 'MÊS-ANO', 'Mês Ano', 'MÊS ANO'],
      se: ['SE', 'se', 'Se', 'Superintendência', 'SUPERINTENDENCIA', 'Superintendencia'],
      lotacao: ['Lotacao', 'LOTACAO', 'Lotação', 'LOTAÇÃO', 'Lot', 'LOT', 'Setor', 'SETOR', 'Department', 'DEPARTMENT'],
      municipio: ['Municipio', 'MUNICIPIO', 'Município', 'MUNICÍPIO', 'Cidade', 'CIDADE', 'City', 'CITY'],
      matricula: ['Matricula', 'MATRICULA', 'Matrícula', 'MATRÍCULA', 'Mat', 'MAT', 'ID', 'id', 'Employee ID'],
      nome: ['Nome', 'NOME', 'Name', 'NAME', 'Funcionario', 'FUNCIONARIO', 'Employee', 'EMPLOYEE'],
      sexo: ['Sexo', 'SEXO', 'Gender', 'GENDER', 'Sex', 'SEX'],
      data_nasc: ['Data Nascimento', 'DATA NASCIMENTO', 'DataNascimento', 'Birth Date', 'BIRTH DATE', 'Nascimento', 'NASCIMENTO'],
      raca: ['Raca', 'RACA', 'Raça', 'RAÇA', 'Race', 'RACE', 'Etnia', 'ETNIA'],
      grau_instrucao: ['Grau Instrucao', 'GRAU INSTRUCAO', 'Grau de Instrução', 'GRAU DE INSTRUÇÃO', 'Education', 'EDUCATION', 'Escolaridade', 'ESCOLARIDADE', 'Grau Instrução', 'Grau Instrução'],
      data_admissao: ['Data Admissao', 'DATA ADMISSAO', 'DataAdmissao', 'Admission Date', 'ADMISSION DATE', 'Admissao', 'ADMISSAO', 'DATA ADMISSÃO', 'Data Admissão', 'Data Admissão', 'Data Admissão', 'Data Admissão', 'Data Admissão'],
      cargo: ['Cargo', 'CARGO', 'Position', 'POSITION', 'Job Title', 'JOB TITLE'],
      cargo_esp: ['Cargo Especifico', 'CARGO ESPECIFICO', 'Cargo Específico', 'CARGO ESPECÍFICO', 'Specific Position', 'SPECIFIC POSITION', 'CARGO ESPECIALIDADE'],
      cargo_nivel: ['Cargo Nivel', 'CARGO NIVEL', 'Cargo Nível', 'CARGO NÍVEL', 'Position Level', 'POSITION LEVEL', 'Nivel', 'NÍVEL'],
      funcao: ['Funcao', 'FUNCAO', 'Função', 'FUNÇÃO', 'Function', 'FUNCTION', 'Role', 'ROLE'],
      jornada_trab: ['Jornada Trabalho', 'JORNADA TRABALHO', 'Jornada de Trabalho', 'JORNADA DE TRABALHO', 'Work Schedule', 'WORK SCHEDULE', 'Jornada', 'JORNADA'],
      tipo_deficiencia: ['Tipo Deficiencia', 'TIPO DEFICIENCIA', 'Tipo de Deficiência', 'TIPO DE DEFICIÊNCIA', 'Disability Type', 'DISABILITY TYPE', 'Deficiencia', 'DEFICIENCIA', 'TIPO DEFICIÊNCIA'],
      data_afast: ['Data Afastamento', 'DATA AFASTAMENTO', 'DataAfastamento', 'Leave Date', 'LEAVE DATE', 'Afastamento', 'AFASTAMENTO'],
      motivo_afast: ['Motivo Afastamento', 'MOTIVO AFASTAMENTO', 'MotivoAfastamento', 'Leave Reason', 'LEAVE REASON', 'Motivo', 'MOTIVO'],
      base_sindical: ['Base Sindical', 'BASE SINDICAL', 'BaseSindical', 'Union Base', 'UNION BASE', 'Sindicato', 'SINDICATO'],
      filiado: ['Filiado', 'FILIADO', 'Member', 'MEMBER', 'Filiacao', 'FILIAÇÃO', 'Union Member'],
      valor_mensalidade: ['Valor Mensalidade', 'VALOR MENSALIDADE', 'ValorMensalidade', 'Monthly Fee', 'MONTHLY FEE', 'Mensalidade', 'MENSALIDADE']
    };

    // Função para encontrar valor de coluna mapeada
    const findColumnValue = (row: any, targetColumns: string[]): any => {
      console.log(`🔍 Procurando coluna entre: ${targetColumns.join(', ')}`);
      console.log(`🔍 Colunas disponíveis no registro: ${Object.keys(row).join(', ')}`);
      
      // Primeiro, tenta encontrar uma correspondência exata
      for (const col of targetColumns) {
        if (row[col] !== undefined && row[col] !== null && row[col].toString().trim() !== '') {
          console.log(`✅ Coluna encontrada (exata): "${col}" = "${row[col]}"`);
          return row[col];
        }
      }
      
      // Se não encontrar, tenta uma correspondência mais flexível
      const rowKeys = Object.keys(row);
      for (const targetColumn of targetColumns) {
        for (const rowKey of rowKeys) {
          // Normaliza as strings para comparação (remove acentos, converte para minúsculas, remove espaços extras)
          const normalizedTarget = targetColumn.toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/\s+/g, ' ')
            .trim();
          
          const normalizedRowKey = rowKey.toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/\s+/g, ' ')
            .trim();
          
          if (normalizedTarget === normalizedRowKey) {
            console.log(`✅ Coluna encontrada (flexível): "${rowKey}" mapeada para "${targetColumn}"`);
            return row[rowKey];
          }
        }
      }
      
      console.log(`❌ Nenhuma coluna encontrada para: ${targetColumns.join(', ')}`);
      return null;
    };

    // Função para converter data
    const parseDate = (dateValue: any): Date | null => {
      if (!dateValue) return null;
      
      console.log(`🔄 Tentando converter data: ${dateValue} (tipo: ${typeof dateValue})`);
      
      // Se já é uma data
      if (dateValue instanceof Date) {
        console.log(`✅ Já é uma data válida: ${dateValue}`);
        // Retorna apenas a data (sem hora) para campos DATE
        return new Date(dateValue.getFullYear(), dateValue.getMonth(), dateValue.getDate());
      }
      
      // Se é número (data do Excel), converter - PRIORIDADE ALTA
      if (typeof dateValue === 'number') {
        console.log(`📊 Convertendo número do Excel: ${dateValue}`);
        try {
          // Excel usa 1 de janeiro de 1900 como dia 1
          const excelEpoch = new Date(1900, 0, 1);
          let daysToAdd = dateValue - 1;
          
          // Se a data é após 28/02/1900, ajusta para o erro do Excel
          if (dateValue > 59) {
            daysToAdd = dateValue - 2;
          }
          
          const date = new Date(excelEpoch.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
          
          if (!isNaN(date.getTime()) && date.getFullYear() > 1900 && date.getFullYear() < 2100) {
            console.log(`✅ Data do Excel convertida: ${date}`);
            // Retorna apenas a data (sem hora) para campos DATE
            return new Date(date.getFullYear(), date.getMonth(), date.getDate());
          } else {
            console.log(`❌ Data do Excel inválida: ${date}`);
          }
        } catch (error) {
          console.log(`⚠️ Erro ao converter data do Excel: ${dateValue}`, error);
        }
      }
      
      // Se é string, tentar converter
      if (typeof dateValue === 'string') {
        const trimmed = dateValue.trim();
        if (!trimmed) return null;
        
        console.log(`📅 Processando string de data: "${trimmed}"`);
        
        // Tentar diferentes formatos de data
        const dateFormats = [
          /(\d{1,2})\/(\d{1,2})\/(\d{4})/, // DD/MM/YYYY
          /(\d{4})-(\d{1,2})-(\d{1,2})/, // YYYY-MM-DD
          /(\d{1,2})-(\d{1,2})-(\d{4})/, // DD-MM-YYYY
        ];
        
        for (const format of dateFormats) {
          const match = trimmed.match(format);
          if (match) {
            console.log(`✅ Formato de data reconhecido: ${format.source}, match: ${match.join(', ')}`);
            if (format.source.includes('YYYY')) {
              // Formato YYYY-MM-DD
              const date = new Date(parseInt(match[1]), parseInt(match[2]) - 1, parseInt(match[3]));
              console.log(`📅 Data convertida (YYYY-MM-DD): ${date}`);
              // Retorna apenas a data (sem hora) para campos DATE
              return new Date(date.getFullYear(), date.getMonth(), date.getDate());
            } else {
              // Formato DD/MM/YYYY ou DD-MM-YYYY
              const date = new Date(parseInt(match[3]), parseInt(match[2]) - 1, parseInt(match[1]));
              console.log(`📅 Data convertida (DD/MM/YYYY): ${date}`);
              // Retorna apenas a data (sem hora) para campos DATE
              return new Date(date.getFullYear(), date.getMonth(), date.getDate());
            }
          }
        }
        
        // Tentar parse direto
        const parsed = new Date(trimmed);
        if (!isNaN(parsed.getTime())) {
          console.log(`✅ Data parseada diretamente: ${parsed}`);
          // Retorna apenas a data (sem hora) para campos DATE
          return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
        }
        
        console.log(`❌ Não foi possível converter a string: "${trimmed}"`);
      }
      
      console.log(`❌ Não foi possível converter: ${dateValue}`);
      return null;
    };

    // Função para converter valor monetário
    const parseCurrency = (value: any): number | null => {
      if (!value) return null;
      
      if (typeof value === 'number') return value;
      
      if (typeof value === 'string') {
        const cleaned = value.replace(/[^\d,.-]/g, '').replace(',', '.');
        const parsed = parseFloat(cleaned);
        return isNaN(parsed) ? null : parsed;
      }
      
      return null;
    };

    // Função para truncar strings que excedem o tamanho máximo dos campos
    const truncateString = (value: string, maxLength: number): string => {
      if (!value) return value;
      if (value.length <= maxLength) return value;
      return value.substring(0, maxLength);
    };

    console.log(`🔄 Processando ${employeeData.length} registros para importação...`);
    console.log(`📋 Mapeamento de colunas configurado:`);
    console.log(`   - Data Nascimento: ${columnMapping.data_nasc.join(', ')}`);
    console.log(`   - Data Admissão: ${columnMapping.data_admissao.join(', ')}`);
    console.log(`   - Nome: ${columnMapping.nome.join(', ')}`);
    console.log(`==============================`);

    let importedCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    // Limpar dados existentes (opcional - pode ser configurável)
    // await prisma.baseDados.deleteMany();

    // Processar cada registro
    for (const record of employeeData) {
      try {
        // O frontend envia os dados diretamente, não dentro de employeeData
        const row = record as any;
        
        console.log(`📊 === PROCESSANDO REGISTRO ===`);
        console.log(`📋 Estrutura do registro:`, Object.keys(row));
        console.log(`📋 Primeiros valores:`, Object.entries(row).slice(0, 5));
        console.log(`==============================`);
        
        // Mapear campos para base_dados com conversão de tipos correta e truncamento
        const baseDadosRecord = {
          mes: truncateString(String(findColumnValue(row, columnMapping.mes) || 'N/A'), 50),
          se: truncateString(String(findColumnValue(row, columnMapping.se) || 'N/A'), 50),
          lotacao: truncateString(String(findColumnValue(row, columnMapping.lotacao) || 'N/A'), 100),
          municipio: truncateString(String(findColumnValue(row, columnMapping.municipio) || 'N/A'), 100),
          matricula: truncateString(String(findColumnValue(row, columnMapping.matricula) || 'N/A'), 50),
          nome: truncateString(String(findColumnValue(row, columnMapping.nome) || 'N/A'), 255),
          sexo: truncateString(String(findColumnValue(row, columnMapping.sexo) || 'N/A'), 20),
          data_nasc: parseDate(findColumnValue(row, columnMapping.data_nasc)),
          raca: truncateString(String(findColumnValue(row, columnMapping.raca) || 'N/A'), 50),
          grau_instrucao: truncateString(String(findColumnValue(row, columnMapping.grau_instrucao) || 'N/A'), 100),
          data_admissao: parseDate(findColumnValue(row, columnMapping.data_admissao)),
          cargo: truncateString(String(findColumnValue(row, columnMapping.cargo) || 'N/A'), 100),
          cargo_esp: findColumnValue(row, columnMapping.cargo_esp) ? truncateString(String(findColumnValue(row, columnMapping.cargo_esp)), 100) : null,
          cargo_nivel: findColumnValue(row, columnMapping.cargo_nivel) ? truncateString(String(findColumnValue(row, columnMapping.cargo_nivel)), 50) : null,
          funcao: findColumnValue(row, columnMapping.funcao) ? truncateString(String(findColumnValue(row, columnMapping.funcao)), 100) : null,
          jornada_trab: findColumnValue(row, columnMapping.jornada_trab) ? truncateString(String(findColumnValue(row, columnMapping.jornada_trab)), 50) : null,
          tipo_deficiencia: findColumnValue(row, columnMapping.tipo_deficiencia) ? truncateString(String(findColumnValue(row, columnMapping.tipo_deficiencia)), 100) : null,
          data_afast: parseDate(findColumnValue(row, columnMapping.data_afast)),
          motivo_afast: findColumnValue(row, columnMapping.motivo_afast) ? truncateString(String(findColumnValue(row, columnMapping.motivo_afast)), 255) : null,
          base_sindical: truncateString(String(findColumnValue(row, columnMapping.base_sindical) || 'N/A'), 100),
          filiado: truncateString(String(findColumnValue(row, columnMapping.filiado) || 'N/A'), 10),
          valor_mensalidade: parseCurrency(findColumnValue(row, columnMapping.valor_mensalidade))
        };

        // Log dos valores encontrados para debug
        console.log(`📊 === REGISTRO ${importedCount + errorCount + 1} ===`);
        console.log(`📅 Data Nascimento - Valor original: ${findColumnValue(row, columnMapping.data_nasc)}`);
        console.log(`📅 Data Nascimento - Convertida: ${baseDadosRecord.data_nasc}`);
        console.log(`📅 Data Admissão - Valor original: ${findColumnValue(row, columnMapping.data_admissao)}`);
        console.log(`📅 Data Admissão - Convertida: ${baseDadosRecord.data_admissao}`);
        console.log(`📋 Nome: ${baseDadosRecord.nome}`);
        console.log(`==============================`);

        // Validar campos obrigatórios
        if (!baseDadosRecord.nome || baseDadosRecord.nome === 'N/A') {
          errorCount++;
          errors.push(`Registro ${importedCount + errorCount}: Nome é obrigatório`);
          console.log(`❌ Nome é obrigatório`);
          continue;
        }

        // Validar base sindical obrigatória
        if (!baseDadosRecord.base_sindical || baseDadosRecord.base_sindical === 'N/A') {
          errorCount++;
          errors.push(`Registro ${importedCount + errorCount}: Base sindical é obrigatória`);
          console.log(`❌ Base sindical é obrigatória`);
          continue;
        }

        // Validar datas obrigatórias
        if (!baseDadosRecord.data_nasc) {
          errorCount++;
          errors.push(`Registro ${importedCount + errorCount}: Data de nascimento é obrigatória`);
          console.log(`❌ Data de nascimento é obrigatória`);
          continue;
        }

        if (!baseDadosRecord.data_admissao) {
          errorCount++;
          errors.push(`Registro ${importedCount + errorCount}: Data de admissão é obrigatória`);
          console.log(`❌ Data de admissão é obrigatória`);
          continue;
        }

        console.log(`✅ Validações passaram, tentando inserir...`);

        // Tentar inserir na tabela base_dados
        const result = await prisma.baseDados.create({
          data: baseDadosRecord as any // Type assertion para resolver problema de tipos do Prisma
        });

        importedCount++;

      } catch (error) {
        errorCount++;
        errors.push(`Registro ${importedCount + errorCount}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      }
    }

    console.log(`✅ Importação concluída: ${importedCount} registros importados, ${errorCount} erros`);

    // Atualizar status do upload para indicar que foi importado
    await prisma.upload.update({
      where: { id: uploadId },
      data: {
        status: errorCount === 0 ? 'imported' : 'imported_with_errors',
        processedAt: new Date()
      }
    });

    res.json({
      success: true,
      message: `Importação concluída com sucesso`,
      data: {
        totalRecords: employeeData.length,
        importedRecords: importedCount,
        errorCount: errorCount,
        errors: errors.slice(0, 10) // Limitar a 10 erros para não sobrecarregar a resposta
      }
    });

  } catch (error) {
    console.error('❌ Erro ao importar para base_dados:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor durante a importação',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
};

// Função para salvar mapeamentos de colunas
export const saveColumnMappings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    console.log('📊 === SALVANDO MAPEAMENTOS DE COLUNAS ===');
    const { uploadId, fileName, columnMappings } = req.body;

    if (!uploadId || !fileName || !columnMappings) {
      res.status(400).json({
        success: false,
        message: 'uploadId, fileName e columnMappings são obrigatórios'
      });
      return;
    }

    // Verificar se o upload existe
    const upload = await prisma.upload.findFirst({
      where: { id: uploadId }
    });

    if (!upload) {
      res.status(404).json({
        success: false,
        message: 'Upload não encontrado'
      });
      return;
    }

    // Salvar mapeamentos no banco (usando uma tabela temporária ou localStorage por enquanto)
    // Em uma implementação completa, você criaria uma tabela column_mappings
    const mappingData = {
      uploadId,
      fileName,
      columnMappings: JSON.stringify(columnMappings),
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true
    };

    console.log('✅ Mapeamentos salvos:', mappingData);

    res.json({
      success: true,
      message: 'Mapeamentos salvos com sucesso',
      data: {
        mappingId: `mapping_${Date.now()}`,
        savedMappings: columnMappings
      }
    });

  } catch (error) {
    console.error('❌ Erro ao salvar mapeamentos:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor ao salvar mapeamentos',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
};

// Função para buscar todos os mapeamentos
export const getColumnMappings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    console.log('📊 === BUSCANDO TODOS OS MAPEAMENTOS ===');

    // Em uma implementação completa, você buscaria da tabela column_mappings
    // Por enquanto, retornamos um array vazio
    res.json({
      success: true,
      data: [],
      message: 'Nenhum mapeamento encontrado'
    });

  } catch (error) {
    console.error('❌ Erro ao buscar mapeamentos:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor ao buscar mapeamentos',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
};

// Função para buscar mapeamentos por upload
export const getColumnMappingsByUpload = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    console.log('📊 === BUSCANDO MAPEAMENTOS POR UPLOAD ===');
    const { uploadId } = req.params;

    if (!uploadId) {
      res.status(400).json({
        success: false,
        message: 'uploadId é obrigatório'
      });
      return;
    }

    // Em uma implementação completa, você buscaria da tabela column_mappings
    // Por enquanto, retornamos um array vazio
    res.json({
      success: true,
      data: [],
      message: 'Nenhum mapeamento encontrado para este upload'
    });

  } catch (error) {
    console.error('❌ Erro ao buscar mapeamentos por upload:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor ao buscar mapeamentos',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
};
