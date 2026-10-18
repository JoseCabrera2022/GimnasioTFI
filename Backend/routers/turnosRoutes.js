// turnosRoutes.js
import express from 'express';
import { getTurnosByActividad, createTurno, updateTurno, deleteTurno } from '../controllers/turnosController.js';
import { verificarToken } from '../middlewares/verificarToken.js';

const router = express.Router();

router.get('/api/actividades/:actividad_id/turnos', verificarToken, getTurnosByActividad);
router.post('/api/turnos', verificarToken, createTurno);
router.put('/api/turnos/:id', verificarToken, updateTurno);
router.delete('/api/turnos/:id', verificarToken, deleteTurno);

export default router;
