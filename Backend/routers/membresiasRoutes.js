import express from 'express';
import { getMembresiasUsuario } from '../controllers/membresiasController.js';
import { verificarToken } from '../middlewares/verificarToken.js';

const router = express.Router();

router.get('/api/membresias', verificarToken, getMembresiasUsuario);

export default router;
