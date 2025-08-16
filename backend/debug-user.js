const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function debugUserCreation() {
  try {
    console.log('🔍 Iniciando debug de criação de usuário...');
    
    // 1. Verificar se a empresa existe
    console.log('1. Verificando empresa...');
    const company = await prisma.company.findUnique({
      where: { id_empresa: 'cmeeiutcu00007z134la8x6sz' }
    });
    console.log('✅ Empresa encontrada:', company ? 'Sim' : 'Não');
    
    if (company) {
      console.log('   - ID:', company.id_empresa);
      console.log('   - Nome:', company.razao_social);
    }
    
    // 2. Verificar contagem de usuários
    console.log('2. Verificando contagem de usuários...');
    const userCount = await prisma.user.count({
      where: { id_empresa: 'cmeeiutcu00007z134la8x6sz' }
    });
    console.log('✅ Usuários na empresa:', userCount);
    
    // 3. Verificar se o email já existe
    console.log('3. Verificando email...');
    const existingUser = await prisma.user.findUnique({
      where: { email: 'debug@teste.com' }
    });
    console.log('✅ Usuário com email existe:', existingUser ? 'Sim' : 'Não');
    
    // 4. Testar hash da senha
    console.log('4. Testando hash da senha...');
    const password = 'Debug123';
    const hashedPassword = await bcrypt.hash(password, 12);
    console.log('✅ Hash da senha criado:', hashedPassword ? 'Sim' : 'Não');
    
    // 5. Tentar criar o usuário
    console.log('5. Tentando criar usuário...');
    const perfil = userCount === 0 ? 'admin' : 'user';
    console.log('   - Perfil definido:', perfil);
    
    const user = await prisma.user.create({
      data: {
        nome: 'Teste Debug',
        email: 'debug@teste.com',
        senha: hashedPassword,
        perfil: perfil,
        id_empresa: 'cmeeiutcu00007z134la8x6sz',
        data_criacao: new Date(),
        data_atualizacao: new Date()
      },
      select: {
        id_usuario: true,
        nome: true,
        email: true,
        perfil: true,
        id_empresa: true,
        data_criacao: true
      }
    });
    
    console.log('✅ Usuário criado com sucesso:', user);
    
  } catch (error) {
    console.error('❌ Erro durante debug:', error);
    console.error('Stack trace:', error.stack);
  } finally {
    await prisma.$disconnect();
    console.log('🔌 Conexão com Prisma fechada');
  }
}

debugUserCreation();
