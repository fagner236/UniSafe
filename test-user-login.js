const axios = require('axios');

async function testUserLogin() {
  try {
    console.log('🔍 Testando login da usuária fabyghira19@gmail.com...');
    
    // 1. Fazer login
    const loginResponse = await axios.post('https://unisafe-api-dot-evia-app.ue.r.appspot.com/api/auth/login', {
      email: 'fabyghira19@gmail.com',
      password: '123456' // Senha padrão
    });
    
    console.log('✅ Login realizado com sucesso');
    console.log('📊 Dados do usuário no login:', loginResponse.data.data.user);
    
    const token = loginResponse.data.data.token;
    
    // 2. Buscar perfil
    const profileResponse = await axios.get('https://unisafe-api-dot-evia-app.ue.r.appspot.com/api/auth/profile', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Perfil carregado com sucesso');
    console.log('📊 Dados do perfil:', profileResponse.data.data);
    
    // 3. Testar dashboard
    const dashboardResponse = await axios.get('https://unisafe-api-dot-evia-app.ue.r.appspot.com/api/dashboard/base-dados', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Dashboard carregado com sucesso');
    console.log('📊 Base sindical usada no dashboard:', dashboardResponse.data.data.selectedBaseSindical);
    console.log('📊 Total de registros:', dashboardResponse.data.data.summary.totalRecords);
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.response?.data || error.message);
  }
}

testUserLogin();
