const fetch = require('node-fetch');

async function testRoutes() {
  const baseUrl = 'http://localhost:3000';
  
  console.log('🧪 Testando rotas do backend...\n');
  
  // Testar rota de health
  try {
    const healthResponse = await fetch(`${baseUrl}/api/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData.status);
  } catch (error) {
    console.log('❌ Health check falhou:', error.message);
  }
  
  // Testar rota de verificação de CNPJ
  try {
    console.log('\n🔍 Testando rota de verificação de CNPJ...');
    const cnpjResponse = await fetch(`${baseUrl}/api/companies/check-cnpj/41.115.030/0001-20`);
    const cnpjData = await cnpjResponse.json();
    console.log('📊 Status:', cnpjResponse.status);
    console.log('📝 Resposta:', cnpjData);
  } catch (error) {
    console.log('❌ Rota de CNPJ falhou:', error.message);
  }
  
  // Testar rota de empresas (deve retornar erro de autenticação)
  try {
    console.log('\n🏢 Testando rota de empresas...');
    const companiesResponse = await fetch(`${baseUrl}/api/companies`);
    const companiesData = await companiesResponse.json();
    console.log('📊 Status:', companiesResponse.status);
    console.log('📝 Resposta:', companiesData);
  } catch (error) {
    console.log('❌ Rota de empresas falhou:', error.message);
  }
  
  console.log('\n✅ Teste de rotas concluído!');
}

testRoutes();
