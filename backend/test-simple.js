const { PrismaClient } = require('@prisma/client');

async function testSimple() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🧪 Teste simples de criação de empregado...');
    
    // Tentar criar um empregado diretamente
    const empregado = await prisma.empregado.create({
      data: {
        matricula: '12345678',
        email: 'teste@empresa.com',
        celular: '(11) 99999-9999',
        id_usuario: 'test-user-id',
        data_criacao: new Date(),
        data_atualizacao: new Date()
      }
    });
    
    console.log('✅ Empregado criado com sucesso:', empregado);
    
    // Listar empregados
    const empregados = await prisma.empregado.findMany();
    console.log('📊 Total de empregados:', empregados.length);
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testSimple();