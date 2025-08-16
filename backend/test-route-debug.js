const http = require('http');

console.log('🧪 Teste de debug das rotas...\n');

// Testar rota de teste primeiro
const testRoute = () => {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/companies/test-new',
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`🔍 Rota de teste /test-new:`);
        console.log(`   Status: ${res.statusCode}`);
        console.log(`   Resposta: ${data}\n`);
        resolve();
      });
    });

    req.on('error', (e) => {
      console.log(`❌ Erro na rota de teste: ${e.message}\n`);
      resolve();
    });

    req.end();
  });
};

// Testar rota de verificação de CNPJ
const testCnpjRoute = () => {
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
        console.log(`🔍 Rota de CNPJ /check-cnpj/:cnpj:`);
        console.log(`   Status: ${res.statusCode}`);
        console.log(`   Resposta: ${data}\n`);
        resolve();
      });
    });

    req.on('error', (e) => {
      console.log(`❌ Erro na rota de CNPJ: ${e.message}\n`);
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
        console.log(`🔍 Rota genérica /:id:`);
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

// Executar testes em sequência
async function runTests() {
  console.log('1️⃣ Testando rota de teste...');
  await testRoute();
  
  console.log('2️⃣ Testando rota de CNPJ...');
  await testCnpjRoute();
  
  console.log('3️⃣ Testando rota genérica...');
  await testGenericRoute();
  
  console.log('✅ Todos os testes concluídos!');
}

runTests();
