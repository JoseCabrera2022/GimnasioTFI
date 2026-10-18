import express from 'express';
import { crearPreferencia, verificarPago, recibirWebhook, getHistorialPagos } from '../controllers/pagosController.js';
import { verificarToken } from '../middlewares/verificarToken.js';

const router = express.Router();

router.post('/mercadopago', crearPreferencia);
router.get('/verificar', verificarPago);
router.post('/webhook', recibirWebhook);
router.get('/historial', verificarToken, getHistorialPagos);

export default router;
