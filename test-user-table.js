const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testUserTable() {
  try {
    console.log('🧪 Testando estrutura da tabela de usuários...');
    
    // Verificar estrutura da tabela
    const users = await prisma.user.findMany({
      select: {
        id_usuario: true,
        nome: true,
        email: true,
        id_empresa: true,
        perfil: true,
        data_criacao: true
      },
      orderBy: {
        data_criacao: 'desc'
      },
      take: 5
    });
    
    console.log('📊 Usuários encontrados:', users.length);
    users.forEach((user, index) => {
      console.log(`\n👤 Usuário ${index + 1}:`);
      console.log('  ID:', user.id_usuario);
      console.log('  Nome:', user.nome);
      console.log('  Email:', user.email);
      console.log('  ID Empresa:', user.id_empresa);
      console.log('  Perfil:', user.perfil);
      console.log('  Data Criação:', user.data_criacao);
    });
    
    // Verificar empresas
    const companies = await prisma.company.findMany({
      select: {
        id_empresa: true,
        razao_social: true,
        cnpj: true
      },
      orderBy: {
        data_criacao: 'desc'
      },
      take: 3
    });
    
    console.log('\n🏢 Empresas encontradas:', companies.length);
    companies.forEach((company, index) => {
      console.log(`\n  Empresa ${index + 1}:`);
      console.log('    ID:', company.id_empresa);
      console.log('    Razão Social:', company.razao_social);
      console.log('    CNPJ:', company.cnpj);
    });
    
  } catch (error) {
    console.error('❌ Erro ao testar tabela:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testUserTable();
