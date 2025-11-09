import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';

// Import routes
import authRoutes from './routes/auth';
import employeeRoutes from './routes/employees';
import uploadRoutes from './routes/upload';
import dashboardRoutes from './routes/dashboard';
import companyRoutes from './routes/companies-simple';
import userRoutes from './routes/users';
import adminRoutes from './routes/admin';
import logsRoutes from './routes/logs';
import empregadosRoutes from './routes/empregados';
import cacheAdminRoutes from './routes/cache-admin';

// Import middleware
import { errorHandler } from './middleware/errorHandler';
import { securityConfig } from './config/security';
import { redisInitialization } from './config/redis';

import compression from "compression"; 

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000; // Voltando para porta 3000


// Força compressão em todas as respostas
app.use(
  compression({
    level: 9,              // nível de compressão (1-9)
    threshold: 0,          // força compressão de qualquer tamanho (0 = tudo)
    filter: () => true     // ignora cabeçalhos e força compressão sempre
  })
);

// Middleware de segurança básico
app.use(helmet({
  contentSecurityPolicy: false, // Desabilitar CSP temporariamente
  crossOriginEmbedderPolicy: false // Desabilitar CEP temporariamente
}));

// CORS configurado de forma funcional
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174', // Porta alternativa do Vite
  'http://localhost:3000', 
  'http://localhost:4173',
  'https://unisafe.evia.com.br',
  'https://www.unisafe.evia.com.br'
];

app.use(cors({
  origin: (origin, callback) => {
    // Permitir requisições sem origem (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('❌ Origem CORS não permitida:', origin);
      callback(new Error('Não permitido pelo CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  optionsSuccessStatus: 200
}));

// Logging
app.use(morgan('combined'));

// Parsers - OTIMIZADO PARA ARQUIVOS GRANDES
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/logs', logsRoutes);
app.use('/api/empregados', empregadosRoutes);
app.use('/api/cache-admin', cacheAdminRoutes);

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint não encontrado'
  });
});

// Iniciar servidor (Redis conecta em background)
function startServer() {
  // Iniciar servidor imediatamente
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📊 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 URL: http://localhost:${PORT}`);
    
    // Verificar status do Redis em background
    if (redisInitialization) {
      redisInitialization.then(() => {
        console.log(`✅ Redis conectado e funcionando!`);
      }).catch(() => {
        console.log(`⚠️ Redis ainda não conectado, mas servidor está funcionando.`);
        console.log(`⚠️ O sistema continuará tentando conectar ao Redis em background.`);
      });
    } else {
      console.log(`⚠️ Redis não configurado. Sistema funcionando sem cache Redis.`);
    }
  });
}

startServer();

export default app;
