const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testDbConfig() {
  try {
    console.log('🔧 Testando configuração do banco de dados...');
    
    // Verificar variáveis de ambiente
    console.log(`\n1️⃣ Variáveis de ambiente:`);
    console.log(`   DATABASE_URL: ${process.env.DATABASE_URL}`);
    console.log(`   JWT_SECRET: ${process.env.JWT_SECRET ? '✅ Configurada' : '❌ Não configurada'}`);
    console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
    
    // Testar conexão com banco
    console.log(`\n2️⃣ Testando conexão com banco:`);
    await prisma.$connect();
    console.log(`   ✅ Conexão estabelecida`);
    
    // Testar query simples
    console.log(`\n3️⃣ Testando query simples:`);
    const userCount = await prisma.user.count();
    console.log(`   ✅ Total de usuários: ${userCount}`);
    
    // Testar busca específica
    console.log(`\n4️⃣ Testando busca específica:`);
    const user = await prisma.user.findUnique({
      where: { email: 'fagner.jr13@gmail.com' }
    });
    
    if (user) {
      console.log(`   ✅ Usuário encontrado: ${user.nome}`);
      console.log(`   📧 Email: ${user.email}`);
      console.log(`   🔑 Hash da senha: ${user.senha.substring(0, 20)}...`);
    } else {
      console.log(`   ❌ Usuário não encontrado`);
    }
    
    // Testar query com select
    console.log(`\n5️⃣ Testando query com select:`);
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
      console.log(`   ✅ Query com select funcionando: ${userSelect.nome}`);
      console.log(`   📊 Dados retornados:`, userSelect);
    } else {
      console.log(`   ❌ Query com select falhou`);
    }
    
    // Testar query com where específico
    console.log(`\n6️⃣ Testando query com where específico:`);
    const userWhere = await prisma.user.findFirst({
      where: {
        email: {
          equals: 'fagner.jr13@gmail.com'
        }
      }
    });
    
    if (userWhere) {
      console.log(`   ✅ Query com where funcionando: ${userWhere.nome}`);
    } else {
      console.log(`   ❌ Query com where falhou`);
    }
    
    console.log(`\n🎉 Configuração do banco funcionando perfeitamente!`);

  } catch (error) {
    console.error('❌ Erro na configuração do banco:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDbConfig();
