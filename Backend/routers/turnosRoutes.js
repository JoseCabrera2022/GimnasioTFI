// turnosRoutes.js
import express from 'express';
import { getTurnosByActividad, createTurno, updateTurno, deleteTurno } from '../controllers/turnosController.js';
import { verificarToken } from '../middlewares/verificarToken.js';
import { requireRole } from '../middlewares/requireRole.js';

const router = express.Router();
const soloAdmin = [verificarToken, requireRole('admin')];

router.get('/api/actividades/:actividad_id/turnos', ...soloAdmin, getTurnosByActividad);
router.post('/api/turnos', ...soloAdmin, createTurno);
router.put('/api/turnos/:id', ...soloAdmin, updateTurno);
router.delete('/api/turnos/:id', ...soloAdmin, deleteTurno);

export default router;
