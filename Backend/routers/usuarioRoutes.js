import express from 'express';
import { verificarToken } from '../middlewares/verificarToken.js';
import { getUsuarios, createUsuario, updateUsuario, deleteUsuario, deleteUsuarioDefinitivo, getUsuarioById } from '../controllers/usuarioController.js';
import { upload } from '../configs/multer.js';

const router = express.Router();

const soloAdmin = (req, res, next) => {
  if (req.usuario?.rol !== 'admin') {
    return res.status(403).json({ error: 'Se requieren permisos de administrador' });
  }
  next();
};

// Todas protegidas y solo admin
router.get('/api/usuarios', verificarToken, getUsuarios);
router.get('/api/usuarios/:id', verificarToken, getUsuarioById);
router.post('/api/usuarios', verificarToken, createUsuario);
router.put('/api/usuarios/:id', verificarToken, upload.single('foto'), updateUsuario);
router.delete('/api/usuarios/:id/definitivo', verificarToken, soloAdmin, deleteUsuarioDefinitivo);
router.delete('/api/usuarios/:id', verificarToken, soloAdmin, deleteUsuario);

export default router;
