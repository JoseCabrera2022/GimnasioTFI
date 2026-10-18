import express from 'express';
import { getPerfil, updatePerfil } from '../controllers/perfilController.js';
import { verificarToken } from '../middlewares/verificarToken.js';
import { upload } from '../configs/multer.js';

const router = express.Router();

router.get('/api/perfil', verificarToken, getPerfil);
router.put('/api/perfil', verificarToken, upload.single('foto'), updatePerfil);

export default router;
