const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testInsert() {
  try {
    console.log('🧪 === TESTE DE INSERÇÃO DIRETA ===');
    
    // Dados de teste fornecidos pelo usuário
    const testData = {
      mes: '08/2025',
      se: 'SE/MG',
      lotacao: 'AC AGUAS FORMOSAS',
      municipio: 'AGUAS FORMOSAS',
      matricula: '84184060',
      nome: 'MARCIO SOARES DE OLIVEIRA',
      sexo: 'M',
      data_nasc: '02/07/1983',
      raca: 'Parda',
      grau_instrucao: 'MÉDIO',
      data_admissao: '09/12/2004',
      cargo: 'AGENTE DE CORREIOS',
      cargo_esp: 'ATENDENTE COMERCIAL',
      cargo_nivel: 'Medio',
      funcao: 'GERENTE AGENCIA DE CORREIO IV',
      jornada_trab: '40h',
      tipo_deficiencia: 'VISUAL',
      data_afast: '18/11/2023',
      motivo_afast: 'LICENÇA INSS ACT 2023',
      base_sindical: 'SINTECT/MG',
      filiado: 'SINTECT/MG',
      valor_mensalidade: 63.98
    };

    console.log('📋 Dados de teste:', testData);

    // Função para converter data DD/MM/AAAA para Date
    function parseDate(dateStr) {
      if (!dateStr) return null;
      
      const parts = dateStr.split('/');
      if (parts.length === 3) {
        const day = parseInt(parts[0]);
        const month = parseInt(parts[1]) - 1; // Mês começa em 0
        const year = parseInt(parts[2]);
        
        const date = new Date(year, month, day);
        console.log(`📅 Convertendo "${dateStr}" para ${date.toISOString()}`);
        return date;
      }
      
      console.log(`❌ Formato de data inválido: ${dateStr}`);
      return null;
    }

    // Preparar dados para inserção
    const insertData = {
      mes: testData.mes,
      se: testData.se,
      lotacao: testData.lotacao,
      municipio: testData.municipio,
      matricula: testData.matricula,
      nome: testData.nome,
      sexo: testData.sexo,
      data_nasc: parseDate(testData.data_nasc),
      raca: testData.raca,
      grau_instrucao: testData.grau_instrucao,
      data_admissao: parseDate(testData.data_admissao),
      cargo: testData.cargo,
      cargo_esp: testData.cargo_esp,
      cargo_nivel: testData.cargo_nivel,
      funcao: testData.funcao,
      jornada_trab: testData.jornada_trab,
      tipo_deficiencia: testData.tipo_deficiencia,
      data_afast: parseDate(testData.data_afast),
      motivo_afast: testData.motivo_afast,
      base_sindical: testData.base_sindical,
      filiado: testData.filiado,
      valor_mensalidade: testData.valor_mensalidade
    };

    console.log('📊 Dados preparados para inserção:', insertData);

    // Tentar inserir na tabela base_dados
    console.log('💾 Tentando inserir na tabela base_dados...');
    
    const result = await prisma.baseDados.create({
      data: insertData
    });

    console.log('✅ Inserção realizada com sucesso!');
    console.log('📋 Registro criado:', result);

  } catch (error) {
    console.error('❌ Erro na inserção:', error);
    
    // Mostrar detalhes do erro
    if (error.code) {
      console.error('Código do erro:', error.code);
    }
    if (error.meta) {
      console.error('Meta do erro:', error.meta);
    }
    
    // Verificar se é erro de validação
    if (error.message.includes('Invalid value')) {
      console.error('🔍 Erro de validação - verificar tipos de dados');
    }
    
    // Verificar se é erro de constraint
    if (error.message.includes('constraint')) {
      console.error('🔍 Erro de constraint - verificar regras do banco');
    }
  } finally {
    await prisma.$disconnect();
  }
}

// Executar o teste
testInsert();
