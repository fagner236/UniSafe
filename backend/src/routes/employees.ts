import express from 'express';
import { PrismaClient } from '@prisma/client';
import { auth } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/employees
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, company } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { cpf: { contains: search as string } },
        { email: { contains: search as string, mode: 'insensitive' } }
      ];
    }
    
    if (status) {
      where.status = status;
    }
    
    if (company) {
      where.company = { contains: company as string, mode: 'insensitive' };
    }

    const [employees, total] = await Promise.all([
      prisma.employee.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { lastUpdate: 'desc' }
      }),
      prisma.employee.count({ where })
    ]);

    res.json({
      success: true,
      data: employees,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Erro ao buscar funcionários:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

export default router;
