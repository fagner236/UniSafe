import express from 'express';
import { register, login, getProfile } from '../controllers/authController';
import { auth } from '../middleware/auth';
import { authRateLimit, validateLogin, validateRegister } from '../middleware/security';

const router = express.Router();

// POST /api/auth/register
router.post('/register', authRateLimit, validateRegister, register);

// POST /api/auth/login
router.post('/login', authRateLimit, validateLogin, login);

// GET /api/auth/profile
router.get('/profile', auth, getProfile);

export default router;
