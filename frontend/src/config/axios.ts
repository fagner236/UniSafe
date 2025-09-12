import axios from 'axios';
import config from './environment';
import { clearAuthCache } from '@/utils/cacheCleaner';

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
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para respostas
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Se o token for inválido, limpar cache de autenticação
    if (error.response?.status === 401) {
      console.log('🔒 Token inválido detectado, limpando cache de autenticação...');
      clearAuthCache();
      
      // Redirecionar para login se estiver em uma página protegida
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
