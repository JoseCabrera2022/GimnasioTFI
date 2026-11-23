import express from 'express';
import { activarActividad, createActividad, deleteActividad, getActividadById, getActividades, getActividadesConTurnos, updateActividad } from '../controllers/actividadesController.js';
import { verificarToken } from '../middlewares/verificarToken.js';
import { upload } from '../configs/multer.js';
import { requireRole } from '../middlewares/requireRole.js';

const router = express.Router();
const soloAdmin = [verificarToken, requireRole('admin')];
const soloSocio = [verificarToken, requireRole('socio')];

router.get('/api/actividades', ...soloSocio, getActividadesConTurnos);
router.get('/api/actividades-simple', ...soloAdmin, getActividades);
router.get('/api/actividades/:id', ...soloAdmin, getActividadById);
router.post('/api/actividades', ...soloAdmin, upload.single('foto'), createActividad);
router.put('/api/actividades/:id', ...soloAdmin, upload.single('foto'), updateActividad);
router.delete('/api/actividades/:id', ...soloAdmin, deleteActividad);
router.patch('/api/actividades/:id/activar', ...soloAdmin, activarActividad);

export default router;