import rateLimit from 'express-rate-limit';
import { body, validationResult } from 'express-validator';

// Rate limiting para autenticação
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máximo 5 tentativas
  message: {
    success: false,
    message: 'Muitas tentativas de login. Tente novamente em 15 minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting geral
export const generalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: 'Muitas requisições. Tente novamente em 15 minutos.'
  }
});

// Validação de login
export const validateLogin = [
  body('email')
    .isEmail()
    .withMessage('Formato de e-mail inválido')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('A senha deve ter pelo menos 6 caracteres'),
  (req: any, res: any, next: any) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map((error: any) => error.msg);
      return res.status(400).json({
        success: false,
        message: errorMessages.join(', '),
        errors: errors.array()
      });
    }
    next();
  }
];

// Validação de registro
export const validateRegister = [
  body('nome').trim().isLength({ min: 2, max: 50 }).escape(),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
  (req: any, res: any, next: any) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: errors.array()
      });
    }
    next();
  }
];

// Validação de dados da empresa
export const validateCompanyData = [
  body('razao_social').trim().isLength({ min: 2, max: 100 }).escape(),
  body('nome_fantasia').optional().trim().isLength({ min: 2, max: 100 }).escape(),
  body('cnpj').custom((value) => {
    const cnpjRegex = /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/;
    if (!cnpjRegex.test(value)) {
      throw new Error('CNPJ deve estar no formato XX.XXX.XXX/XXXX-XX');
    }
    return true;
  }),
  body('endereco').trim().isLength({ min: 5, max: 200 }).escape(),
  body('cidade').trim().isLength({ min: 2, max: 50 }).escape(),
  body('estado').trim().isLength({ min: 2, max: 2 }).isUppercase(),
  (req: any, res: any, next: any) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Dados da empresa inválidos',
        errors: errors.array()
      });
    }
    next();
  }
];
