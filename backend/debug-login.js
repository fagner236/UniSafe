const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function debugLogin() {
  try {
    console.log('🔍 Debugando processo de login...');
    
    const email = 'fagner.jr13@gmail.com';
    const password = 'ALIgor2010';
    
    console.log(`\n1️⃣ Dados de entrada:`);
    console.log(`   Email: ${email}`);
    console.log(`   Senha: ${password}`);
    
    // Simular validação do middleware
    console.log(`\n2️⃣ Validação do middleware:`);
    
    // Validação de email
    const normalizedEmail = email.toLowerCase().trim();
    console.log(`   Email normalizado: ${normalizedEmail}`);
    
    // Validação de senha
    const isPasswordValid = password.length >= 6;
    console.log(`   Senha válida (>=6 chars): ${isPasswordValid}`);
    
    if (!isPasswordValid) {
      console.log('   ❌ Senha rejeitada pelo middleware');
      return;
    }
    
    console.log(`   ✅ Validação do middleware passou`);
    
    // Buscar usuário no banco
    console.log(`\n3️⃣ Buscando usuário no banco:`);
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });

    if (!user) {
      console.log('   ❌ Usuário não encontrado');
      return;
    }

    console.log(`   ✅ Usuário encontrado: ${user.nome}`);
    console.log(`   📧 Email no banco: ${user.email}`);
    console.log(`   🔑 Hash da senha: ${user.senha.substring(0, 20)}...`);
    
    // Verificar senha
    console.log(`\n4️⃣ Verificando senha:`);
    const isValidPassword = await bcrypt.compare(password, user.senha);
    console.log(`   🔐 Senha válida: ${isValidPassword}`);
    
    if (!isValidPassword) {
      console.log('   ❌ Senha incorreta');
      return;
    }
    
    console.log(`   ✅ Senha correta!`);
    
    // Gerar token JWT
    console.log(`\n5️⃣ Gerando token JWT:`);
    const jwt = require('jsonwebtoken');
    
    if (process.env.JWT_SECRET) {
      const token = jwt.sign(
        { userId: user.id_usuario, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );
      console.log(`   ✅ Token gerado: ${token.substring(0, 50)}...`);
      
      // Verificar se o token pode ser decodificado
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log(`   ✅ Token válido, userId: ${decoded.userId}`);
      } catch (error) {
        console.log(`   ❌ Erro ao verificar token: ${error.message}`);
      }
    } else {
      console.log('   ❌ JWT_SECRET não configurado');
    }
    
    console.log(`\n🎉 Processo de login completo e funcionando!`);

  } catch (error) {
    console.error('❌ Erro no debug:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugLogin();
