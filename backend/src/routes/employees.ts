import express from 'express';
import { PrismaClient } from '@prisma/client';
import { auth } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/employees
// TODO: Implementar modelo Employee no schema Prisma
router.get('/', auth, async (req, res) => {
  try {
    // Temporariamente retornando dados vazios até implementar o modelo Employee
    return res.json({
      success: true,
      data: [],
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
      }
    });
  } catch (error) {
    console.error('Erro ao buscar funcionários:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

export default router;
