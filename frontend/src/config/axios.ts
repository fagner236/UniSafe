import axios from 'axios';
import config from './environment';

// Configuração base do axios
const api = axios.create({
  baseURL: config.apiUrl,
  timeout: config.requestTimeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para requisições
api.interceptors.request.use(
  (config) => {
    // Adicionar token de autenticação se existir
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔑 Token incluído na requisição:', token.substring(0, 20) + '...');
    } else {
      console.log('⚠️ Nenhum token encontrado no localStorage');
    }
    
    console.log('🚀 Requisição sendo enviada:', config.method?.toUpperCase(), config.url);
    console.log('🔑 Headers da requisição:', config.headers);
    return config;
  },
  (error) => {
    console.error('❌ Erro na requisição:', error);
    return Promise.reject(error);
  }
);

// Interceptor para respostas
api.interceptors.response.use(
  (response) => {
    console.log('✅ Resposta recebida:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('❌ Erro na resposta:', error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

export default api;
