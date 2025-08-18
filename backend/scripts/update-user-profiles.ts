import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateUserProfiles() {
  try {
    console.log('🔄 Iniciando atualização de perfis de usuários...');

    // Buscar todas as empresas
    const companies = await prisma.company.findMany();
    console.log(`📋 Encontradas ${companies.length} empresas`);

    for (const company of companies) {
      console.log(`\n🏢 Processando empresa: ${company.razao_social} (${company.id_empresa})`);

      // Buscar usuários da empresa ordenados por data de criação
      const users = await prisma.user.findMany({
        where: { id_empresa: company.id_empresa },
        orderBy: { data_criacao: 'asc' },
        select: {
          id_usuario: true,
          nome: true,
          email: true,
          perfil: true,
          data_criacao: true
        }
      });

      console.log(`👥 Encontrados ${users.length} usuários na empresa`);

      if (users.length === 0) {
        console.log('⚠️ Nenhum usuário encontrado nesta empresa');
        continue;
      }

      // O primeiro usuário deve ser admin
      const firstUser = users[0];
      if (firstUser.perfil !== 'admin') {
        console.log(`👑 Atualizando primeiro usuário para admin: ${firstUser.nome} (${firstUser.email})`);
        await prisma.user.update({
          where: { id_usuario: firstUser.id_usuario },
          data: { perfil: 'admin' }
        });
      } else {
        console.log(`✅ Primeiro usuário já é admin: ${firstUser.nome}`);
      }

      // Os demais usuários devem ser ghost (se não forem admin)
      for (let i = 1; i < users.length; i++) {
        const user = users[i];
        if (user.perfil === 'user') {
          console.log(`👻 Atualizando usuário para ghost: ${user.nome} (${user.email})`);
          await prisma.user.update({
            where: { id_usuario: user.id_usuario },
            data: { perfil: 'ghost' }
          });
        } else if (user.perfil === 'admin') {
          console.log(`👑 Usuário já é admin: ${user.nome}`);
        } else if (user.perfil === 'ghost') {
          console.log(`👻 Usuário já é ghost: ${user.nome}`);
        } else {
          console.log(`❓ Perfil desconhecido: ${user.nome} - ${user.perfil}`);
        }
      }
    }

    console.log('\n✅ Atualização de perfis concluída com sucesso!');
    
    // Estatísticas finais
    const totalUsers = await prisma.user.count();
    const adminUsers = await prisma.user.count({ where: { perfil: 'admin' } });
    const ghostUsers = await prisma.user.count({ where: { perfil: 'ghost' } });
    const userUsers = await prisma.user.count({ where: { perfil: 'user' } });

    console.log('\n📊 Estatísticas finais:');
    console.log(`👥 Total de usuários: ${totalUsers}`);
    console.log(`👑 Administradores: ${adminUsers}`);
    console.log(`👻 Ghost: ${ghostUsers}`);
    console.log(`👤 User: ${userUsers}`);

  } catch (error) {
    console.error('❌ Erro durante a atualização:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar o script
updateUserProfiles();
