const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testImport() {
  try {
    console.log('🧪 === TESTE DE IMPORTAÇÃO PARA BASE_DADOS ===');
    
    // Testar conexão com o banco
    console.log('🔌 Testando conexão com o banco...');
    await prisma.$connect();
    console.log('✅ Conexão com banco estabelecida');
    
    // Verificar se a tabela base_dados existe
    console.log('📋 Verificando tabela base_dados...');
    const tableExists = await prisma.$queryRaw`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = 'UniSafe' 
      AND table_name = 'base_dados'
    `;
    console.log('📊 Resultado da verificação:', tableExists);
    
    // Testar inserção de um registro simples
    console.log('📝 Testando inserção de registro...');
    const testRecord = {
      mes: 'TESTE',
      se: 'TESTE',
      lotacao: 'TESTE',
      municipio: 'TESTE',
      matricula: 'TESTE001',
      nome: 'Usuário Teste',
      sexo: 'M',
      data_nasc: new Date('1990-01-01'),
      raca: 'TESTE',
      grau_instrucao: 'TESTE',
      data_admissao: new Date('2020-01-01'),
      cargo: 'TESTE',
      base_sindical: 'TESTE',
      filiado: 'S'
    };
    
    console.log('📋 Dados de teste:', testRecord);
    
    const result = await prisma.baseDados.create({
      data: testRecord
    });
    
    console.log('✅ Registro inserido com sucesso:', result);
    
    // Limpar o registro de teste
    console.log('🧹 Limpando registro de teste...');
    await prisma.baseDados.delete({
      where: { id: result.id }
    });
    console.log('✅ Registro de teste removido');
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
    console.error('📋 Stack trace:', error.stack);
  } finally {
    await prisma.$disconnect();
    console.log('🔌 Conexão com banco fechada');
  }
}

testImport();
