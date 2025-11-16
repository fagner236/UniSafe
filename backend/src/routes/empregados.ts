import express from 'express';
import { PrismaClient } from '@prisma/client';
import { auth } from '../middleware/auth';
import { cacheService } from '../config/redis';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

import { uploadFileToWasabi, getPermanentFileUrl, getFileUrl } from "../bucket/bucket.service";
import SystemLogger from '../utils/logger';
const router = express.Router();
const prisma = new PrismaClient();

// Função auxiliar para extrair informações da requisição
const getRequestInfo = (req: any) => {
  return {
    ipAddress: req.ip || req.socket.remoteAddress || req.headers['x-forwarded-for']?.toString() || 'unknown',
    userAgent: req.headers['user-agent'] || 'unknown',
    sessionId: req.headers['x-session-id']?.toString() || undefined
  };
};

// Configuração do multer para upload de fotos
const upload = multer({ storage: multer.memoryStorage() }); // arquivo em memória
/*
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
*/

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
//router.post('/', auth, requireAdmin, async (req: any, res: any) => {
  try {
    console.log('📊 === ROTA /api/empregados POST CHAMADA ===');
    console.log('📊 Usuário logado ID:', req.user.id_usuario);
    console.log('📊 Dados recebidos:', req.body);
    console.log('📊 Arquivo de foto:', req.file);

    const { matricula, email, celular, base_sindical } = req.body;
    const id_usuario = req.user.id_usuario;

    console.log('🔍 Dados recebidos brutos:', { matricula, email, celular, base_sindical });

    // Validações básicas
    if (!matricula) {
      return res.status(400).json({
        success: false,
        message: 'Matrícula é obrigatória'
      });
    }

    // Limpar e validar celular de forma mais robusta
    let cleanCelular = null;
    if (celular && celular.trim() !== '') {
      console.log('🔍 Celular recebido:', JSON.stringify(celular));
      
      // Remove espaços em branco
      const trimmedCelular = celular.trim();
      
      // Valida se já está no formato correto (XX) XXXXX-XXXX
      const celularRegexComParenteses = /^\(\d{2}\) \d{5}-\d{4}$/;
      // Valida se está no formato XX XXXXX-XXXX (sem parênteses)
      const celularRegexSemParenteses = /^\d{2} \d{5}-\d{4}$/;
      // Valida se está no formato XXXXX-XXXX (sem parênteses e sem espaço)
      const celularRegexSemEspaco = /^\d{5}-\d{4}$/;
      
      if (celularRegexComParenteses.test(trimmedCelular)) {
        cleanCelular = trimmedCelular;
        console.log('✅ Celular já formatado corretamente com parênteses:', cleanCelular);
      } else if (celularRegexSemParenteses.test(trimmedCelular)) {
        // Converter XX XXXXX-XXXX para (XX) XXXXX-XXXX
        const numbers = trimmedCelular.replace(/[^\d]/g, '');
        cleanCelular = `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
        console.log('✅ Celular convertido para formato com parênteses:', cleanCelular);
      } else if (celularRegexSemEspaco.test(trimmedCelular)) {
        // Converter XXXXX-XXXX para (XX) XXXXX-XXXX
        const numbers = trimmedCelular.replace(/[^\d]/g, '');
        cleanCelular = `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
        console.log('✅ Celular convertido de formato sem espaço:', cleanCelular);
      } else {
        // Tenta extrair números e formatar
        const numbers = trimmedCelular.replace(/[^\d]/g, '');
        console.log('🔍 Números extraídos:', numbers, 'de:', trimmedCelular);
        
        if (numbers.length === 11) {
          cleanCelular = `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
          console.log('✅ Celular formatado:', cleanCelular);
        } else if (numbers.length > 0) {
          console.warn('⚠️ Celular com formato inválido:', celular, '-> números extraídos:', numbers, '-> comprimento:', numbers.length);
          return res.status(400).json({
            success: false,
            message: `Celular deve ter exatamente 11 dígitos. Encontrados: ${numbers.length}. Formato esperado: (XX) XXXXX-XXXX`
          });
        }
      }
    }

    // Limpar e validar email de forma mais robusta
    let cleanEmail = null;
    if (email && email.trim() !== '') {
      console.log('🔍 Email recebido:', JSON.stringify(email));
      
      // Remove espaços em branco e converte para minúsculas
      cleanEmail = email.trim().toLowerCase();
      
      // Validação básica de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(cleanEmail)) {
        console.warn('⚠️ Email com formato inválido:', email);
        return res.status(400).json({
          success: false,
          message: 'Formato de email inválido'
        });
      }
      console.log('✅ Email validado:', cleanEmail);
    }

    console.log('🔍 Dados processados:', { matricula, email: cleanEmail, celular: cleanCelular });

    // Verificar se o empregado já existe pela matrícula
    const empregadoExistente = await prisma.empregado.findUnique({
      where: { matricula }
    });

    let fotoFileName = null;
    if (req.file) {
      try {
        // Fazer upload da foto para o Wasabi
        const bucket = base_sindical?.replace('/','_') || "unisafe";
        const key = `${matricula}.png`;
        
        // Fazer upload e obter o nome do arquivo
        fotoFileName = await uploadFileToWasabi({
          bucket: bucket,
          file: req.file,
          key: key,
        });
        
        console.log("✅ Foto enviada para o Wasabi:", fotoFileName);
      } catch (err) {
        console.error("❌ Erro ao enviar foto para o Wasabi:", err);
        // Não interromper o processo se houver erro no upload da foto
        fotoFileName = null;
      }
    }

    if (empregadoExistente) {
      // Atualizar empregado existente
      console.log('📊 Atualizando empregado(a) existente:', empregadoExistente.id_empregados);
      
      // Preparar dados de atualização
      const updateData: any = {
        email: cleanEmail !== undefined ? cleanEmail : empregadoExistente.email,
        celular: cleanCelular !== undefined ? cleanCelular : empregadoExistente.celular,
        id_usuario,
        data_atualizacao: new Date()
      };
      
      // Atualizar foto apenas se uma nova foi enviada
      if (fotoFileName) {
        updateData.foto = fotoFileName;
        console.log('📸 Nova foto será salva:', fotoFileName);
      } else {
        // Manter foto existente se não enviar nova
        console.log('📸 Mantendo foto existente:', empregadoExistente.foto);
      }
      
      const empregadoAtualizado = await prisma.empregado.update({
        where: { matricula },
        data: updateData
      });

      console.log('✅ Empregado(a) atualizado(a) com sucesso:', empregadoAtualizado.id_empregados);

      // Buscar informações da empresa
      let companyName = null;
      if (req.user.id_empresa) {
        const company = await prisma.company.findUnique({
          where: { id_empresa: req.user.id_empresa },
          select: { nome_fantasia: true, razao_social: true }
        });
        companyName = company?.nome_fantasia || company?.razao_social || null;
      }

      const requestInfo = getRequestInfo(req);

      // Log de atualização de empregado
      await SystemLogger.userAction({
        message: `Empregado atualizado: matrícula ${matricula}`,
        userId: req.user.id_usuario,
        userEmail: req.user.email,
        userProfile: req.user.perfil,
        companyId: req.user.id_empresa || undefined,
        companyName: companyName || undefined,
        ipAddress: requestInfo.ipAddress,
        userAgent: requestInfo.userAgent,
        sessionId: requestInfo.sessionId,
        action: 'UPDATE_EMPLOYEE',
        resource: '/api/empregados',
        details: {
          matricula: matricula,
          email: cleanEmail,
          celular: cleanCelular,
          fotoUpdated: !!fotoFileName,
          base_sindical: base_sindical
        }
      });

      return res.json({
        success: true,
        message: 'Dados do(a) empregado(a) atualizado(a) com sucesso!',
        data: empregadoAtualizado
      });

    } else {
      // Criar novo empregado
      console.log('📊 Criando novo(a) empregado(a)');
      
      const novoEmpregado = await prisma.empregado.create({
        data: {
          matricula,
          email: cleanEmail || null,
          celular: cleanCelular || null,
          foto: fotoFileName, // Salvar apenas o nome do arquivo
          id_usuario,
          data_criacao: new Date(),
          data_atualizacao: new Date()
        }
      });

      console.log('✅ Novo(a) empregado(a) criado(a) com sucesso:', novoEmpregado.id_empregados);

      // Buscar informações da empresa
      let companyName = null;
      if (req.user.id_empresa) {
        const company = await prisma.company.findUnique({
          where: { id_empresa: req.user.id_empresa },
          select: { nome_fantasia: true, razao_social: true }
        });
        companyName = company?.nome_fantasia || company?.razao_social || null;
      }

      const requestInfo = getRequestInfo(req);

      // Log de criação de empregado
      await SystemLogger.userAction({
        message: `Empregado criado: matrícula ${matricula}`,
        userId: req.user.id_usuario,
        userEmail: req.user.email,
        userProfile: req.user.perfil,
        companyId: req.user.id_empresa || undefined,
        companyName: companyName || undefined,
        ipAddress: requestInfo.ipAddress,
        userAgent: requestInfo.userAgent,
        sessionId: requestInfo.sessionId,
        action: 'CREATE_EMPLOYEE',
        resource: '/api/empregados',
        details: {
          matricula: matricula,
          email: cleanEmail,
          celular: cleanCelular,
          foto: fotoFileName,
          base_sindical: base_sindical
        }
      });

      // Invalidar cache do empregado após criação
      const empregadoCacheKey = `empregado:${matricula}`;
      await cacheService.del(empregadoCacheKey);
      console.log('🗑️ Cache do empregado invalidado após criação');

      return res.json({
        success: true,
        message: 'Empregado(a) criado(a) com sucesso',
        data: novoEmpregado
      });
    }

  } catch (error) {
    console.error('❌ Erro ao salvar empregado(a):', error);
    console.error('❌ Detalhes do erro:', {
      code: (error as any).code,
      meta: (error as any).meta,
      message: (error as any).message,
      stack: (error as any).stack
    });
    
    // Se houver erro de constraint única (matrícula duplicada)
    if ((error as any).code === 'P2002' && (error as any).meta?.target?.includes('matricula')) {
      return res.status(400).json({
        success: false,
        message: 'Já existe um empregado(a) com esta matrícula'
      });
    }

    // Se houver erro de constraint única (email duplicado)
    if ((error as any).code === 'P2002' && (error as any).meta?.target?.includes('e-mail')) {
      return res.status(400).json({
        success: false,
        message: 'Já existe um empregado(a) com este e-mail'
      });
    }

    // Se houver erro de constraint única (celular duplicado)
    if ((error as any).code === 'P2002' && (error as any).meta?.target?.includes('celular')) {
      return res.status(400).json({
        success: false,
        message: 'Já existe um empregado(a) com este celular'
      });
    }

    // Se houver erro de validação de padrão
    if ((error as any).message && (error as any).message.includes('pattern')) {
      console.error('❌ Erro de padrão detectado:', (error as any).message);
      return res.status(400).json({
        success: false,
        message: 'Formato de dados inválido. Verifique email e celular.',
        details: process.env.NODE_ENV === 'development' ? (error as any).message : undefined
      });
    }

    // Se houver erro de validação de string
    if ((error as any).message && (error as any).message.includes('string')) {
      console.error('❌ Erro de string detectado:', (error as any).message);
      return res.status(400).json({
        success: false,
        message: 'Formato de dados inválido. Verifique os campos preenchidos.',
        details: process.env.NODE_ENV === 'development' ? (error as any).message : undefined
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
    
    // Cache específico para empregados (TTL curto - dados podem ser editados)
    const empregadoCacheKey = `empregado:${matricula}`;
    console.log('🔍 Verificando cache de empregado...');
    
    let empregado = await cacheService.get(empregadoCacheKey);
    
    if (empregado) {
      console.log('⚡ Cache HIT! Empregado encontrado no Redis (TTL: 1 hora)');
    } else {
      console.log('❌ Cache MISS! Buscando empregado no banco...');
      
      empregado = await prisma.empregado.findUnique({
        where: { matricula }
      });
      
      // Salvar no cache por 1 hora (dados podem ser editados)
      if (empregado) {
        console.log('💾 Salvando empregado no cache Redis (TTL: 1 hora)...');
        await cacheService.set(empregadoCacheKey, empregado, 3600); // 1 hora
        console.log('✅ Empregado salvo no cache Redis');
      }
    }

    const base = await prisma.baseDados.findFirst({
      where: { matricula: matricula }
    });

    if (!empregado) {
      return res.status(404).json({
        success: false,
        message: 'Empregado(a) não encontrado(a)'
      });
    }

    console.log('✅ Empregado(a) encontrado(a):', empregado.id_empregados);
    console.log('📸 Foto do(a) empregado(a) (nome do arquivo):', empregado.foto);

    // Construir URL permanente da foto se existir
    if (empregado.foto && base) {
      try {
        const bucket = base.base_sindical?.replace('/','_') || "unisafe";
        const permanentUrl = await getFileUrl({bucket: bucket, key: empregado.foto});
        console.log("🔗 URL permanente da foto:", permanentUrl);
        empregado.foto = permanentUrl;
      } catch (err) {
        console.error("❌ Erro ao construir URL permanente da foto:", err, empregado.foto);
        // Manter o nome do arquivo se houver erro
      }
    }


    return res.json({
      success: true,
      data: empregado
    });

  } catch (error) {
    console.error('❌ Erro ao buscar empregado(a):', error);
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

    console.log(`✅ ${empregados.length} empregados(as) encontrados(as)`);

    return res.json({
      success: true,
      data: empregados,
      total: empregados.length
    });

  } catch (error) {
    console.error('❌ Erro ao listar empregados(as):', error);
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
        message: 'Empregado(a) não encontrado(a)'
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

    console.log('✅ Empregado(a) deletado(a) com sucesso:', matricula);

    return res.json({
      success: true,
      message: 'Empregado(a) deletado(a) com sucesso'
    });

  } catch (error) {
    console.error('❌ Erro ao deletar empregado(a):', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? (error as any).message : undefined
    });
  }
});

export default router;