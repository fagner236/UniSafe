const express = require('express');

const app = express();
const router = express.Router();

console.log('🧪 Testando configuração do Express...\n');

// Rota específica
router.get('/check-cnpj/:cnpj', (req, res) => {
  console.log('✅ Rota específica capturada:', req.params.cnpj);
  res.json({ message: 'Rota específica funcionando', cnpj: req.params.cnpj });
});

// Rota genérica
router.get('/:id', (req, res) => {
  console.log('✅ Rota genérica capturada:', req.params.id);
  res.json({ message: 'Rota genérica funcionando', id: req.params.id });
});

app.use('/api/companies', router);

// Testar as rotas
const testRoutes = () => {
  console.log('🔍 Testando rota específica...');
  const req1 = { url: '/api/companies/check-cnpj/123', method: 'GET' };
  const res1 = { json: (data) => console.log('Resposta 1:', data) };
  
  // Simular requisição para rota específica
  const route1 = router.stack.find(layer => 
    layer.route && layer.route.path === '/check-cnpj/:cnpj'
  );
  
  if (route1) {
    console.log('✅ Rota específica encontrada na pilha');
    route1.handle(req1, res1, () => {});
  } else {
    console.log('❌ Rota específica NÃO encontrada na pilha');
  }
  
  console.log('\n🔍 Testando rota genérica...');
  const req2 = { url: '/api/companies/456', method: 'GET' };
  const res2 = { json: (data) => console.log('Resposta 2:', data) };
  
  const route2 = router.stack.find(layer => 
    layer.route && layer.route.path === '/:id'
  );
  
  if (route2) {
    console.log('✅ Rota genérica encontrada na pilha');
    route2.handle(req2, res2, () => {});
  } else {
    console.log('❌ Rota genérica NÃO encontrada na pilha');
  }
  
  console.log('\n📊 Pilha de rotas:');
  router.stack.forEach((layer, index) => {
    if (layer.route) {
      console.log(`   ${index}: ${layer.route.path}`);
    }
  });
};

testRoutes();
