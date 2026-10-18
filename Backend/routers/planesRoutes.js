import express from 'express';
import { actualizarDuracion, actualizarPlan, crearDuracion, crearPlan, eliminarDuracion, eliminarPlan, obtenerPlanes } from '../controllers/planesController.js';
import { verificarToken } from '../middlewares/verificarToken.js';

const router = express.Router();

//Obtener planes y duraciones
router.get('/api/planes', obtenerPlanes);

// CRUD planes
router.post('/api/planes', verificarToken, crearPlan);
router.put('/api/planes/:id', verificarToken, actualizarPlan);
router.delete('/api/planes/:id', verificarToken, eliminarPlan);

// CRUD duraciones
router.post('/api/duraciones', verificarToken, crearDuracion);
router.put('/api/duraciones/:id', verificarToken, actualizarDuracion);
router.delete('/api/duraciones/:id', verificarToken, eliminarDuracion);

export default router;
