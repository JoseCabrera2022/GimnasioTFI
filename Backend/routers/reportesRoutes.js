import express from 'express';
import { obtenerDashboardAdministrativo, obtenerReporteAdministrativo } from '../controllers/reportesController.js';
import { verificarToken } from '../middlewares/verificarToken.js';

const router = express.Router();

const soloAdmin = (req, res, next) => {
  if (req.usuario?.rol !== 'admin') {
    return res.status(403).json({ error: 'Se requieren permisos de administrador' });
  }
  next();
};

router.get('/api/reportes/admin', verificarToken, soloAdmin, obtenerReporteAdministrativo);
router.get('/api/reportes/dashboard', verificarToken, soloAdmin, obtenerDashboardAdministrativo);

export default router;
