import db from '../configs/database.js';
import { expirarReservasVencidas } from '../services/reservasService.js';

const obtenerSedeEmpleado = async (req, res) => {
  if (!req.usuario.ubicacion_id) {
    res.status(409).json({ error: 'Tu usuario no tiene una sede asignada' });
    return null;
  }
  const [sedes] = await db.query(
    'SELECT id FROM ubicaciones WHERE id = ? AND eliminado = 0',
    [req.usuario.ubicacion_id]
  );
  if (sedes.length === 0) {
    res.status(409).json({ error: 'La sede asignada no está disponible' });
    return null;
  }
  return sedes[0].id;
};

export const getResumenEmpleado = async (req, res) => {
  try {
    await expirarReservasVencidas();

    const ubicacionId = await obtenerSedeEmpleado(req, res);
    if (!ubicacionId) return;

    const [[sede]] = await db.query(
      'SELECT nombre, ciudad FROM ubicaciones WHERE id = ? AND eliminado = 0',
      [ubicacionId]
    );
    const [[turnos], [turnosFuturos]] = await Promise.all([
      db.query(`
      SELECT t.id, t.fecha, t.cupo_maximo, a.id AS actividad_id, a.nombre AS actividad,
             l.nombre AS sede, l.ciudad,
             (SELECT GROUP_CONCAT(u.nombre ORDER BY u.nombre SEPARATOR ', ')
              FROM turno_entrenadores te
              JOIN usuarios u ON u.id = te.empleado_id
                AND u.estado = 'activo' AND u.eliminado = 0
              WHERE te.turno_id = t.id) AS entrenadores,
             EXISTS (
               SELECT 1 FROM turno_entrenadores te
               WHERE te.turno_id = t.id AND te.empleado_id = ?
             ) AS es_entrenador,
             (SELECT COUNT(*) FROM reservas r
              WHERE r.turno_id = t.id AND r.estado = 'confirmada') AS reservas_confirmadas,
             (SELECT COUNT(*) FROM asistencias asi
              JOIN reservas r ON r.id = asi.reserva_id
              WHERE r.turno_id = t.id AND r.estado = 'confirmada') AS asistencias_registradas
      FROM turnos t
      JOIN actividades a ON a.id = t.actividad_id AND a.eliminado = 0
      JOIN ubicaciones l ON l.id = a.ubicacion_id AND l.eliminado = 0
      WHERE a.ubicacion_id = ?
        AND EXISTS (
          SELECT 1 FROM turno_entrenadores te
          WHERE te.turno_id = t.id AND te.empleado_id = ?
        )
        AND t.fecha >= CURDATE()
        AND t.fecha < DATE_ADD(CURDATE(), INTERVAL 1 DAY)
        AND t.fecha > DATE_SUB(NOW(), INTERVAL 1 HOUR)
      ORDER BY t.fecha ASC
      `, [req.usuario.id, ubicacionId, req.usuario.id]),
      db.query(`
        SELECT t.id, t.fecha, t.cupo_maximo, a.nombre AS actividad,
               (SELECT GROUP_CONCAT(u.nombre ORDER BY u.nombre SEPARATOR ', ')
                FROM turno_entrenadores te
                JOIN usuarios u ON u.id = te.empleado_id
                  AND u.estado = 'activo' AND u.eliminado = 0
                WHERE te.turno_id = t.id) AS entrenadores,
               (SELECT COUNT(*) FROM reservas r
                WHERE r.turno_id = t.id AND r.estado = 'confirmada') AS reservas_confirmadas
        FROM turnos t
        JOIN actividades a ON a.id = t.actividad_id AND a.eliminado = 0
        JOIN ubicaciones l ON l.id = a.ubicacion_id AND l.eliminado = 0
        WHERE a.ubicacion_id = ?
          AND EXISTS (
            SELECT 1 FROM turno_entrenadores te
            WHERE te.turno_id = t.id AND te.empleado_id = ?
          )
          AND t.fecha >= DATE_ADD(CURDATE(), INTERVAL 1 DAY)
          AND t.fecha < DATE_ADD(CURDATE(), INTERVAL 8 DAY)
        ORDER BY t.fecha ASC
      `, [ubicacionId, req.usuario.id]),
    ]);

    res.json({
      ubicacion_id: ubicacionId,
      sede: sede?.nombre || null,
      ciudad: sede?.ciudad || null,
      fecha: new Date().toISOString(),
      turnos,
      turnosFuturos,
    });
  } catch (error) {
    console.error('Error al obtener el resumen del empleado:', error);
    res.status(500).json({ error: 'No se pudo obtener el resumen del día' });
  }
};

