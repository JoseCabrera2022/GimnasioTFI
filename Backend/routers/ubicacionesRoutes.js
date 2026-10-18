import express from 'express';
import {
  getUbicaciones,
  crearUbicacion,
  actualizarUbicacion,
  eliminarUbicacion
} from '../controllers/ubicacionesController.js';
import { verificarToken } from '../middlewares/verificarToken.js';

const router = express.Router();

// Ruta pública
router.get('/api/ubicaciones', getUbicaciones);

// Rutas protegidas para admin
router.post('/api/ubicaciones', verificarToken, crearUbicacion);
router.put('/api/ubicaciones/:id', verificarToken, actualizarUbicacion);
router.delete('/api/ubicaciones/:id', verificarToken, eliminarUbicacion);

export default router;
