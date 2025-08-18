import { Request, Response, NextFunction } from 'express';

export const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
  // Headers de segurança adicionais
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  next();
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
