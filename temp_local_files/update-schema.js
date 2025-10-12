const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateSchema() {
  try {
    console.log('🔧 Atualizando schema do banco de produção...');
    
    // Executar a migração diretamente
    await prisma.$executeRaw`ALTER TABLE empregados MODIFY COLUMN celular VARCHAR(20) NULL;`;
    
    console.log('✅ Schema atualizado com sucesso!');
    
    // Verificar se a alteração foi aplicada
    const result = await prisma.$queryRaw`DESCRIBE empregados`;
    console.log('📊 Estrutura atual da tabela empregados:');
    result.forEach(column => {
      if (column.Field === 'celular') {
        console.log(`   - ${column.Field}: ${column.Type} ${column.Null === 'YES' ? '(nullable)' : '(not null)'}`);
      }
    });
    
  } catch (error) {
    console.error('❌ Erro ao atualizar schema:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateSchema();
