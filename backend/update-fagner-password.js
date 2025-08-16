const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateFagnerPassword() {
  try {
    console.log('🔧 Atualizando senha do usuário fagner236@hotmail.com...');
    
    // Nova senha para o usuário Fagner
    const newPassword = '123456';
    const saltRounds = 12;
    
    // Hash da nova senha
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    console.log('✅ Nova senha hashada gerada');
    
    // Atualizar senha no banco
    const updatedUser = await prisma.user.update({
      where: { email: 'fagner236@hotmail.com' },
      data: { 
        senha: hashedPassword,
        data_atualizacao: new Date()
      },
      select: {
        id_usuario: true,
        nome: true,
        email: true,
        perfil: true,
        data_atualizacao: true
      }
    });
    
    console.log('✅ Senha atualizada com sucesso:', updatedUser);
    console.log('🔑 Nova senha de login:');
    console.log('   Email: fagner236@hotmail.com');
    console.log('   Senha: 123456');
    
  } catch (error) {
    console.error('❌ Erro ao atualizar senha:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateFagnerPassword();
