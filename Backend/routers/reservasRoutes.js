// routers/reservasRoutes.js
import express from 'express';
import { verificarToken } from '../middlewares/verificarToken.js';
import { crearReserva, getReservasUsuario, cancelarReserva } from '../controllers/reservasController.js';
import { requireRole } from '../middlewares/requireRole.js';

const router = express.Router();
const soloSocio = [verificarToken, requireRole('socio')];

router.post('/api/reservas', ...soloSocio, crearReserva);
router.get('/api/reservas', ...soloSocio, getReservasUsuario);
router.delete('/api/reservas/:reserva_id', ...soloSocio, cancelarReserva);

export default router;
