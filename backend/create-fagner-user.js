const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createFagnerUser() {
  try {
    console.log('🔧 Criando usuário fagner236@hotmail.com...');
    
    // Senha para o usuário Fagner (você pode alterar)
    const password = '123456';
    const saltRounds = 12;
    
    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    console.log('✅ Senha hashada gerada');
    
    // Dados do usuário Fagner
    const userData = {
      id_usuario: 'fagner-user-' + Date.now(),
      nome: 'Fagner José Rodrigues',
      email: 'fagner236@hotmail.com',
      senha: hashedPassword,
      perfil: 'admin',
      data_criacao: new Date(),
      data_atualizacao: new Date()
    };
    
    console.log('📝 Dados do usuário:', { ...userData, senha: '[HASHED]' });
    
    // Verificar se usuário já existe
    const existingUser = await prisma.user.findUnique({
      where: { email: 'fagner236@hotmail.com' }
    });
    
    if (existingUser) {
      console.log('⚠️ Usuário já existe:', existingUser.email);
      return;
    }
    
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
    
    console.log('✅ Usuário Fagner criado com sucesso:', user);
    console.log('🔑 Credenciais de login:');
    console.log('   Email: fagner236@hotmail.com');
    console.log('   Senha: 123456');
    
  } catch (error) {
    console.error('❌ Erro ao criar usuário:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createFagnerUser();
