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

// Rota de verificação de CNPJ (PÚBLICA - sem autenticação)
console.log('📝 Registrando rota: GET /api/companies/check-cnpj');
router.get('/check-cnpj', async (req: Request, res: Response) => {
  console.log('🔍 Rota de verificação de CNPJ chamada');
  console.log('🔍 URL completa:', req.url);
  console.log('🔍 Método:', req.method);
  console.log('🔍 Query params:', req.query);
  
  try {
    const { cnpj } = req.query;
    console.log('🔍 CNPJ recebido:', cnpj);
    
    if (!cnpj || typeof cnpj !== 'string') {
      console.log('❌ CNPJ inválido ou não fornecido');
      return res.status(400).json({
        success: false,
        message: 'CNPJ é obrigatório'
      });
    }

    console.log('🔍 Iniciando busca no banco de dados...');
    
    // Buscar empresa pelo CNPJ (considerando ambos os formatos)
    let company = await prisma.company.findUnique({
      where: { cnpj },
      select: {
        id_empresa: true,
        razao_social: true,
        nome_fantasia: true,
        cnpj: true,
        endereco: true,
        cidade: true,
        estado: true,
        data_criacao: true,
        data_atualizacao: true
      }
    });

    console.log('🔍 Busca 1 (formato original):', company ? 'Encontrado' : 'Não encontrado');

    // Se não encontrou, tentar com o formato formatado
    if (!company) {
      const cnpjFormatado = cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
      console.log('🔍 Tentando formato formatado:', cnpjFormatado);
      company = await prisma.company.findUnique({
        where: { cnpj: cnpjFormatado },
        select: {
          id_empresa: true,
          razao_social: true,
          nome_fantasia: true,
          cnpj: true,
          endereco: true,
          cidade: true,
          estado: true,
          data_criacao: true,
          data_atualizacao: true
        }
      });
      console.log('🔍 Busca 2 (formato formatado):', company ? 'Encontrado' : 'Não encontrado');
    }

    // Se ainda não encontrou, tentar com o formato limpo
    if (!company) {
      const cnpjLimpo = cnpj.replace(/\D/g, '');
      console.log('🔍 Tentando formato limpo:', cnpjLimpo);
      company = await prisma.company.findUnique({
        where: { cnpj: cnpjLimpo },
        select: {
          id_empresa: true,
          razao_social: true,
          nome_fantasia: true,
          cnpj: true,
          endereco: true,
          cidade: true,
          estado: true,
          data_criacao: true,
          data_atualizacao: true
        }
      });
      console.log('🔍 Busca 3 (formato limpo):', company ? 'Encontrado' : 'Não encontrado');
    }

    console.log('📊 Resultado final da busca:', company ? 'Empresa encontrada' : 'CNPJ disponível');

    if (company) {
      // CNPJ existe - retornar dados da empresa
      console.log('✅ Retornando dados da empresa existente');
      return res.json({
        success: true,
        exists: true,
        message: 'CNPJ já cadastrado no sistema',
        data: {
          id_empresa: company.id_empresa,
          razao_social: company.razao_social,
          nome_fantasia: company.nome_fantasia,
          cnpj: company.cnpj,
          endereco: company.endereco,
          cidade: company.cidade,
          estado: company.estado,
          data_criacao: company.data_criacao,
          data_atualizacao: company.data_atualizacao
        }
      });
    } else {
      // CNPJ não existe
      console.log('✅ Retornando CNPJ disponível');
      return res.json({
        success: true,
        exists: false,
        message: 'CNPJ disponível para cadastro',
        data: null
      });
    }
  } catch (error) {
    console.error('❌ Erro ao verificar CNPJ:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
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
