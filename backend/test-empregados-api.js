const fetch = require('node-fetch');

async function testEmpregadosAPI() {
  try {
    console.log('🧪 Testando API de empregados...');
    
    // Dados de teste
    const testData = {
      matricula: '12345678',
      email: 'teste@empresa.com',
      celular: '(11) 99999-9999'
    };
    
    console.log('📤 Enviando dados:', testData);
    
    // Fazer requisição POST
    const response = await fetch('http://localhost:3000/api/empregados', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer fake-token' // Token fake para teste
      },
      body: JSON.stringify(testData)
    });
    
    const result = await response.json();
    
    console.log('📊 Status:', response.status);
    console.log('📊 Resposta:', result);
    
    if (response.ok) {
      console.log('✅ API funcionando corretamente!');
    } else {
      console.log('❌ Erro na API:', result.message);
    }
    
  } catch (error) {
    console.error('❌ Erro ao testar API:', error.message);
  }
}

// Aguardar um pouco para o servidor iniciar
setTimeout(testEmpregadosAPI, 3000);
