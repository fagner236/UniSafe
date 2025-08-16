const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function testController() {
  try {
    console.log('🔍 Testando lógica do controller...');
    
    // Simular dados da requisição
    const req = {
      body: {
        nome: 'Teste Controller',
        email: 'controller@teste.com',
        password: 'Controller123',
        companyId: 'cmeeiutcu00007z134la8x6sz'
      }
    };
    
    console.log('1. Dados da requisição:', req.body);
    
    // Extrair dados
    const { nome, email, password, companyId } = req.body;
    
    // Verificar se usuário já existe
    console.log('2. Verificando usuário existente...');
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      console.log('❌ Usuário já existe');
      return;
    }
    
    console.log('✅ Usuário não existe, pode prosseguir');
    
    // Verificar empresa se companyId for fornecido
    let perfil = 'user';
    
    if (companyId) {
      console.log('3. Verificando empresa...');
      const company = await prisma.company.findUnique({
        where: { id_empresa: companyId }
      });
      
      if (!company) {
        console.log('❌ Empresa não encontrada');
        return;
      }
      
      console.log('✅ Empresa encontrada:', company.razao_social);
      
      // Verificar se é o primeiro usuário da empresa
      const userCount = await prisma.user.count({
        where: { id_empresa: companyId }
      });
      
      perfil = userCount === 0 ? 'admin' : 'user';
      console.log('4. Perfil definido:', perfil, '(usuários na empresa:', userCount, ')');
    }
    
    // Hash da senha
    console.log('5. Criando hash da senha...');
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    console.log('✅ Hash criado com sucesso');
    
    // Criar usuário
    console.log('6. Criando usuário...');
    const user = await prisma.user.create({
      data: {
        nome: nome.trim(),
        email: email.toLowerCase().trim(),
        senha: hashedPassword,
        perfil: perfil,
        id_empresa: companyId || null,
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
    console.error('❌ Erro no teste do controller:', error);
    console.error('Stack trace:', error.stack);
  } finally {
    await prisma.$disconnect();
    console.log('🔌 Conexão fechada');
  }
}

testController();
