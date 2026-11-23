import express from 'express';
import {
  getUbicaciones,
  crearUbicacion,
  actualizarUbicacion,
  eliminarUbicacion,
  activarUbicacion
} from '../controllers/ubicacionesController.js';
import { verificarToken } from '../middlewares/verificarToken.js';
import { requireRole } from '../middlewares/requireRole.js';

const router = express.Router();
const soloAdmin = [verificarToken, requireRole('admin')];

// Ruta pública
router.get('/api/ubicaciones', getUbicaciones);

// Rutas protegidas para admin
router.post('/api/ubicaciones', ...soloAdmin, crearUbicacion);
router.put('/api/ubicaciones/:id', ...soloAdmin, actualizarUbicacion);
router.delete('/api/ubicaciones/:id', ...soloAdmin, eliminarUbicacion);
router.patch('/api/ubicaciones/:id/activar', ...soloAdmin, activarUbicacion);

export default router;
