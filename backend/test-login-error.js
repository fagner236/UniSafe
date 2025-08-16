const fetch = require('node-fetch');

async function testLoginError() {
  try {
    console.log('🧪 Testando login com usuário inexistente...');
    
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'usuario_inexistente@teste.com',
        password: '123456'
      })
    });

    const data = await response.json();
    
    console.log('📊 Status da resposta:', response.status);
    console.log('📝 Mensagem retornada:', data.message);
    console.log('✅ Teste concluído!');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
  }
}

testLoginError();
