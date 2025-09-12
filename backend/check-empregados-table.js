const { PrismaClient } = require('@prisma/client');

async function checkEmpregadosTable() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Verificando se a tabela empregados existe...');
    
    // Tentar buscar todos os empregados
    const empregados = await prisma.empregado.findMany();
    console.log('✅ Tabela empregados existe e está acessível');
    console.log(`📊 Total de empregados: ${empregados.length}`);
    
    // Verificar estrutura da tabela
    const tableInfo = await prisma.$queryRaw`
      DESCRIBE empregados
    `;
    console.log('📋 Estrutura da tabela empregados:');
    console.table(tableInfo);
    
  } catch (error) {
    console.error('❌ Erro ao verificar tabela empregados:', error);
    
    if (error.code === 'P2021') {
      console.log('🔧 Tabela empregados não existe. Criando migração...');
      
      // Verificar se existe alguma migração pendente
      try {
        const migrations = await prisma.$queryRaw`
          SELECT * FROM _prisma_migrations 
          WHERE migration_name LIKE '%empregados%'
          ORDER BY finished_at DESC
        `;
        console.log('📋 Migrações relacionadas a empregados:', migrations);
      } catch (migrationError) {
        console.log('⚠️ Não foi possível verificar migrações:', migrationError.message);
      }
    }
  } finally {
    await prisma.$disconnect();
  }
}

checkEmpregadosTable();
