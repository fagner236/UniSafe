const axios = require('axios');

async function testAdminRoute() {
  try {
    console.log('🧪 Testando rota de admin...');
    
    // Testar rota de teste (sem autenticação)
    const testResponse = await axios.get('http://localhost:3000/api/admin/test');
    console.log('✅ Rota de teste funcionando:', testResponse.data);
    
  } catch (error) {
    if (error.response) {
      console.log('❌ Erro na resposta:', error.response.status, error.response.data);
    } else {
      console.log('❌ Erro de conexão:', error.message);
    }
  }
}

testAdminRoute();
