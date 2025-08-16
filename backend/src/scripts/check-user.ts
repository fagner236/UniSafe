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
      console.log('👤 Nome:', user.nome);
      console.log('🔐 Role:', user.perfil);
      console.log('🆔 ID:', user.id_usuario);
      console.log('📅 Criado em:', user.data_criacao);
    } else {
      console.log('❌ Usuário não encontrado');
    }

    // Listar todos os usuários
    const allUsers = await prisma.user.findMany();
    console.log('\n📋 Todos os usuários no banco:');
    allUsers.forEach((u, index) => {
      console.log(`${index + 1}. ${u.email} (${u.nome}) - ${u.perfil}`);
    });

  } catch (error) {
    console.error('❌ Erro ao verificar usuário:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUser();
