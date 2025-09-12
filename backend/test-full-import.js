const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testFullImport() {
  try {
    console.log('🧪 === TESTE COMPLETO DO PROCESSO DE IMPORTAÇÃO ===');
    
    // Simular dados como vêm do banco (employeeData)
    const mockEmployeeData = [
      {
        employeeData: {
          'Data Nascimento': '02/07/1983',
          'Data Admissao': '09/12/2004',
          'Nome': 'MARCIO SOARES DE OLIVEIRA',
          'Mes': '08/2025',
          'SE': 'SE/MG',
          'Lotacao': 'AC AGUAS FORMOSAS',
          'Municipio': 'AGUAS FORMOSAS',
          'Matricula': '84184060',
          'Sexo': 'M',
          'Raca': 'Parda',
          'Grau Instrucao': 'MÉDIO',
          'Cargo': 'AGENTE DE CORREIOS',
          'Cargo Especifico': 'ATENDENTE COMERCIAL',
          'Cargo Nivel': 'Medio',
          'Funcao': 'GERENTE AGENCIA DE CORREIO IV',
          'Jornada Trabalho': '40h',
          'Tipo Deficiencia': 'VISUAL',
          'Data Afastamento': '18/11/2023',
          'Motivo Afastamento': 'LICENÇA INSS ACT 2023',
          'Base Sindical': 'SINTECT/MG',
          'Filiado': 'SINTECT/MG',
          'Valor Mensalidade': '63,98'
        }
      }
    ];

    console.log('📋 Dados simulados do employeeData:', mockEmployeeData[0].employeeData);

    // Mapeamento de colunas como configurado no backend
    const columnMapping = {
      mes: ['Mes', 'MES', 'Month', 'MONTH', 'Mês', 'MÊS'],
      se: ['SE', 'se', 'Se', 'Superintendência', 'SUPERINTENDENCIA', 'Superintendencia'],
      lotacao: ['Lotacao', 'LOTACAO', 'Lotação', 'LOTAÇÃO', 'Lot', 'LOT', 'Setor', 'SETOR', 'Department', 'DEPARTMENT'],
      municipio: ['Municipio', 'MUNICIPIO', 'Município', 'MUNICÍPIO', 'Cidade', 'CIDADE', 'City', 'CITY'],
      matricula: ['Matricula', 'MATRICULA', 'Matrícula', 'MATRÍCULA', 'Mat', 'MAT', 'ID', 'id', 'Employee ID'],
      nome: ['Nome', 'NOME', 'Name', 'NAME', 'Funcionario', 'FUNCIONARIO', 'Employee', 'EMPLOYEE'],
      sexo: ['Sexo', 'SEXO', 'Gender', 'GENDER', 'Sex', 'SEX'],
      data_nasc: ['Data Nascimento', 'DATA NASCIMENTO', 'DataNascimento', 'Birth Date', 'BIRTH DATE', 'Nascimento', 'NASCIMENTO'],
      raca: ['Raca', 'RACA', 'Raça', 'RAÇA', 'Race', 'RACE', 'Etnia', 'ETNIA'],
      grau_instrucao: ['Grau Instrucao', 'GRAU INSTRUCAO', 'Grau de Instrução', 'GRAU DE INSTRUÇÃO', 'Education', 'EDUCATION', 'Escolaridade', 'ESCOLARIDADE'],
      data_admissao: ['Data Admissao', 'DATA ADMISSAO', 'DataAdmissao', 'Admission Date', 'ADMISSION DATE', 'Admissao', 'ADMISSAO'],
      cargo: ['Cargo', 'CARGO', 'Position', 'POSITION', 'Job Title', 'JOB TITLE'],
      cargo_esp: ['Cargo Especifico', 'CARGO ESPECIFICO', 'Cargo Específico', 'CARGO ESPECÍFICO', 'Specific Position', 'SPECIFIC POSITION'],
      cargo_nivel: ['Cargo Nivel', 'CARGO NIVEL', 'Cargo Nível', 'CARGO NÍVEL', 'Position Level', 'POSITION LEVEL', 'Nivel', 'NÍVEL'],
      funcao: ['Funcao', 'FUNCAO', 'Função', 'FUNÇÃO', 'Function', 'FUNCTION', 'Role', 'ROLE'],
      jornada_trab: ['Jornada Trabalho', 'JORNADA TRABALHO', 'Jornada de Trabalho', 'JORNADA DE TRABALHO', 'Work Schedule', 'WORK SCHEDULE', 'Jornada', 'JORNADA'],
      tipo_deficiencia: ['Tipo Deficiencia', 'TIPO DEFICIENCIA', 'Tipo de Deficiência', 'TIPO DE DEFICIÊNCIA', 'Disability Type', 'DISABILITY TYPE', 'Deficiencia', 'DEFICIENCIA'],
      data_afast: ['Data Afastamento', 'DATA AFASTAMENTO', 'DataAfastamento', 'Leave Date', 'LEAVE DATE', 'Afastamento', 'AFASTAMENTO'],
      motivo_afast: ['Motivo Afastamento', 'MOTIVO AFASTAMENTO', 'MotivoAfastamento', 'Leave Reason', 'LEAVE REASON', 'Motivo', 'MOTIVO'],
      base_sindical: ['Base Sindical', 'BASE SINDICAL', 'BaseSindical', 'Union Base', 'UNION BASE', 'Sindicato', 'SINDICATO'],
      filiado: ['Filiado', 'FILIADO', 'Member', 'MEMBER', 'Filiacao', 'FILIAÇÃO', 'Union Member'],
      valor_mensalidade: ['Valor Mensalidade', 'VALOR MENSALIDADE', 'ValorMensalidade', 'Monthly Fee', 'MONTHLY FEE', 'Mensalidade', 'MENSALIDADE']
    };

    // Função para encontrar valor de coluna mapeada (copiada do backend)
    const findColumnValue = (row, targetColumns) => {
      for (const col of targetColumns) {
        if (row[col] !== undefined && row[col] !== null && row[col].toString().trim() !== '') {
          return row[col];
        }
      }
      return null;
    };

    // Função para converter data (copiada do backend)
    const parseDate = (dateValue) => {
      if (!dateValue) return null;
      
      // Se já é uma data
      if (dateValue instanceof Date) {
        return new Date(dateValue.getFullYear(), dateValue.getMonth(), dateValue.getDate());
      }
      
      // Se é string, tentar converter
      if (typeof dateValue === 'string') {
        const trimmed = dateValue.trim();
        if (!trimmed) return null;
        
        // Tentar diferentes formatos de data
        const dateFormats = [
          /(\d{1,2})\/(\d{1,2})\/(\d{4})/, // DD/MM/YYYY
          /(\d{4})-(\d{1,2})-(\d{1,2})/, // YYYY-MM-DD
          /(\d{1,2})-(\d{1,2})-(\d{4})/, // DD-MM-YYYY
        ];
        
        for (const format of dateFormats) {
          const match = trimmed.match(format);
          if (match) {
            if (format.source.includes('YYYY')) {
              // Formato YYYY-MM-DD
              const date = new Date(parseInt(match[1]), parseInt(match[2]) - 1, parseInt(match[3]));
              return new Date(date.getFullYear(), date.getMonth(), date.getDate());
            } else {
              // Formato DD/MM/YYYY ou DD-MM-YYYY
              const date = new Date(parseInt(match[3]), parseInt(match[2]) - 1, parseInt(match[1]));
              return new Date(date.getFullYear(), date.getMonth(), date.getDate());
            }
          }
        }
        
        // Tentar parse direto
        const parsed = new Date(trimmed);
        if (!isNaN(parsed.getTime())) {
          return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
        }
      }
      
      // Se é número (data do Excel), converter
      if (typeof dateValue === 'number') {
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
            return new Date(date.getFullYear(), date.getMonth(), date.getDate());
          }
        } catch (error) {
          console.log(`⚠️ Erro ao converter data do Excel: ${dateValue}`, error);
        }
      }
      
      return null;
    };

    // Função para converter valor monetário
    const parseCurrency = (value) => {
      if (!value) return null;
      
      if (typeof value === 'number') return value;
      
      if (typeof value === 'string') {
        const cleaned = value.replace(/[^\d,.-]/g, '').replace(',', '.');
        const parsed = parseFloat(cleaned);
        return isNaN(parsed) ? null : parsed;
      }
      
      return null;
    };

    // Função para truncar strings
    const truncateString = (value, maxLength) => {
      if (!value) return value;
      if (value.length <= maxLength) return value;
      return value.substring(0, maxLength);
    };

    console.log(`🔄 Processando ${mockEmployeeData.length} registros para importação...`);

    let importedCount = 0;
    let errorCount = 0;
    const errors = [];

    // Processar cada registro
    for (const record of mockEmployeeData) {
      try {
        const row = record.employeeData;
        
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
          data: baseDadosRecord
        });

        console.log(`✅ Inserção realizada com sucesso! ID: ${result.id}`);
        importedCount++;

      } catch (error) {
        errorCount++;
        const errorMsg = `Registro ${importedCount + errorCount}: ${error.message}`;
        errors.push(errorMsg);
        console.error(`❌ Erro no registro:`, error);
      }
    }

    console.log(`\n📊 === RESULTADO FINAL ===`);
    console.log(`✅ Registros importados: ${importedCount}`);
    console.log(`❌ Erros: ${errorCount}`);
    console.log(`📋 Lista de erros:`, errors);

  } catch (error) {
    console.error('❌ Erro geral:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar o teste
testFullImport();
