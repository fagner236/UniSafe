const axios = require('axios');

async function testCNPJRoute() {
  try {
    console.log('🧪 Testando rota de verificação de CNPJ...');
    
    // Teste com CNPJ que provavelmente não existe
    const testCNPJ = '12.345.678/0001-90';
    const response = await axios.get(`http://localhost:3000/api/companies/check-cnpj/${testCNPJ}`);
    
    console.log('✅ Resposta da API:');
    console.log('Status:', response.status);
    console.log('Dados:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ Erro ao testar rota:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Dados:', error.response.data);
    } else {
      console.error('Erro:', error.message);
    }
  }
}

// Aguardar um pouco para o servidor inicializar
setTimeout(testCNPJRoute, 3000);
