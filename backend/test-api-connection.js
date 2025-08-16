const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testApiConnection() {
  try {
    console.log('🔌 Testando conexão com o banco de dados...');
    
    // Testar conexão básica
    await prisma.$connect();
    console.log('✅ Conexão com banco estabelecida');
    
    // Testar query simples
    const userCount = await prisma.user.count();
    console.log(`📊 Total de usuários no banco: ${userCount}`);
    
    // Testar busca específica
    const user = await prisma.user.findUnique({
      where: { email: 'fagner.jr13@gmail.com' }
    });
    
    if (user) {
      console.log(`✅ Usuário encontrado: ${user.nome}`);
      console.log(`📧 Email: ${user.email}`);
      console.log(`🔑 Hash da senha: ${user.senha.substring(0, 20)}...`);
    } else {
      console.log('❌ Usuário não encontrado');
    }
    
    // Testar query com select específico
    const userSelect = await prisma.user.findUnique({
      where: { email: 'fagner.jr13@gmail.com' },
      select: {
        id_usuario: true,
        nome: true,
        email: true,
        perfil: true
      }
    });
    
    if (userSelect) {
      console.log(`✅ Query com select funcionando: ${userSelect.nome}`);
    }
    
  } catch (error) {
    console.error('❌ Erro na conexão:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testApiConnection();
