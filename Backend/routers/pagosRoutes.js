import express from 'express';
import { crearPreferencia, verificarPago, recibirWebhook, getHistorialPagos } from '../controllers/pagosController.js';
import { verificarToken } from '../middlewares/verificarToken.js';
import { requireRole } from '../middlewares/requireRole.js';

const router = express.Router();

router.post('/mercadopago', verificarToken, requireRole('socio'), crearPreferencia);
router.get('/verificar', verificarPago);
router.post('/webhook', recibirWebhook);
router.get('/historial', verificarToken, requireRole('socio'), getHistorialPagos);

export default router;
