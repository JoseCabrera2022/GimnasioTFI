import express from 'express';
import { activarPlan, actualizarDuracion, actualizarPlan, crearDuracion, crearPlan, eliminarDuracion, eliminarPlan, obtenerPlanes } from '../controllers/planesController.js';
import { verificarToken } from '../middlewares/verificarToken.js';
import { requireRole } from '../middlewares/requireRole.js';

const router = express.Router();
const soloAdmin = [verificarToken, requireRole('admin')];

//Obtener planes y duraciones
router.get('/api/planes', obtenerPlanes);

// CRUD planes
router.post('/api/planes', ...soloAdmin, crearPlan);
router.put('/api/planes/:id', ...soloAdmin, actualizarPlan);
router.delete('/api/planes/:id', ...soloAdmin, eliminarPlan);
router.patch('/api/planes/:id/activar', ...soloAdmin, activarPlan);

// CRUD duraciones
router.post('/api/duraciones', ...soloAdmin, crearDuracion);
router.put('/api/duraciones/:id', ...soloAdmin, actualizarDuracion);
router.delete('/api/duraciones/:id', ...soloAdmin, eliminarDuracion);

export default router;
