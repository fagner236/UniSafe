const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function debugFinal() {
  try {
    console.log('🔍 Debug final - Testando cada etapa...');
    
    // Dados de teste
    const nome = 'Debug Final';
    const email = 'debug@final.com';
    const password = 'Debug123';
    const companyId = 'cmeeiutcu00007z134la8x6sz';
    
    console.log('1. Dados de teste:', { nome, email, password, companyId });
    
    // Verificar se usuário já existe
    console.log('2. Verificando usuário existente...');
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      console.log('❌ Usuário já existe, removendo...');
      await prisma.user.delete({
        where: { id_usuario: existingUser.id_usuario }
      });
      console.log('✅ Usuário removido');
    }
    
    // Verificar empresa
    console.log('3. Verificando empresa...');
    const company = await prisma.company.findUnique({
      where: { id_empresa: companyId }
    });
    
    if (!company) {
      console.log('❌ Empresa não encontrada');
      return;
    }
    
    console.log('✅ Empresa encontrada:', company.razao_social);
    
    // Contar usuários da empresa
    console.log('4. Contando usuários da empresa...');
    const userCount = await prisma.user.count({
      where: { id_empresa: companyId }
    });
    
    console.log('✅ Usuários na empresa:', userCount);
    
    // Definir perfil
    const perfil = userCount === 0 ? 'admin' : 'user';
    console.log('5. Perfil definido:', perfil);
    
    // Hash da senha
    console.log('6. Criando hash da senha...');
    const hashedPassword = await bcrypt.hash(password, 12);
    console.log('✅ Hash criado');
    
    // Criar usuário
    console.log('7. Criando usuário...');
    const userData = {
      nome: nome.trim(),
      email: email.toLowerCase().trim(),
      senha: hashedPassword,
      perfil: perfil,
      id_empresa: companyId,
      data_criacao: new Date(),
      data_atualizacao: new Date()
    };
    
    console.log('   - Dados a serem inseridos:', userData);
    
    const user = await prisma.user.create({
      data: userData,
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
    console.error('❌ Erro no debug final:', error);
    console.error('Stack trace:', error.stack);
    
    // Verificar se é erro do Prisma
    if (error.code) {
      console.error('Código do erro:', error.code);
    }
    
    if (error.meta) {
      console.error('Meta do erro:', error.meta);
    }
  } finally {
    await prisma.$disconnect();
    console.log('🔌 Conexão fechada');
  }
}

debugFinal();
