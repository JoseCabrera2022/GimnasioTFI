import express from 'express';
import { deleteMensaje, enviarMensajeContacto, getMensajeById, getMensajes, limpiarBandeja, responderMensaje } from '../controllers/contactoController.js';
import { requireRole } from '../middlewares/requireRole.js';
import { verificarToken } from '../middlewares/verificarToken.js';

const router = express.Router();
const soloAdmin = [verificarToken, requireRole('admin')];

router.post('/api/contacto', enviarMensajeContacto);
router.get('/api/contacto', ...soloAdmin, getMensajes);
router.get('/api/contacto/:id', ...soloAdmin, getMensajeById);
router.put('/api/contacto/:id/responder', ...soloAdmin, responderMensaje);
router.delete('/api/contacto/:id', ...soloAdmin, deleteMensaje);
router.delete('/api/contacto', ...soloAdmin, limpiarBandeja);

export default router;
