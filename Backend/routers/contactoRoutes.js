import express from 'express';
import { deleteMensaje, enviarMensajeContacto, getMensajeById, getMensajes, limpiarBandeja, responderMensaje } from '../controllers/contactoController.js';

const router = express.Router();

router.post('/api/contacto', enviarMensajeContacto);
router.get('/api/contacto', getMensajes);
router.get('/api/contacto/:id', getMensajeById);
router.put('/api/contacto/:id/responder', responderMensaje);
router.delete('/api/contacto/:id', deleteMensaje);
router.delete('/api/contacto', limpiarBandeja);

export default router;