export const getReservasTurnoEmpleado = async (req, res) => {
  try {
    await expirarReservasVencidas();

    const ubicacionId = await obtenerSedeEmpleado(req, res);
    if (!ubicacionId) return;

    const [reservas] = await db.query(`
      SELECT r.id AS reserva_id, u.id AS socio_id, u.nombre, u.correo_electronico,
             t.fecha, a.nombre AS actividad,
             (t.fecha <= NOW() AND t.fecha > DATE_SUB(NOW(), INTERVAL 1 HOUR))
               AS puede_registrar_asistencia,
             EXISTS (
               SELECT 1 FROM membresias m
               WHERE m.usuario_id = u.id
                 AND m.estado = 'activa'
                 AND m.fecha_inicio <= NOW()
                 AND m.fecha_fin > NOW()
             ) AS membresia_vigente,
             (SELECT MAX(m.fecha_fin) FROM membresias m
              WHERE m.usuario_id = u.id
                AND m.estado = 'activa'
                AND m.fecha_inicio <= NOW()
                AND m.fecha_fin > NOW()) AS membresia_vence,
             asi.id AS asistencia_id, asi.registrado_en
      FROM reservas r
      JOIN turnos t ON t.id = r.turno_id
      JOIN actividades a ON a.id = t.actividad_id AND a.eliminado = 0
      JOIN ubicaciones l ON l.id = a.ubicacion_id AND l.eliminado = 0
      JOIN usuarios u ON u.id = r.usuario_id AND u.rol = 'socio'
      LEFT JOIN asistencias asi ON asi.reserva_id = r.id
      WHERE t.id = ?
        AND a.ubicacion_id = ?
        AND EXISTS (
          SELECT 1 FROM turno_entrenadores te
          WHERE te.turno_id = t.id AND te.empleado_id = ?
        )
        AND DATE(t.fecha) = CURDATE()
        AND t.fecha > DATE_SUB(NOW(), INTERVAL 1 HOUR)
        AND r.estado = 'confirmada'
        AND u.estado = 'activo'
        AND u.eliminado = 0
      ORDER BY u.nombre ASC
    `, [req.params.turnoId, ubicacionId, req.usuario.id]);

    res.json(reservas);
  } catch (error) {
    console.error('Error al obtener la lista del turno:', error);
    res.status(500).json({ error: 'No se pudo obtener la lista del turno' });
  }
};

export const buscarSociosEmpleado = async (req, res) => {
  try {
    const ubicacionId = await obtenerSedeEmpleado(req, res);
    if (!ubicacionId) return;

    const busqueda = req.query.q?.trim();
    if (!busqueda || busqueda.length < 2) {
      return res.status(400).json({ error: 'Escribe al menos dos caracteres para buscar' });
    }

    const termino = `%${busqueda}%`;
    const [socios] = await db.query(`
      SELECT u.id, u.nombre, u.correo_electronico, u.telefono,
             EXISTS (
               SELECT 1 FROM membresias m
               WHERE m.usuario_id = u.id
                 AND m.estado = 'activa'
                 AND m.fecha_inicio <= NOW()
                 AND m.fecha_fin > NOW()
             ) AS membresia_vigente,
             (SELECT MAX(m.fecha_fin) FROM membresias m
              WHERE m.usuario_id = u.id
                AND m.estado = 'activa'
                AND m.fecha_inicio <= NOW()
                AND m.fecha_fin > NOW()) AS membresia_vence
      FROM usuarios u
      WHERE u.rol = 'socio'
        AND u.estado = 'activo'
        AND u.eliminado = 0
        AND u.ubicacion_id = ?
        AND (u.nombre LIKE ? OR u.correo_electronico LIKE ? OR u.telefono LIKE ?)
      ORDER BY u.nombre ASC
      LIMIT 20
    `, [ubicacionId, termino, termino, termino]);

    res.json(socios);
  } catch (error) {
    console.error('Error al buscar socios del empleado:', error);
    res.status(500).json({ error: 'No se pudieron buscar socios' });
  }
};

