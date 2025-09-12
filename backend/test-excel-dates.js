const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testExcelDates() {
  try {
    console.log('🧪 === TESTE DE CONVERSÃO DE DATAS DO EXCEL ===');
    
    // Números do Excel encontrados na tabela employeeData
    const excelDates = [
      { name: 'DATA ADMISSÃO 1', value: 38572 },
      { name: 'DATA NASCIMENTO 1', value: 27161 },
      { name: 'DATA ADMISSÃO 2', value: 38467 },
      { name: 'DATA NASCIMENTO 2', value: 28731 },
      { name: 'DATA ADMISSÃO 3', value: 38464 },
      { name: 'DATA NASCIMENTO 3', value: 27862 },
      { name: 'DATA ADMISSÃO 4', value: 38412 },
      { name: 'DATA NASCIMENTO 4', value: 27670 },
      { name: 'DATA AFASTAMENTO 4', value: 42870 },
      { name: 'DATA ADMISSÃO 5', value: 38324 },
      { name: 'DATA NASCIMENTO 5', value: 29911 }
    ];

    // Função parseDate corrigida (copiada do backend)
    const parseDate = (dateValue) => {
      if (!dateValue) return null;
      
      console.log(`🔄 Tentando converter data: ${dateValue} (tipo: ${typeof dateValue})`);
      
      // Se já é uma data
      if (dateValue instanceof Date) {
        console.log(`✅ Já é uma data válida: ${dateValue}`);
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

    // Testar cada data do Excel
    console.log('\n📊 === TESTANDO CONVERSÕES ===');
    
    let successCount = 0;
    let errorCount = 0;
    
    excelDates.forEach(({ name, value }) => {
      console.log(`\n🔍 ${name}: ${value}`);
      const convertedDate = parseDate(value);
      
      if (convertedDate) {
        console.log(`✅ Sucesso: ${convertedDate.toISOString().split('T')[0]}`);
        successCount++;
      } else {
        console.log(`❌ Falha na conversão`);
        errorCount++;
      }
    });

    console.log(`\n📊 === RESULTADO FINAL ===`);
    console.log(`✅ Conversões bem-sucedidas: ${successCount}`);
    console.log(`❌ Conversões falharam: ${errorCount}`);
    console.log(`📈 Taxa de sucesso: ${((successCount / excelDates.length) * 100).toFixed(1)}%`);

    if (successCount === excelDates.length) {
      console.log(`\n🎉 TODAS AS DATAS FORAM CONVERTIDAS COM SUCESSO!`);
      console.log(`🔍 O problema estava na prioridade da conversão de números do Excel`);
    } else {
      console.log(`\n⚠️ Ainda há problemas na conversão de algumas datas`);
    }

  } catch (error) {
    console.error('❌ Erro no teste:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar o teste
testExcelDates();
