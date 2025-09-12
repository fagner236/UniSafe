const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

async function testLoadEmployee() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🧪 Testando carregamento de dados do empregado...');
    
    // Buscar um empregado existente
    const empregado = await prisma.empregado.findFirst();
    
    if (!empregado) {
      console.log('❌ Nenhum empregado encontrado na tabela');
      return;
    }
    
    console.log('📊 Empregado encontrado:', {
      id: empregado.id_empregados,
      matricula: empregado.matricula,
      email: empregado.email,
      celular: empregado.celular,
      foto: empregado.foto
    });
    
    // Testar a API GET
    const fetch = require('node-fetch');
    
    // Gerar token
    const user = await prisma.user.findFirst({ where: { perfil: 'admin' } });
    const token = jwt.sign(
      { 
        id_usuario: user.id_usuario,
        email: user.email,
        perfil: user.perfil 
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    );
    
    console.log('🔑 Testando API GET /api/empregados/' + empregado.matricula);
    
    const response = await fetch(`http://localhost:3000/api/empregados/${empregado.matricula}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const result = await response.json();
    
    console.log('📊 Status:', response.status);
    console.log('📊 Resposta:', result);
    
    if (response.ok) {
      console.log('✅ API GET funcionando corretamente!');
      console.log('📊 Dados retornados:', {
        matricula: result.data.matricula,
        email: result.data.email,
        celular: result.data.celular,
        foto: result.data.foto
      });
    } else {
      console.log('❌ Erro na API:', result.message);
    }
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Aguardar um pouco para o servidor iniciar
setTimeout(testLoadEmployee, 3000);
