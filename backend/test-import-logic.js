const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testImportLogic() {
  try {
    console.log('🧪 === TESTE DA LÓGICA DE IMPORTAÇÃO ===');
    
    // Simular dados processados do frontend
    const processedData = {
      employees: [
        {
          'Mês Ano': 'Agosto/2025',
          'Nome': 'João Silva',
          'Matrícula': '001',
          'Data Nascimento': '15/03/1985',
          'Data Admissão': '01/01/2020',
          'Base Sindical': 'Sindicato A',
          'SE': 'SE001',
          'Lotação': 'Departamento A',
          'Município': 'São Paulo',
          'Sexo': 'M',
          'Raça': 'Branca',
          'Grau Instrução': 'Superior',
          'Cargo': 'Analista',
          'Filiado': 'S'
        }
      ],
      columns: ['Mês Ano', 'Nome', 'Matrícula', 'Data Nascimento', 'Data Admissão', 'Base Sindical', 'SE', 'Lotação', 'Município', 'Sexo', 'Raça', 'Grau Instrução', 'Cargo', 'Filiado']
    };
    
    console.log('📊 Dados processados simulados:', JSON.stringify(processedData, null, 2));
    
    // Mapeamento de colunas (copiado do controlador)
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
      grau_instrucao: ['Grau Instrucao', 'GRAU INSTRUCAO', 'Grau de Instrução', 'GRAU DE INSTRUÇÃO', 'Education', 'EDUCATION', 'Escolaridade', 'ESCOLARIDADE'],
      data_admissao: ['Data Admissao', 'DATA ADMISSAO', 'DataAdmissao', 'Admission Date', 'ADMISSION DATE', 'Admissao', 'ADMISSAO', 'DATA ADMISSÃO'],
      cargo: ['Cargo', 'CARGO', 'Position', 'POSITION', 'Job Title', 'JOB TITLE'],
      base_sindical: ['Base Sindical', 'BASE SINDICAL', 'BaseSindical', 'Union Base', 'UNION BASE', 'Sindicato', 'SINDICATO'],
      filiado: ['Filiado', 'FILIADO', 'Member', 'MEMBER', 'Filiacao', 'FILIAÇÃO', 'Union Member']
    };
    
    console.log('🗺️ Mapeamento de colunas configurado');
    
    // Função para encontrar valor de coluna mapeada (copiada do controlador)
    const findColumnValue = (row, targetColumns) => {
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
    
    // Função para converter data (copiada do controlador)
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
    
    // Função para truncar strings
    const truncateString = (value, maxLength) => {
      if (!value) return value;
      if (value.length <= maxLength) return value;
      return value.substring(0, maxLength);
    };
    
    console.log('\n📊 === PROCESSANDO REGISTRO DE TESTE ===');
    
    // Processar o primeiro registro
    const row = processedData.employees[0];
    
    // Mapear campos para base_dados
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
      base_sindical: truncateString(String(findColumnValue(row, columnMapping.base_sindical) || 'N/A'), 100),
      filiado: truncateString(String(findColumnValue(row, columnMapping.filiado) || 'N/A'), 10)
    };
    
    console.log('\n📋 === REGISTRO MAPEADO ===');
    console.log(JSON.stringify(baseDadosRecord, null, 2));
    
    // Validar campos obrigatórios
    console.log('\n🔍 === VALIDAÇÕES ===');
    
    if (!baseDadosRecord.nome || baseDadosRecord.nome === 'N/A') {
      console.log('❌ Nome é obrigatório');
    } else {
      console.log('✅ Nome válido');
    }
    
    if (!baseDadosRecord.base_sindical || baseDadosRecord.base_sindical === 'N/A') {
      console.log('❌ Base sindical é obrigatória');
    } else {
      console.log('✅ Base sindical válida');
    }
    
    if (!baseDadosRecord.data_nasc) {
      console.log('❌ Data de nascimento é obrigatória');
    } else {
      console.log('✅ Data de nascimento válida');
    }
    
    if (!baseDadosRecord.data_admissao) {
      console.log('❌ Data de admissão é obrigatória');
    } else {
      console.log('✅ Data de admissão válida');
    }
    
    // Tentar inserir no banco
    console.log('\n💾 === TESTANDO INSERÇÃO NO BANCO ===');
    
    if (baseDadosRecord.nome && baseDadosRecord.base_sindical && baseDadosRecord.data_nasc && baseDadosRecord.data_admissao) {
      console.log('✅ Todas as validações passaram, tentando inserir...');
      
      const result = await prisma.baseDados.create({
        data: baseDadosRecord
      });
      
      console.log('✅ Registro inserido com sucesso:', result);
      
      // Limpar o registro de teste
      await prisma.baseDados.delete({
        where: { id: result.id }
      });
      
      console.log('✅ Registro de teste removido');
    } else {
      console.log('❌ Validações falharam, não foi possível inserir');
    }
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
    console.error('📋 Stack trace:', error.stack);
  } finally {
    await prisma.$disconnect();
    console.log('🔌 Conexão com banco fechada');
  }
}

testImportLogic();
