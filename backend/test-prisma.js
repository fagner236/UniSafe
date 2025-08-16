const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  try {
    console.log('🔍 Testando conexão com Prisma...');
    
    const count = await prisma.user.count();
    console.log('✅ Usuários na tabela:', count);
    
    const companies = await prisma.company.findMany();
    console.log('✅ Empresas na tabela:', companies.length);
    
    await prisma.$disconnect();
    console.log('✅ Conexão fechada com sucesso');
  } catch (error) {
    console.error('❌ Erro:', error);
    await prisma.$disconnect();
  }
}

test();
