const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function testPassword() {
  try {
    console.log('🔍 Testando senha da usuária fabyghira19@gmail.com...');
    
    const user = await prisma.user.findUnique({
      where: { email: 'fabyghira19@gmail.com' },
      select: {
        id_usuario: true,
        nome: true,
        email: true,
        senha: true,
        base_sindical: true
      }
    });
    
    if (user) {
      console.log('✅ Usuária encontrada:', user.nome);
      console.log('📊 Base sindical:', user.base_sindical);
      
      // Testar senha 123456
      const isValidPassword = await bcrypt.compare('123456', user.senha);
      console.log('🔐 Senha 123456 válida:', isValidPassword);
      
      // Testar outras senhas comuns
      const commonPasswords = ['123456', 'password', 'admin', 'fabyghira19', 'Fabiana123'];
      
      for (const password of commonPasswords) {
        const isValid = await bcrypt.compare(password, user.senha);
        console.log(`🔐 Senha "${password}" válida:`, isValid);
      }
      
    } else {
      console.log('❌ Usuária não encontrada');
    }
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testPassword();
