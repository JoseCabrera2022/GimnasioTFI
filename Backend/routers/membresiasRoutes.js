import express from 'express';
import { getMembresiasUsuario } from '../controllers/membresiasController.js';
import { verificarToken } from '../middlewares/verificarToken.js';
import { requireRole } from '../middlewares/requireRole.js';

const router = express.Router();

router.get('/api/membresias', verificarToken, requireRole('socio'), getMembresiasUsuario);

export default router;
