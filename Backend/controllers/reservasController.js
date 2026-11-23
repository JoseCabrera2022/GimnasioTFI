import db from '../configs/database.js';
import { expirarReservasVencidas } from '../services/reservasService.js';

export const crearReserva = async (req, res) => {
  const { turno_id } = req.body;
  const usuario_id = req.usuario.id;

  try {
    await expirarReservasVencidas();

    if (!turno_id) {
      return res.status(400).json({ error: 'Debes seleccionar un turno' });
    }

    // 0. Validar membresía activa
    const [membresias] = await db.query(
      `SELECT id FROM membresias 
       WHERE usuario_id = ? AND estado = 'activa' 
       AND fecha_fin > NOW()`,
      [usuario_id]
    );
    if (membresias.length === 0) {
      return res.status(403).json({ error: 'No tienes una membresía activa. No puedes reservar actividades.' });
    }

    // 1. Obtener cupo máximo del turno
    const [[turno]] = await db.query(
      `SELECT t.cupo_maximo,
              (t.fecha > NOW()) AS turno_futuro,
              (t.fecha >= DATE_ADD(NOW(), INTERVAL 1 DAY)) AS puede_cancelar
       FROM turnos t
       JOIN actividades a ON a.id = t.actividad_id AND a.eliminado = 0
       JOIN ubicaciones u ON u.id = a.ubicacion_id AND u.eliminado = 0
       WHERE t.id = ?`,
      [turno_id]
    );
    if (!turno) return res.status(404).json({ error: 'Turno no encontrado' });
    if (!Number(turno.turno_futuro)) {
      return res.status(409).json({ error: 'No puedes reservar un turno que ya comenzó' });
    }

    // 2. Contar reservas confirmadas
    const [[{ reservas_confirmadas }]] = await db.query(
      'SELECT COUNT(*) AS reservas_confirmadas FROM reservas WHERE turno_id = ? AND estado = "confirmada"',
      [turno_id]
    );

    // 3. Validar disponibilidad
    if (reservas_confirmadas >= turno.cupo_maximo) {
      return res.status(400).json({ error: 'No hay cupos disponibles' });
    }

    // 4. Validar que el usuario no tenga ya una reserva activa en ese turno
    const [yaReservado] = await db.query(
      'SELECT id FROM reservas WHERE usuario_id = ? AND turno_id = ? AND estado = "confirmada"',
      [usuario_id, turno_id]
    );
    if (yaReservado.length > 0) {
      return res.status(400).json({ error: 'Ya tienes una reserva en esta actividad. Cancélala antes de volver a reservar.' });
    }

    // 5. Insertar reserva
    await db.query(
      'INSERT INTO reservas (usuario_id, turno_id, estado) VALUES (?, ?, "confirmada")',
      [usuario_id, turno_id]
    );

    res.json({
      mensaje: 'Reserva creada con éxito',
      puede_cancelar: Number(turno.puede_cancelar),
    });
  } catch (error) {
    console.error('Error al crear reserva:', error);
    res.status(500).json({ error: 'No se pudo crear la reserva' });
  }
};

// Listar reservas del socio con detalle de actividad y turno
export const getReservasUsuario = async (req, res) => {
  try {
    await expirarReservasVencidas();

    const usuarioId = req.usuario.id;
    const usuarioUbicacionId = req.usuario.ubicacion_id;

    const [rows] = await db.query(`
      SELECT r.id, a.nombre AS actividad, t.fecha,
             CASE WHEN asi.id IS NOT NULL THEN 'asistida' ELSE r.estado END AS estado,
             CASE
               WHEN r.estado = 'confirmada'
                 AND asi.id IS NULL
                 AND t.fecha >= DATE_ADD(NOW(), INTERVAL 1 DAY)
               THEN 1 ELSE 0
             END AS puede_cancelar
      FROM reservas r
      JOIN turnos t ON r.turno_id = t.id
      JOIN actividades a ON t.actividad_id = a.id
      LEFT JOIN asistencias asi ON asi.reserva_id = r.id
      WHERE r.usuario_id = ? AND a.ubicacion_id = ?
      ORDER BY t.fecha DESC
    `, [usuarioId, usuarioUbicacionId]);

    res.json(rows);
  } catch (error) {
    console.error('Error al obtener reservas:', error);
    res.status(500).json({ error: 'No se pudo obtener las reservas' });
  }
};

// Cancelar reserva
export const cancelarReserva = async (req, res) => {
  const { reserva_id } = req.params;

  try {
    await expirarReservasVencidas();

    const [result] = await db.query(`
      UPDATE reservas r
      JOIN turnos t ON t.id = r.turno_id
      LEFT JOIN asistencias a ON a.reserva_id = r.id
      SET r.estado = 'cancelada'
      WHERE r.id = ?
        AND r.usuario_id = ?
        AND r.estado = 'confirmada'
        AND a.id IS NULL
        AND t.fecha >= DATE_ADD(NOW(), INTERVAL 1 DAY)
    `, [reserva_id, req.usuario.id]);

    if (result.affectedRows === 0) {
      const [[reserva]] = await db.query(`
        SELECT r.estado, t.fecha,
               EXISTS (SELECT 1 FROM asistencias a WHERE a.reserva_id = r.id) AS asistida,
               (t.fecha < DATE_ADD(NOW(), INTERVAL 1 DAY)) AS fuera_de_plazo
        FROM reservas r
        JOIN turnos t ON t.id = r.turno_id
        WHERE r.id = ? AND r.usuario_id = ?
      `, [reserva_id, req.usuario.id]);

      if (!reserva) return res.status(404).json({ error: 'Reserva no encontrada' });
      if (reserva.estado === 'expirada') {
        return res.status(409).json({ error: 'La reserva ya expiró y no se puede cancelar' });
      }
      if (reserva.asistida) {
        return res.status(409).json({ error: 'No se puede cancelar una reserva con asistencia registrada' });
      }
      if (reserva.estado !== 'confirmada') {
        return res.status(409).json({ error: 'La reserva ya no está confirmada' });
      }
      if (Number(reserva.fuera_de_plazo)) {
        return res.status(409).json({ error: 'Solo puedes cancelar hasta 24 horas antes del inicio del turno' });
      }
      return res.status(409).json({ error: 'No se pudo cancelar la reserva' });
    }

    res.json({ mensaje: 'Reserva cancelada con éxito' });
  } catch (error) {
    console.error('Error al cancelar reserva:', error);
    res.status(500).json({ error: 'No se pudo cancelar la reserva' });
  }
};
