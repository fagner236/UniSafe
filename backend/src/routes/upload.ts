import express from 'express';
import { uploadFile, getUploads, upload } from '../controllers/uploadController';
import { auth } from '../middleware/auth';

const router = express.Router();

// POST /api/upload
router.post('/', auth, upload.single('file'), uploadFile);

// GET /api/upload
router.get('/', auth, getUploads);

export default router;
