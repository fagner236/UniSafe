const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

async function getToken() {
  const prisma = new PrismaClient();
  
  try {
    // Buscar um usuário admin
    const user = await prisma.user.findFirst({
      where: { perfil: 'admin' }
    });
    
    if (!user) {
      console.log('❌ Nenhum usuário admin encontrado');
      return;
    }
    
    console.log('👤 Usuário encontrado:', user.nome, user.email);
    
    // Gerar token
    const token = jwt.sign(
      { 
        id_usuario: user.id_usuario,
        email: user.email,
        perfil: user.perfil 
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    );
    
    console.log('🔑 Token gerado:', token);
    
    // Testar a API com o token
    const fetch = require('node-fetch');
    
    const response = await fetch('http://localhost:3000/api/empregados', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        matricula: '87654321',
        email: 'teste2@empresa.com',
        celular: '(11) 88888-8888'
      })
    });
    
    const result = await response.json();
    console.log('📊 Status:', response.status);
    console.log('📊 Resposta:', result);
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

getToken();
