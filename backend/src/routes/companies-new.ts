import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

console.log('🚀 Registrando rotas de companies (arquivo novo)...');

// Rota de teste
console.log('📝 Registrando rota: GET /test-new');
router.get('/test-new', (req: Request, res: Response) => {
  console.log('✅ Rota de teste novo funcionando');
  res.json({ message: 'Rota de teste novo funcionando' });
});

// Rota de teste específica
console.log('📝 Registrando rota: GET /check-cnpj-test');
router.get('/check-cnpj-test', (req: Request, res: Response) => {
  console.log('✅ Rota de teste check-cnpj funcionando');
  res.json({ message: 'Rota de teste check-cnpj funcionando' });
});

// Rota de teste com parâmetro simples
console.log('📝 Registrando rota: GET /test-param/:id');
router.get('/test-param/:id', (req: Request, res: Response) => {
  console.log('✅ Rota de teste com parâmetro funcionando:', req.params.id);
  res.json({ message: 'Rota de teste com parâmetro funcionando', id: req.params.id });
});

// Rota de teste com nome diferente
console.log('📝 Registrando rota: GET /verify-cnpj/:cnpj');
router.get('/verify-cnpj/:cnpj', async (req: Request, res: Response) => {
  console.log('🔍 Rota de verificação de CNPJ (nome diferente):', req.params.cnpj);
  
  try {
    const { cnpj } = req.params;
    
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

    if (company) {
      // CNPJ existe
      res.json({
        success: true,
        exists: true,
        message: 'CNPJ já cadastrado no sistema',
        data: company
      });
    } else {
      // CNPJ não existe
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

// Rota de teste com nome completamente diferente
console.log('📝 Registrando rota: GET /search-company/:cnpj');
router.get('/search-company/:cnpj', async (req: Request, res: Response) => {
  console.log('🔍 Rota de busca de empresa:', req.params.cnpj);
  
  try {
    const { cnpj } = req.params;
    
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

    if (company) {
      // CNPJ existe
      res.json({
        success: true,
        exists: true,
        message: 'CNPJ já cadastrado no sistema',
        data: company
      });
    } else {
      // CNPJ não existe
      res.json({
        success: true,
        exists: false,
        message: 'CNPJ disponível para cadastro',
        data: null
      });
    }
  } catch (error) {
    console.error('❌ Erro ao buscar empresa:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Rota de teste sem parâmetros
console.log('📝 Registrando rota: GET /test-no-params');
router.get('/test-no-params', (req: Request, res: Response) => {
  console.log('✅ Rota sem parâmetros funcionando');
  res.json({ message: 'Rota sem parâmetros funcionando' });
});

// Rota de teste com parâmetro simples
console.log('📝 Registrando rota: GET /test-simple/:id');
router.get('/test-simple/:id', (req: Request, res: Response) => {
  console.log('✅ Rota com parâmetro simples funcionando:', req.params.id);
  res.json({ message: 'Rota com parâmetro simples funcionando', id: req.params.id });
});

// Rota de verificação de CNPJ
router.get('/check-cnpj/:cnpj', async (req: Request, res: Response) => {
  console.log('🔍 Rota de verificação de CNPJ chamada (novo arquivo):', req.params.cnpj);
  
  try {
    const { cnpj } = req.params;
    
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

    if (company) {
      // CNPJ existe
      res.json({
        success: true,
        exists: true,
        message: 'CNPJ já cadastrado no sistema',
        data: company
      });
    } else {
      // CNPJ não existe
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

// Rota de teste com nome completamente diferente
console.log('📝 Registrando rota: GET /find-company/:cnpj');
router.get('/find-company/:cnpj', async (req: Request, res: Response) => {
  console.log('🔍 Rota de busca de empresa (nome diferente):', req.params.cnpj);
  
  try {
    const { cnpj } = req.params;
    
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

    if (company) {
      // CNPJ existe
      res.json({
        success: true,
        exists: true,
        message: 'CNPJ já cadastrado no sistema',
        data: company
      });
    } else {
      // CNPJ não existe
      res.json({
        success: true,
        exists: false,
        message: 'CNPJ disponível para cadastro',
        data: null
      });
    }
  } catch (error) {
    console.error('❌ Erro ao buscar empresa:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Rota de teste com parâmetro mais simples
console.log('📝 Registrando rota: GET /test-param/:cnpj');
router.get('/test-param/:cnpj', (req: Request, res: Response) => {
  console.log('✅ Rota de teste com parâmetro funcionando:', req.params.cnpj);
  res.json({ message: 'Rota de teste com parâmetro funcionando', cnpj: req.params.cnpj });
});

// Rota de teste com parâmetro mais simples
console.log('📝 Registrando rota: GET /test-param/:cnpj');
router.get('/test-param/:cnpj', (req: Request, res: Response) => {
  console.log('✅ Rota de teste com parâmetro funcionando:', req.params.cnpj);
  res.json({ message: 'Rota de teste com parâmetro funcionando', cnpj: req.params.cnpj });
});

// Rota de teste com parâmetro mais simples
console.log('📝 Registrando rota: GET /test-param/:cnpj');
router.get('/test-param/:cnpj', (req: Request, res: Response) => {
  console.log('✅ Rota de teste com parâmetro funcionando:', req.params.cnpj);
  res.json({ message: 'Rota de teste com parâmetro funcionando', cnpj: req.params.cnpj });
});

// Rota de teste com parâmetro mais simples
console.log('📝 Registrando rota: GET /test-param/:cnpj');
router.get('/test-param/:cnpj', (req: Request, res: Response) => {
  console.log('✅ Rota de teste com parâmetro funcionando:', req.params.cnpj);
  res.json({ message: 'Rota de teste com parâmetro funcionando', cnpj: req.params.cnpj });
});

// Rota de teste com parâmetro mais simples
console.log('📝 Registrando rota: GET /test-param/:cnpj');
router.get('/test-param/:cnpj', (req: Request, res: Response) => {
  console.log('✅ Rota de teste com parâmetro funcionando:', req.params.cnpj);
  res.json({ message: 'Rota de teste com parâmetro funcionando', cnpj: req.params.cnpj });
});

// Rota de teste com parâmetro mais simples
console.log('📝 Registrando rota: GET /test-param/:cnpj');
router.get('/test-param/:cnpj', (req: Request, res: Response) => {
  console.log('✅ Rota de teste com parâmetro funcionando:', req.params.cnpj);
  res.json({ message: 'Rota de teste com parâmetro funcionando', cnpj: req.params.cnpj });
});

console.log('✅ Todas as rotas específicas foram registradas');

// Rota genérica (DEVE VIR POR ÚLTIMO)
console.log('📝 Registrando rota genérica: GET /:id');
router.get('/:id', (req: Request, res: Response) => {
  console.log('✅ Rota genérica capturada:', req.params.id);
  res.json({ message: 'Rota genérica funcionando', id: req.params.id });
});

console.log('✅ Todas as rotas do arquivo novo foram registradas');

export default router;
