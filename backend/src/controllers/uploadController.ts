import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import xlsx from 'xlsx';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

// Configuração do Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req: any, file: any, cb: any) => {
  const allowedTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'text/csv'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de arquivo não suportado. Use arquivos Excel (.xlsx, .xls) ou CSV.'), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760') // 10MB
  }
});

export const uploadFile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Nenhum arquivo foi enviado'
      });
    }

    const { originalname, filename, size, mimetype, path: filePath } = req.file;

    // Criar registro do upload
    const uploadRecord = await prisma.upload.create({
      data: {
        filename,
        originalName: originalname,
        size,
        mimetype,
        path: filePath,
        status: 'pending',
        uploadedBy: req.user!.id
      }
    });

    // Processar arquivo em background
    processFileAsync(uploadRecord.id, filePath);

    res.status(201).json({
      success: true,
      message: 'Arquivo enviado com sucesso',
      data: {
        id: uploadRecord.id,
        originalName: uploadRecord.originalName,
        size: uploadRecord.size,
        status: uploadRecord.status,
        uploadedAt: uploadRecord.uploadedAt
      }
    });
  } catch (error) {
    console.error('Erro no upload:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

const processFileAsync = async (uploadId: string, filePath: string) => {
  try {
    // Atualizar status para processando
    await prisma.upload.update({
      where: { id: uploadId },
      data: { status: 'processing' }
    });

    // Ler arquivo Excel
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);

    let processedCount = 0;
    let errorCount = 0;

    // Processar cada linha
    for (const row of data as any[]) {
      try {
        // Validar dados obrigatórios
        if (!row.Nome || !row.CPF || !row.Cargo || !row.Empresa) {
          errorCount++;
          continue;
        }

        // Formatar CPF (remover caracteres especiais)
        const cpf = row.CPF.toString().replace(/\D/g, '');

        // Verificar se CPF já existe
        const existingEmployee = await prisma.employee.findUnique({
          where: { cpf }
        });

        if (existingEmployee) {
          // Atualizar dados existentes
          await prisma.employee.update({
            where: { cpf },
            data: {
              name: row.Nome,
              email: row.Email || null,
              phone: row.Telefone || null,
              position: row.Cargo,
              department: row.Departamento || 'Geral',
              company: row.Empresa,
              admissionDate: new Date(row['Data de Admissão'] || new Date()),
              salary: parseFloat(row.Salario) || 0,
              lastUpdate: new Date(),
              uploadId
            }
          });
        } else {
          // Criar novo funcionário
          await prisma.employee.create({
            data: {
              name: row.Nome,
              cpf,
              email: row.Email || null,
              phone: row.Telefone || null,
              position: row.Cargo,
              department: row.Departamento || 'Geral',
              company: row.Empresa,
              admissionDate: new Date(row['Data de Admissão'] || new Date()),
              salary: parseFloat(row.Salario) || 0,
              uploadId
            }
          });
        }

        processedCount++;
      } catch (error) {
        console.error('Erro ao processar linha:', error);
        errorCount++;
      }
    }

    // Atualizar status final
    await prisma.upload.update({
      where: { id: uploadId },
      data: {
        status: errorCount > 0 ? 'completed' : 'completed',
        processedAt: new Date(),
        totalRecords: data.length,
        processedRecords: processedCount,
        errorMessage: errorCount > 0 ? `${errorCount} registros com erro` : null
      }
    });

    console.log(`Upload ${uploadId} processado: ${processedCount} registros processados, ${errorCount} erros`);
  } catch (error) {
    console.error('Erro ao processar arquivo:', error);
    
    await prisma.upload.update({
      where: { id: uploadId },
      data: {
        status: 'error',
        errorMessage: error instanceof Error ? error.message : 'Erro desconhecido'
      }
    });
  }
};

export const getUploads = async (req: AuthRequest, res: Response) => {
  try {
    const uploads = await prisma.upload.findMany({
      where: { uploadedBy: req.user!.id },
      orderBy: { uploadedAt: 'desc' },
      select: {
        id: true,
        originalName: true,
        size: true,
        status: true,
        uploadedAt: true,
        processedAt: true,
        totalRecords: true,
        processedRecords: true,
        errorMessage: true
      }
    });

    res.json({
      success: true,
      data: uploads
    });
  } catch (error) {
    console.error('Erro ao buscar uploads:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};
