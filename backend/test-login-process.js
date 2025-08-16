const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function testLoginProcess() {
  try {
    console.log('🔐 Testando processo completo de login...');
    
    const email = 'fagner.jr13@gmail.com';
    const password = 'ALIgor2010';
    
    console.log(`📧 Email original: ${email}`);
    console.log(`🔑 Senha: ${password}`);
    
    // Simular a normalização do email (como no middleware)
    const normalizedEmail = email.toLowerCase().trim();
    console.log(`📧 Email normalizado: ${normalizedEmail}`);
    
    // Buscar usuário no banco
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });

    if (!user) {
      console.log('❌ Usuário não encontrado com email normalizado');
      return;
    }

    console.log(`✅ Usuário encontrado: ${user.nome}`);
    console.log(`🔑 Hash da senha no banco: ${user.senha.substring(0, 20)}...`);
    
    // Testar comparação de senha
    const isValidPassword = await bcrypt.compare(password, user.senha);
    console.log(`🔐 Senha válida: ${isValidPassword}`);
    
    if (isValidPassword) {
      console.log('✅ Login seria bem-sucedido!');
      
      // Simular geração de token JWT
      console.log('🎫 Gerando token JWT...');
      const jwt = require('jsonwebtoken');
      
      if (process.env.JWT_SECRET) {
        const token = jwt.sign(
          { userId: user.id_usuario, email: user.email },
          process.env.JWT_SECRET,
          { expiresIn: '24h' }
        );
        console.log(`✅ Token gerado: ${token.substring(0, 50)}...`);
      } else {
        console.log('❌ JWT_SECRET não configurado');
      }
    } else {
      console.log('❌ Senha inválida - verificar hash no banco');
      
      // Verificar se o hash mudou
      console.log('\n🔍 Verificando hash da senha...');
      const testHash = await bcrypt.hash(password, 12);
      console.log(`🔑 Hash da senha de teste: ${testHash.substring(0, 20)}...`);
      console.log(`🔑 Hash no banco: ${user.senha.substring(0, 20)}...`);
      console.log(`🔐 Hashs são iguais: ${testHash === user.senha}`);
    }

  } catch (error) {
    console.error('❌ Erro no teste:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testLoginProcess();
