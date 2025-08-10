import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUser() {
  try {
    console.log('🔍 Verificando usuário no banco de dados...');
    
    const user = await prisma.user.findUnique({
      where: { email: 'admin@unisafe.com' }
    });

    if (user) {
      console.log('✅ Usuário encontrado:');
      console.log('📧 Email:', user.email);
      console.log('👤 Nome:', user.name);
      console.log('🔐 Role:', user.role);
      console.log('🆔 ID:', user.id);
      console.log('📅 Criado em:', user.createdAt);
    } else {
      console.log('❌ Usuário não encontrado');
    }

    // Listar todos os usuários
    const allUsers = await prisma.user.findMany();
    console.log('\n📋 Todos os usuários no banco:');
    allUsers.forEach((u, index) => {
      console.log(`${index + 1}. ${u.email} (${u.name}) - ${u.role}`);
    });

  } catch (error) {
    console.error('❌ Erro ao verificar usuário:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUser();
