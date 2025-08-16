const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkUsers() {
  try {
    console.log('🔍 Verificando usuários no banco de dados...');
    
    const users = await prisma.user.findMany({
      select: {
        id_usuario: true,
        nome: true,
        email: true,
        perfil: true,
        data_criacao: true
      }
    });

    if (users.length === 0) {
      console.log('❌ Nenhum usuário encontrado no banco de dados');
      console.log('💡 Execute o script de seed para criar usuários de teste');
    } else {
      console.log(`✅ Encontrados ${users.length} usuário(s):`);
      users.forEach((user, index) => {
        console.log(`${index + 1}. ${user.nome} (${user.email}) - Perfil: ${user.perfil}`);
      });
    }

    // Verificar se o usuário específico existe
    const specificUser = await prisma.user.findUnique({
      where: { email: 'fagner.jr13@gmail.com' }
    });

    if (specificUser) {
      console.log('\n✅ Usuário fagner.jr13@gmail.com encontrado:');
      console.log(`   Nome: ${specificUser.nome}`);
      console.log(`   Perfil: ${specificUser.perfil}`);
      console.log(`   Data de criação: ${specificUser.data_criacao}`);
    } else {
      console.log('\n❌ Usuário fagner.jr13@gmail.com NÃO encontrado');
    }

  } catch (error) {
    console.error('❌ Erro ao verificar usuários:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();
