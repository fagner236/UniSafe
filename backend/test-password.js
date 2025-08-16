const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function testPassword() {
  try {
    console.log('🔐 Testando senha para fagner.jr13@gmail.com...');
    
    const user = await prisma.user.findUnique({
      where: { email: 'fagner.jr13@gmail.com' }
    });

    if (!user) {
      console.log('❌ Usuário não encontrado');
      return;
    }

    console.log(`✅ Usuário encontrado: ${user.nome}`);
    console.log(`📧 Email: ${user.email}`);
    console.log(`🔑 Hash da senha: ${user.senha.substring(0, 20)}...`);

    // Testar a senha fornecida
    const testPassword = 'ALIgor2010';
    const isValid = await bcrypt.compare(testPassword, user.senha);

    if (isValid) {
      console.log('✅ Senha ALIgor2010 está CORRETA!');
    } else {
      console.log('❌ Senha ALIgor2010 está INCORRETA');
      
      // Testar algumas variações comuns
      const commonVariations = [
        'aligor2010',
        'Aligor2010',
        'ALIGOR2010',
        'aligor 2010',
        'Aligor 2010'
      ];

      console.log('\n🔍 Testando variações comuns...');
      for (const variation of commonVariations) {
        const isValidVariation = await bcrypt.compare(variation, user.senha);
        if (isValidVariation) {
          console.log(`✅ Senha correta encontrada: "${variation}"`);
          break;
        }
      }
    }

  } catch (error) {
    console.error('❌ Erro ao testar senha:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testPassword();
