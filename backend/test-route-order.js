const http = require('http');

console.log('🧪 Testando ordem das rotas...\n');

// Testar rota específica primeiro
const testSpecificRoute = () => {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/companies/check-cnpj/41.115.030/0001-20',
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`🔍 Rota específica /check-cnpj/:cnpj:`);
        console.log(`   Status: ${res.statusCode}`);
        console.log(`   Resposta: ${data}\n`);
        resolve();
      });
    });

    req.on('error', (e) => {
      console.log(`❌ Erro na rota específica: ${e.message}\n`);
      resolve();
    });

    req.end();
  });
};

// Testar rota genérica
const testGenericRoute = () => {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/companies/123',
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`🏢 Rota genérica /:id:`);
        console.log(`   Status: ${res.statusCode}`);
        console.log(`   Resposta: ${data}\n`);
        resolve();
      });
    });

    req.on('error', (e) => {
      console.log(`❌ Erro na rota genérica: ${e.message}\n`);
      resolve();
    });

    req.end();
  });
};

// Executar testes
async function runTests() {
  await testSpecificRoute();
  await testGenericRoute();
  console.log('✅ Testes concluídos!');
}

runTests();
