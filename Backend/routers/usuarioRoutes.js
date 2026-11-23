import express from 'express';
import { verificarToken } from '../middlewares/verificarToken.js';
import { getUsuarios, createUsuario, updateUsuario, deleteUsuario, activarUsuario, getUsuarioById } from '../controllers/usuarioController.js';
import { upload } from '../configs/multer.js';
import { requireRole } from '../middlewares/requireRole.js';

const router = express.Router();
const soloAdmin = [verificarToken, requireRole('admin')];

// Todas protegidas y solo admin
router.get('/api/usuarios', ...soloAdmin, getUsuarios);
router.get('/api/usuarios/:id', ...soloAdmin, getUsuarioById);
router.post('/api/usuarios', ...soloAdmin, createUsuario);
router.put('/api/usuarios/:id', ...soloAdmin, upload.single('foto'), updateUsuario);
router.delete('/api/usuarios/:id', ...soloAdmin, deleteUsuario);
router.patch('/api/usuarios/:id/activar', ...soloAdmin, activarUsuario);

export default router;
