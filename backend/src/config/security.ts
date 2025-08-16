export const securityConfig = {
  // JWT
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    issuer: 'unisafe',
    audience: 'unisafe-users'
  },

  // Bcrypt
  bcrypt: {
    rounds: parseInt(process.env.BCRYPT_ROUNDS || '12')
  },

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 min
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
    authMaxAttempts: parseInt(process.env.AUTH_RATE_LIMIT_MAX || '5')
  },

  // CORS
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
  },

  // File Upload
  upload: {
    maxSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB
    allowedTypes: (process.env.ALLOWED_FILE_TYPES || 'xlsx,xls,csv').split(','),
    uploadDir: process.env.UPLOAD_DIR || './uploads'
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    errorsOnly: process.env.LOG_ERRORS_ONLY === 'true'
  }
};

// Validação de configuração de segurança
export const validateSecurityConfig = () => {
  const errors: string[] = [];

  if (!securityConfig.jwt.secret || securityConfig.jwt.secret === 'fallback-secret') {
    errors.push('JWT_SECRET não configurado ou usando valor padrão inseguro');
  }

  if (securityConfig.jwt.secret && securityConfig.jwt.secret.length < 32) {
    errors.push('JWT_SECRET deve ter pelo menos 32 caracteres');
  }

  if (securityConfig.bcrypt.rounds < 10) {
    errors.push('BCRYPT_ROUNDS deve ser pelo menos 10');
  }

  if (errors.length > 0) {
    throw new Error(`Configuração de segurança inválida:\n${errors.join('\n')}`);
  }

  return true;
};