export const registrarIngresoLibreEmpleado = async (req, res) => {
  try {
    const ubicacionId = await obtenerSedeEmpleado(req, res);
    if (!ubicacionId) return;

    const socioId = Number(req.body?.socio_id);
    if (!Number.isInteger(socioId) || socioId <= 0) {
      return res.status(400).json({ error: 'Debes seleccionar un socio válido' });
    }

    const [result] = await db.query(`
      INSERT INTO ingresos_gimnasio (usuario_id, ubicacion_id, empleado_id)
      SELECT u.id, u.ubicacion_id, ?
      FROM usuarios u
      WHERE u.id = ?
        AND u.rol = 'socio'
        AND u.estado = 'activo'
        AND u.eliminado = 0
        AND u.ubicacion_id = ?
        AND EXISTS (
          SELECT 1 FROM membresias m
          WHERE m.usuario_id = u.id
            AND m.estado = 'activa'
            AND m.fecha_inicio <= NOW()
            AND m.fecha_fin > NOW()
        )
    `, [req.usuario.id, socioId, ubicacionId]);

    if (result.affectedRows === 0) {
      return res.status(409).json({
        error: 'El socio no pertenece a tu sede o no tiene una membresía vigente',
      });
    }

    res.status(201).json({
      id: result.insertId,
      mensaje: 'Ingreso de entrenamiento libre registrado',
    });
  } catch (error) {
    console.error('Error al registrar un ingreso de entrenamiento libre:', error);
    res.status(500).json({ error: 'No se pudo registrar el ingreso' });
  }
};

export const registrarAsistenciaEmpleado = async (req, res) => {
  try {
    await expirarReservasVencidas();

    const ubicacionId = await obtenerSedeEmpleado(req, res);
    if (!ubicacionId) return;

    const [result] = await db.query(`
      INSERT INTO asistencias (reserva_id, empleado_id)
      SELECT r.id, ?
      FROM reservas r
      JOIN turnos t ON t.id = r.turno_id
      JOIN actividades a ON a.id = t.actividad_id AND a.eliminado = 0
      JOIN ubicaciones l ON l.id = a.ubicacion_id AND l.eliminado = 0
      JOIN usuarios u ON u.id = r.usuario_id
      WHERE r.id = ?
        AND r.estado = 'confirmada'
        AND DATE(t.fecha) = CURDATE()
        AND t.fecha <= NOW()
        AND t.fecha > DATE_SUB(NOW(), INTERVAL 1 HOUR)
        AND a.ubicacion_id = ?
        AND EXISTS (
          SELECT 1 FROM turno_entrenadores te
          WHERE te.turno_id = t.id AND te.empleado_id = ?
        )
        AND u.rol = 'socio'
        AND u.estado = 'activo'
        AND u.eliminado = 0
        AND EXISTS (
          SELECT 1 FROM membresias m
          WHERE m.usuario_id = u.id
            AND m.estado = 'activa'
            AND m.fecha_inicio <= NOW()
            AND m.fecha_fin > NOW()
        )
    `, [req.usuario.id, req.params.reservaId, ubicacionId, req.usuario.id]);

    if (result.affectedRows === 0) {
      return res.status(409).json({
        error: 'La reserva no es válida para hoy, está fuera del horario de asistencia, no pertenece a tu sede o el socio no tiene una membresía vigente',
      });
    }

    res.status(201).json({ mensaje: 'Asistencia registrada' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'La asistencia de esta reserva ya fue registrada' });
    }
    console.error('Error al registrar asistencia:', error);
    res.status(500).json({ error: 'No se pudo registrar la asistencia' });
  }
};
