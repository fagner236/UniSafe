import express from 'express';
import { PrismaClient } from '@prisma/client';
import { auth } from '../middleware/auth';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();
const prisma = new PrismaClient();

// Configuração do multer para upload de fotos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/empregados');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `foto-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Apenas arquivos de imagem são permitidos'));
    }
  }
});

// Middleware para verificar se o usuário é admin
const requireAdmin = async (req: any, res: any, next: any) => {
  try {
    if (!req.user || req.user.perfil !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado. Apenas administradores podem acessar esta funcionalidade.'
      });
    }
    next();
  } catch (error) {
    console.error('Erro ao verificar perfil de admin:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// POST /api/empregados - Criar ou atualizar empregado
router.post('/', auth, requireAdmin, upload.single('foto'), async (req: any, res: any) => {
  try {
    console.log('📊 === ROTA /api/empregados POST CHAMADA ===');
    console.log('📊 Usuário logado ID:', req.user.id_usuario);
    console.log('📊 Dados recebidos:', req.body);
    console.log('📊 Arquivo de foto:', req.file);

    const { matricula, email, celular } = req.body;
    const id_usuario = req.user.id_usuario;

    // Validações básicas
    if (!matricula) {
      return res.status(400).json({
        success: false,
        message: 'Matrícula é obrigatória'
      });
    }

    // Verificar se o empregado já existe pela matrícula
    const empregadoExistente = await prisma.empregado.findUnique({
      where: { matricula }
    });

    let fotoPath = null;
    if (req.file) {
      fotoPath = `/uploads/empregados/${req.file.filename}`;
    }

    if (empregadoExistente) {
      // Atualizar empregado existente
      console.log('📊 Atualizando empregado existente:', empregadoExistente.id_empregados);
      
      const empregadoAtualizado = await prisma.empregado.update({
        where: { matricula },
        data: {
          email: email || null,
          celular: celular || null,
          foto: fotoPath || empregadoExistente.foto, // Manter foto existente se não enviar nova
          id_usuario,
          data_atualizacao: new Date()
        }
      });

      console.log('✅ Empregado atualizado com sucesso:', empregadoAtualizado.id_empregados);

      return res.json({
        success: true,
        message: 'Empregado atualizado com sucesso',
        data: empregadoAtualizado
      });

    } else {
      // Criar novo empregado
      console.log('📊 Criando novo empregado');
      
      const novoEmpregado = await prisma.empregado.create({
        data: {
          matricula,
          email: email || null,
          celular: celular || null,
          foto: fotoPath,
          id_usuario,
          data_criacao: new Date(),
          data_atualizacao: new Date()
        }
      });

      console.log('✅ Novo empregado criado com sucesso:', novoEmpregado.id_empregados);

      return res.json({
        success: true,
        message: 'Empregado criado com sucesso',
        data: novoEmpregado
      });
    }

  } catch (error) {
    console.error('❌ Erro ao salvar empregado:', error);
    
    // Se houver erro de constraint única (matrícula duplicada)
    if ((error as any).code === 'P2002' && (error as any).meta?.target?.includes('matricula')) {
      return res.status(400).json({
        success: false,
        message: 'Já existe um empregado com esta matrícula'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? (error as any).message : undefined
    });
  }
});

// GET /api/empregados/:matricula - Buscar empregado por matrícula
router.get('/:matricula', auth, requireAdmin, async (req: any, res: any) => {
  try {
    console.log('📊 === ROTA /api/empregados GET CHAMADA ===');
    console.log('📊 Matrícula solicitada:', req.params.matricula);

    const { matricula } = req.params;

    const empregado = await prisma.empregado.findUnique({
      where: { matricula }
    });

    if (!empregado) {
      return res.status(404).json({
        success: false,
        message: 'Empregado não encontrado'
      });
    }

    console.log('✅ Empregado encontrado:', empregado.id_empregados);
    console.log('📸 Foto do empregado:', empregado.foto);

    return res.json({
      success: true,
      data: empregado
    });

  } catch (error) {
    console.error('❌ Erro ao buscar empregado:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? (error as any).message : undefined
    });
  }
});

// GET /api/empregados - Listar todos os empregados
router.get('/', auth, requireAdmin, async (req: any, res: any) => {
  try {
    console.log('📊 === ROTA /api/empregados GET ALL CHAMADA ===');
    console.log('📊 Usuário logado ID:', req.user.id_usuario);

    const empregados = await prisma.empregado.findMany({
      orderBy: {
        data_atualizacao: 'desc'
      }
    });

    console.log(`✅ ${empregados.length} empregados encontrados`);

    return res.json({
      success: true,
      data: empregados,
      total: empregados.length
    });

  } catch (error) {
    console.error('❌ Erro ao listar empregados:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? (error as any).message : undefined
    });
  }
});

// DELETE /api/empregados/:matricula - Deletar empregado
router.delete('/:matricula', auth, requireAdmin, async (req: any, res: any) => {
  try {
    console.log('📊 === ROTA /api/empregados DELETE CHAMADA ===');
    console.log('📊 Matrícula para deletar:', req.params.matricula);

    const { matricula } = req.params;

    // Verificar se o empregado existe
    const empregado = await prisma.empregado.findUnique({
      where: { matricula }
    });

    if (!empregado) {
      return res.status(404).json({
        success: false,
        message: 'Empregado não encontrado'
      });
    }

    // Deletar foto se existir
    if (empregado.foto) {
      const fotoPath = path.join(__dirname, '../../public', empregado.foto);
      if (fs.existsSync(fotoPath)) {
        fs.unlinkSync(fotoPath);
        console.log('📸 Foto deletada:', fotoPath);
      }
    }

    // Deletar empregado
    await prisma.empregado.delete({
      where: { matricula }
    });

    console.log('✅ Empregado deletado com sucesso:', matricula);

    return res.json({
      success: true,
      message: 'Empregado deletado com sucesso'
    });

  } catch (error) {
    console.error('❌ Erro ao deletar empregado:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? (error as any).message : undefined
    });
  }
});

export default router;
