import express from 'express';
import { body } from 'express-validator';
import { register, login, getProfile, updateProfile } from '../controllers/authController';
import { auth } from '../middleware/auth';
// import { authRateLimit, validateLogin, validateRegister } from '../middleware/security';
// import { validateLogin, validateRegister } from '../middleware/security';

const router = express.Router();

// Validação para registro
const validateRegister = [
  body('nome').trim().isLength({ min: 2 }).withMessage('Nome deve ter pelo menos 2 caracteres'),
  body('email').isEmail().normalizeEmail().withMessage('Email inválido'),
  body('password').isLength({ min: 6 }).withMessage('Senha deve ter pelo menos 6 caracteres')
];

// Validação para login
const validateLogin = [
  body('email').isEmail().normalizeEmail().withMessage('Email inválido'),
  body('password').notEmpty().withMessage('Senha é obrigatória')
];

// Validação para atualização de perfil
const validateProfileUpdate = [
  body('nome').optional().trim().isLength({ min: 2 }).withMessage('Nome deve ter pelo menos 2 caracteres'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Email inválido'),
  body('currentPassword').optional().notEmpty().withMessage('Senha atual é obrigatória para alterar a senha'),
  body('newPassword').optional().isLength({ min: 6 }).withMessage('Nova senha deve ter pelo menos 6 caracteres')
];

// POST /api/auth/register
router.post('/register', validateRegister, register);

// POST /api/auth/login - Rate limiting DESABILITADO TEMPORARIAMENTE
router.post('/login', /* authRateLimit, */ validateLogin, login);

// GET /api/auth/profile
router.get('/profile', auth, getProfile);

// PUT /api/auth/profile - Atualizar perfil
router.put('/profile', auth, validateProfileUpdate, updateProfile);

export default router;
