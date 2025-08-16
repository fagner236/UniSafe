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
import companyRoutes from './routes/companies-new';

// Import middleware
import { errorHandler } from './middleware/errorHandler';
import { securityHeaders, sanitizeInput } from './middleware/securityHeaders';
import { generalRateLimit } from './middleware/security';
import { securityConfig, validateSecurityConfig } from './config/security';

// Load environment variables
dotenv.config();

// Validar configuração de segurança antes de iniciar
try {
  validateSecurityConfig();
  console.log('✅ Configuração de segurança validada com sucesso');
} catch (error) {
  console.error('❌ Erro na configuração de segurança:', (error as Error).message);
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware de segurança
app.use(helmet());
app.use(securityHeaders);
app.use(sanitizeInput);

// Rate limiting geral
app.use(generalRateLimit);

// CORS configurado
app.use(cors(securityConfig.cors));

// Logging
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

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

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint não encontrado'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📊 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 URL: http://localhost:${PORT}`);
});

export default app;
