import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUser() {
  try {
    console.log('🔍 Verificando usuários no banco de dados...');
    
    // Buscar todos os usuários
    const users = await prisma.user.findMany({
      select: {
        id_usuario: true,
        nome: true,
        email: true,
        perfil: true,
        id_empresa: true,
        empresa: {
          select: {
            id_empresa: true,
            razao_social: true,
            nome_fantasia: true,
            cnpj: true
          }
        }
      }
    });

    console.log('\n📋 Usuários encontrados:');
    users.forEach((user, index) => {
      console.log(`\n${index + 1}. ${user.nome} (${user.email})`);
      console.log(`   Perfil: ${user.perfil}`);
      console.log(`   ID Empresa: ${user.id_empresa || 'NENHUM (Dono do sistema)'}`);
      if (user.empresa) {
        console.log(`   Empresa: ${user.empresa.nome_fantasia || user.empresa.razao_social}`);
        console.log(`   CNPJ: ${user.empresa.cnpj}`);
      } else {
        console.log(`   Empresa: NENHUMA (Dono do sistema)`);
      }
    });

    // Contar usuários por tipo
    const systemOwners = users.filter(u => !u.id_empresa);
    const companyUsers = users.filter(u => u.id_empresa);

    console.log('\n📊 Estatísticas:');
    console.log(`   Total de usuários: ${users.length}`);
    console.log(`   Donos do sistema: ${systemOwners.length}`);
    console.log(`   Usuários de empresa: ${companyUsers.length}`);

    if (systemOwners.length > 0) {
      console.log('\n👑 Donos do sistema:');
      systemOwners.forEach(user => {
        console.log(`   - ${user.nome} (${user.email}) - ${user.perfil}`);
      });
    }

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUser();
