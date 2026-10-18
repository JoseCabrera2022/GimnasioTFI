import express from 'express';
import { createActividad, deleteActividad, getActividadById, getActividades, getActividadesConTurnos, updateActividad } from '../controllers/actividadesController.js';
import { verificarToken } from '../middlewares/verificarToken.js';
import { upload } from '../configs/multer.js';

const router = express.Router();

router.get('/api/actividades', verificarToken, getActividadesConTurnos);
router.get('/api/actividades-simple', verificarToken, getActividades);
router.get('/api/actividades/:id', verificarToken, getActividadById);
router.post('/api/actividades', verificarToken, upload.single('foto'), createActividad);
router.put('/api/actividades/:id', verificarToken, upload.single('foto'), updateActividad);
router.delete('/api/actividades/:id', verificarToken, deleteActividad);

export default router;