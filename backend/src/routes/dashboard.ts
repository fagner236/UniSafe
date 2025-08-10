import express from 'express';
import { PrismaClient } from '@prisma/client';
import { auth } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/dashboard/stats
router.get('/stats', auth, async (req, res) => {
  try {
    const [
      totalEmployees,
      activeEmployees,
      inactiveEmployees,
      pendingEmployees,
      totalCompanies,
      totalDepartments,
      averageSalary,
      recentUploads
    ] = await Promise.all([
      prisma.employee.count(),
      prisma.employee.count({ where: { status: 'active' } }),
      prisma.employee.count({ where: { status: 'inactive' } }),
      prisma.employee.count({ where: { status: 'pending' } }),
      prisma.employee.groupBy({ by: ['company'], _count: { company: true } }).then(result => result.length),
      prisma.employee.groupBy({ by: ['department'], _count: { department: true } }).then(result => result.length),
      prisma.employee.aggregate({ _avg: { salary: true } }).then(result => result._avg.salary || 0),
      prisma.upload.count({ where: { uploadedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } })
    ]);

    res.json({
      success: true,
      data: {
        totalEmployees,
        activeEmployees,
        inactiveEmployees,
        pendingEmployees,
        totalCompanies,
        totalDepartments,
        averageSalary,
        recentUploads
      }
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

export default router;
