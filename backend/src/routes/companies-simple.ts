import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { auth } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

console.log('🚀 Registrando rotas de companies (versão simplificada)...');

// Rota de teste simples
router.get('/test', (req: Request, res: Response) => {
  res.json({ message: 'Rota de teste funcionando' });
});

// GET /api/companies - Buscar todas as empresas
router.get('/', auth, async (req: Request, res: Response) => {
  try {
    const companies = await prisma.company.findMany({
      orderBy: {
        data_criacao: 'desc'
      }
    });

    return res.json({
      success: true,
      data: companies
    });
  } catch (error) {
    console.error('Erro ao buscar empresas:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// GET /api/companies/:id - Buscar empresa específica
router.get('/:id', auth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const company = await prisma.company.findUnique({
      where: { id_empresa: id }
    });

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Empresa não encontrada'
      });
    }

    return res.json({
      success: true,
      data: company
    });
  } catch (error) {
    console.error('Erro ao buscar empresa:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

console.log('✅ Rotas de companies simplificadas registradas');

export default router;
