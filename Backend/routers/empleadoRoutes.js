import express from 'express';
import { buscarSociosEmpleado, getReservasTurnoEmpleado, getResumenEmpleado, registrarAsistenciaEmpleado, registrarIngresoLibreEmpleado } from '../controllers/empleadoController.js';
import { requireRole } from '../middlewares/requireRole.js';
import { verificarToken } from '../middlewares/verificarToken.js';

const router = express.Router();
const soloEmpleado = [verificarToken, requireRole('empleado')];

router.get('/api/empleado/resumen', ...soloEmpleado, getResumenEmpleado);
router.get('/api/empleado/socios', ...soloEmpleado, buscarSociosEmpleado);
router.post('/api/empleado/ingresos', ...soloEmpleado, registrarIngresoLibreEmpleado);
router.get('/api/empleado/turnos/:turnoId/reservas', ...soloEmpleado, getReservasTurnoEmpleado);
router.post('/api/empleado/reservas/:reservaId/asistencia', ...soloEmpleado, registrarAsistenciaEmpleado);

export default router;
