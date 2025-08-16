const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    console.log('🔧 Criando usuário de teste...');
    
    // Senha simples para teste
    const password = '123456';
    const saltRounds = 12;
    
    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    console.log('✅ Senha hashada gerada');
    
    // Dados do usuário
    const userData = {
      id_usuario: 'test-user-' + Date.now(),
      nome: 'Usuário Teste Sistema',
      email: 'admin@teste.com',
      senha: hashedPassword,
      perfil: 'admin',
      data_criacao: new Date(),
      data_atualizacao: new Date()
    };
    
    console.log('📝 Dados do usuário:', { ...userData, senha: '[HASHED]' });
    
    // Criar usuário no banco
    const user = await prisma.user.create({
      data: userData,
      select: {
        id_usuario: true,
        nome: true,
        email: true,
        perfil: true,
        data_criacao: true
      }
    });
    
    console.log('✅ Usuário criado com sucesso:', user);
    console.log('🔑 Credenciais de teste:');
    console.log('   Email: admin@teste.com');
    console.log('   Senha: 123456');
    
  } catch (error) {
    console.error('❌ Erro ao criar usuário:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();
