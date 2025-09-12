const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testImportProcess() {
  try {
    console.log('🧪 === TESTE DO PROCESSO DE IMPORTAÇÃO ===');
    
    // Simular os dados como vêm do arquivo Excel
    const mockRow = {
      'Data Nascimento': '02/07/1983',
      'DATA NASCIMENTO': '02/07/1983',
      'DataNascimento': '02/07/1983',
      'Birth Date': '02/07/1983',
      'BIRTH DATE': '02/07/1983',
      'Nascimento': '02/07/1983',
      'NASCIMENTO': '02/07/1983',
      'Data de Nascimento': '02/07/1983',
      'DATA DE NASCIMENTO': '02/07/1983',
      'data de nascimento': '02/07/1983',
      'Dt Nascimento': '02/07/1983',
      'DT NASCIMENTO': '02/07/1983',
      'dt nascimento': '02/07/1983',
      'Dt. Nascimento': '02/07/1983',
      'Dt. NASCIMENTO': '02/07/1983',
      'dt. nascimento': '02/07/1983',
      'Data Nasc': '02/07/1983',
      'DATA NASC': '02/07/1983',
      'Data Admissao': '09/12/2004',
      'DATA ADMISSAO': '09/12/2004',
      'DataAdmissao': '09/12/2004',
      'Admission Date': '09/12/2004',
      'ADMISSION DATE': '09/12/2004',
      'Admissao': '09/12/2004',
      'ADMISSAO': '09/12/2004',
      'Data de Admissão': '09/12/2004',
      'DATA DE ADMISSÃO': '09/12/2004',
      'data de admissão': '09/12/2004',
      'Dt Admissão': '09/12/2004',
      'DT ADMISSÃO': '09/12/2004',
      'dt admissão': '09/12/2004',
      'Dt. Admissão': '09/12/2004',
      'Dt. ADMISSÃO': '09/12/2004',
      'dt. admissão': '09/12/2004',
      'Data Adm': '09/12/2004',
      'DATA ADM': '09/12/2004',
      'Nome': 'MARCIO SOARES DE OLIVEIRA',
      'NOME': 'MARCIO SOARES DE OLIVEIRA',
      'Name': 'MARCIO SOARES DE OLIVEIRA',
      'NAME': 'MARCIO SOARES DE OLIVEIRA',
      'Funcionario': 'MARCIO SOARES DE OLIVEIRA',
      'FUNCIONARIO': 'MARCIO SOARES DE OLIVEIRA',
      'Employee': 'MARCIO SOARES DE OLIVEIRA',
      'EMPLOYEE': 'MARCIO SOARES DE OLIVEIRA'
    };

    console.log('📋 Dados simulados do arquivo:', mockRow);
    console.log('🔍 Colunas disponíveis:', Object.keys(mockRow));

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
      console.log(`🔍 Procurando coluna entre: ${targetColumns.join(', ')}`);
      
      for (const col of targetColumns) {
        if (row[col] !== undefined && row[col] !== null && row[col].toString().trim() !== '') {
          console.log(`✅ Coluna encontrada: "${col}" = "${row[col]}"`);
          return row[col];
        }
      }
      
      console.log(`❌ Nenhuma coluna encontrada para: ${targetColumns.join(', ')}`);
      return null;
    };

    // Função para converter data (copiada do backend)
    const parseDate = (dateValue) => {
      if (!dateValue) return null;
      
      console.log(`🔄 Tentando converter data: ${dateValue} (tipo: ${typeof dateValue})`);
      
      // Se já é uma data
      if (dateValue instanceof Date) {
        console.log(`✅ Já é uma data válida: ${dateValue}`);
        return new Date(dateValue.getFullYear(), dateValue.getMonth(), dateValue.getDate());
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
              return new Date(date.getFullYear(), date.getMonth(), date.getDate());
            } else {
              // Formato DD/MM/YYYY ou DD-MM-YYYY
              const date = new Date(parseInt(match[3]), parseInt(match[2]) - 1, parseInt(match[1]));
              console.log(`📅 Data convertida (DD/MM/YYYY): ${date}`);
              return new Date(date.getFullYear(), date.getMonth(), date.getDate());
            }
          }
        }
        
        // Tentar parse direto
        const parsed = new Date(trimmed);
        if (!isNaN(parsed.getTime())) {
          console.log(`✅ Data parseada diretamente: ${parsed}`);
          return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
        }
        
        console.log(`❌ Não foi possível converter a string: "${trimmed}"`);
      }
      
      console.log(`❌ Não foi possível converter: ${dateValue}`);
      return null;
    };

    // Testar o processo de mapeamento
    console.log('\n🔍 === TESTANDO MAPEAMENTO DE COLUNAS ===');
    
    const dataNascValue = findColumnValue(mockRow, columnMapping.data_nasc);
    console.log(`📅 Data Nascimento encontrada: ${dataNascValue}`);
    
    const dataAdmissaoValue = findColumnValue(mockRow, columnMapping.data_admissao);
    console.log(`📅 Data Admissão encontrada: ${dataAdmissaoValue}`);
    
    const nomeValue = findColumnValue(mockRow, columnMapping.nome);
    console.log(`👤 Nome encontrado: ${nomeValue}`);

    // Testar conversão de datas
    console.log('\n🔄 === TESTANDO CONVERSÃO DE DATAS ===');
    
    const dataNascConvertida = parseDate(dataNascValue);
    console.log(`📅 Data Nascimento convertida: ${dataNascConvertida}`);
    
    const dataAdmissaoConvertida = parseDate(dataAdmissaoValue);
    console.log(`📅 Data Admissão convertida: ${dataAdmissaoConvertida}`);

    // Verificar se as conversões foram bem-sucedidas
    if (dataNascConvertida && dataAdmissaoConvertida) {
      console.log('\n✅ === TODAS AS CONVERSÕES FORAM BEM-SUCEDIDAS ===');
      console.log('🔍 O problema deve estar em outro lugar do processo de importação');
    } else {
      console.log('\n❌ === PROBLEMA IDENTIFICADO NA CONVERSÃO ===');
      if (!dataNascConvertida) console.log('❌ Falha na conversão da data de nascimento');
      if (!dataAdmissaoConvertida) console.log('❌ Falha na conversão da data de admissão');
    }

  } catch (error) {
    console.error('❌ Erro no teste:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar o teste
testImportProcess();
