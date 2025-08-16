import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { auth } from '../middleware/auth';
import { validateCompanyData } from '../middleware/security';

const router = express.Router();
const prisma = new PrismaClient();

console.log('🚀 Registrando rotas de companies...');

// Rota de teste simples
console.log('📝 Registrando rota de teste: GET /api/companies/test');
router.get('/test', (req: Request, res: Response) => {
  console.log('✅ Rota de teste funcionando');
  res.json({ message: 'Rota de teste funcionando' });
});

// POST /api/companies - Cadastrar nova empresa
router.post('/', validateCompanyData, async (req: Request, res: Response) => {
  try {
    const { razao_social, nome_fantasia, cnpj, endereco, cidade, estado } = req.body;

    // Verificar se já existe empresa com este CNPJ
    const existingCompany = await prisma.company.findUnique({
      where: { cnpj }
    });

    if (existingCompany) {
      return res.status(400).json({
        success: false,
        message: 'Já existe uma empresa cadastrada com este CNPJ'
      });
    }

    // Criar nova empresa
    const newCompany = await prisma.company.create({
      data: {
        razao_social,
        nome_fantasia: nome_fantasia || null,
        cnpj,
        endereco,
        cidade,
        estado: estado.toUpperCase(),
        data_criacao: new Date(),
        data_atualizacao: new Date()
      }
    });

    console.log('🏢 Empresa criada:', newCompany);
    console.log('🆔 ID da empresa:', newCompany.id_empresa);

    res.status(201).json({
      success: true,
      message: 'Empresa cadastrada com sucesso',
      data: newCompany
    });
  } catch (error) {
    console.error('Erro ao cadastrar empresa:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// PUT /api/companies/:id - Atualizar empresa
router.put('/:id', auth, validateCompanyData, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { razao_social, nome_fantasia, cnpj, endereco, cidade, estado } = req.body;

    // Verificar se a empresa existe
    const existingCompany = await prisma.company.findUnique({
      where: { id_empresa: id }
    });

    if (!existingCompany) {
      return res.status(404).json({
        success: false,
        message: 'Empresa não encontrada'
      });
    }

    // Verificar se o CNPJ já existe em outra empresa
    if (cnpj !== existingCompany.cnpj) {
      const companyWithSameCNPJ = await prisma.company.findUnique({
        where: { cnpj }
      });

      if (companyWithSameCNPJ) {
        return res.status(400).json({
          success: false,
          message: 'Já existe uma empresa cadastrada com este CNPJ'
        });
      }
    }

    // Atualizar empresa
    const updatedCompany = await prisma.company.update({
      where: { id_empresa: id },
      data: {
        razao_social,
        nome_fantasia: nome_fantasia || null,
        cnpj,
        endereco,
        cidade,
        estado: estado.toUpperCase(),
        data_atualizacao: new Date()
      }
    });

    res.json({
      success: true,
      message: 'Empresa atualizada com sucesso',
      data: updatedCompany
    });
  } catch (error) {
    console.error('Erro ao atualizar empresa:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Rota de verificação de CNPJ
console.log('📝 Registrando rota: GET /api/companies/check-cnpj/:cnpj');
router.get('/check-cnpj/:cnpj', async (req: Request, res: Response) => {
  console.log('🔍 Rota de verificação de CNPJ chamada:', req.params.cnpj);
  console.log('🔍 URL completa:', req.url);
  console.log('🔍 Método:', req.method);
  
  try {
    const { cnpj } = req.params;
    console.log('🔍 CNPJ recebido:', cnpj);

    // Buscar empresa pelo CNPJ
    const company = await prisma.company.findUnique({
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

    console.log('📊 Resultado da busca:', company ? 'Empresa encontrada' : 'CNPJ disponível');

    if (company) {
      // CNPJ existe - retornar dados da empresa
      console.log('✅ Retornando dados da empresa existente');
      res.json({
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
      res.json({
        success: true,
        exists: false,
        message: 'CNPJ disponível para cadastro',
        data: null
      });
    }
  } catch (error) {
    console.error('❌ Erro ao verificar CNPJ:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// GET /api/companies - Buscar todas as empresas
console.log('📝 Registrando rota: GET /api/companies/');
router.get('/', auth, async (req: Request, res: Response) => {
  try {
    // Buscar empresas diretamente da tabela empresas
    const companies = await prisma.company.findMany({
      orderBy: {
        data_criacao: 'desc'
      }
    });

    const companiesWithData = companies.map(company => ({
      id: company.id_empresa,
      razao_social: company.razao_social,
      nome_fantasia: company.nome_fantasia,
      cnpj: company.cnpj,
      endereco: company.endereco,
      cidade: company.cidade,
      estado: company.estado,
      data_criacao: company.data_criacao,
      data_atualizacao: company.data_atualizacao,
      userCount: 0 // Valor padrão, pode ser implementado depois
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

// GET /api/companies/:id - Buscar empresa específica (DEVE VIR DEPOIS DE /check-cnpj)
console.log('📝 Registrando rota: GET /api/companies/:id');
router.get('/:id', auth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const company = await prisma.company.findUnique({
      where: { id_empresa: id },
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

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Empresa não encontrada'
      });
    }

    res.json({
      success: true,
      data: company
    });
  } catch (error) {
    console.error('Erro ao buscar empresa:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

console.log('✅ Todas as rotas de companies foram registradas');

export default router;
