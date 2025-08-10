import express from 'express';
import { register, login, getProfile } from '../controllers/authController';
import { auth } from '../middleware/auth';

const router = express.Router();

// POST /api/auth/register
router.post('/register', register);

// POST /api/auth/login
router.post('/login', login);

// GET /api/auth/profile
router.get('/profile', auth, getProfile);

export default router;
