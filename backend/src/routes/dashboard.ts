import express from 'express';
import { PrismaClient } from '@prisma/client';
import { auth } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/dashboard/stats
// TODO: Implementar modelo Employee no schema Prisma
router.get('/stats', auth, async (req, res) => {
  try {
    // Temporariamente retornando dados básicos até implementar o modelo Employee
    const recentUploads = await prisma.upload.count({ 
      where: { uploadedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } 
    });

    return res.json({
      success: true,
      data: {
        totalEmployees: 0,
        activeEmployees: 0,
        inactiveEmployees: 0,
        pendingEmployees: 0,
        totalCompanies: 0,
        totalDepartments: 0,
        averageSalary: 0,
        recentUploads
      }
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

export default router;
