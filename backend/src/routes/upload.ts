import express from 'express';
import { uploadFile, getUploads, getUploadData, importToBaseDados, saveColumnMappings, getColumnMappings, getColumnMappingsByUpload, upload } from '../controllers/uploadController';
import { auth } from '../middleware/auth';
// import { validateCompanyAccess, validateUploadAccess } from '../middleware/companyAccess';

const router = express.Router();

// POST /api/upload
router.post('/', auth, upload.single('file'), uploadFile);

// GET /api/upload
router.get('/', auth, getUploads);

// POST /api/upload/column-mappings - Salvar mapeamentos de colunas
router.post('/column-mappings', auth, saveColumnMappings);

// GET /api/upload/column-mappings - Buscar todos os mapeamentos
router.get('/column-mappings', auth, getColumnMappings);

// GET /api/upload/:uploadId/data
router.get('/:uploadId/data', auth, getUploadData);

// POST /api/upload/:uploadId/import-base-dados
router.post('/:uploadId/import-base-dados', auth, importToBaseDados);

// GET /api/upload/:uploadId/column-mappings - Buscar mapeamentos por upload
router.get('/:uploadId/column-mappings', auth, getColumnMappingsByUpload);

export default router;
