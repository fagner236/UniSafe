import express from 'express';
import { PrismaClient } from '@prisma/client';
import { auth } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/companies
router.get('/', auth, async (req, res) => {
  try {
    const companies = await prisma.employee.groupBy({
      by: ['company'],
      _count: {
        company: true
      },
      orderBy: {
        _count: {
          company: 'desc'
        }
      }
    });

    const companiesWithData = companies.map(company => ({
      id: company.company,
      name: company.company,
      employeeCount: company._count.company,
      cnpj: 'N/A', // Seria necessário adicionar CNPJ ao modelo Employee
      address: 'N/A',
      city: 'N/A',
      state: 'N/A'
    }));

    res.json({
      success: true,
      data: companiesWithData
    });
  } catch (error) {
    console.error('Erro ao buscar empresas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

export default router;
