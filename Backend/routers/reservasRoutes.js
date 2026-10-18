// routers/reservasRoutes.js
import express from 'express';
import { verificarToken } from '../middlewares/verificarToken.js';
import { crearReserva, getReservasUsuario, cancelarReserva } from '../controllers/reservasController.js';

const router = express.Router();

router.post('/api/reservas', verificarToken, crearReserva);
router.get('/api/reservas', verificarToken, getReservasUsuario);
router.delete('/api/reservas/:reserva_id', verificarToken, cancelarReserva);

export default router;
