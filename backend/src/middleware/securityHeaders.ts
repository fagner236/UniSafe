import { Request, Response, NextFunction } from 'express';

/**
 * Middleware para adicionar headers de segurança
 * Protege contra ataques comuns e vazamento de dados
 */
export const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
  // Headers de segurança básicos
  res.set({
    // Previne clickjacking
    'X-Frame-Options': 'DENY',
    
    // Previne MIME type sniffing
    'X-Content-Type-Options': 'nosniff',
    
    // Proteção XSS
    'X-XSS-Protection': '1; mode=block',
    
    // Política de referrer
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    
    // Política de conteúdo de segurança - mais flexível para produção
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https:; style-src 'self' 'unsafe-inline' https:; img-src 'self' data: https:; font-src 'self' data: https:; connect-src 'self' https: http:; frame-ancestors 'none';",
    
    // Previne cache de dados sensíveis
    'Cache-Control': 'no-cache, no-store, must-revalidate, private',
    'Pragma': 'no-cache',
    'Expires': '0',
    
    // Permissões de recursos
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
    
    // HSTS (HTTP Strict Transport Security)
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload'
  });

  // Log de tentativas de acesso suspeitas
  const suspiciousHeaders = [
    'x-forwarded-for',
    'x-real-ip',
    'x-forwarded-proto',
    'x-forwarded-host'
  ];

  const hasSuspiciousHeaders = suspiciousHeaders.some(header => 
    req.headers[header] && req.headers[header] !== req.ip
  );

  if (hasSuspiciousHeaders) {
    console.log('⚠️ Headers suspeitos detectados:', {
      ip: req.ip,
      headers: suspiciousHeaders.filter(header => req.headers[header])
    });
  }

  next();
};

/**
 * Middleware para validar origem das requisições
 */
export const validateOrigin = (req: Request, res: Response, next: NextFunction) => {
  const origin = req.get('Origin');
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:4173',
    'https://unisafe.evia.com.br', // Substitua pelo seu domínio de produção
    'https://www.unisafe.evia.com.br',
    'https://unisafe-api-dot-evia-app.ue.r.appspot.com'
  ];

  // Permitir requisições sem origem (como mobile apps)
  if (!origin) {
    return next();
  }

  if (allowedOrigins.includes(origin)) {
    res.set('Access-Control-Allow-Origin', origin);
    next();
  } else {
    console.log('❌ Origem não permitida:', origin);
    res.status(403).json({
      success: false,
      message: 'Origem não permitida'
    });
  }
};

export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  // Sanitização básica de inputs - apenas para campos críticos
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        // Aplicar sanitização apenas para campos que podem conter HTML perigoso
        // Preservar caracteres válidos como barras, hífens, etc.
        if (key === 'email' || key === 'password') {
          req.body[key] = req.body[key].trim();
        } else if (key.startsWith('razao_social') || key.startsWith('nome_fantasia') || 
                   key.startsWith('endereco') || key.startsWith('cidade')) {
          // Para campos de empresa, apenas trim - preservar caracteres especiais
          req.body[key] = req.body[key].trim();
        } else {
          // Para outros campos, apenas remover caracteres HTML perigosos
          req.body[key] = req.body[key].trim().replace(/[<>]/g, '');
        }
      }
    });
  }
  next();
};
