import db from '../configs/database.js';

export const crearReserva = async (req, res) => {
  const { turno_id } = req.body;
  const usuario_id = req.usuario.id;

  try {
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
      'SELECT cupo_maximo FROM turnos WHERE id = ?',
      [turno_id]
    );
    if (!turno) return res.status(404).json({ error: 'Turno no encontrado' });

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

    res.json({ mensaje: 'Reserva creada con éxito' });
  } catch (error) {
    console.error('Error al crear reserva:', error);
    res.status(500).json({ error: 'No se pudo crear la reserva' });
  }
};

// Listar reservas del socio con detalle de actividad y turno
export const getReservasUsuario = async (req, res) => {
  try {
    const usuarioId = req.usuario.id;
    const usuarioUbicacionId = req.usuario.ubicacion_id;

    const [rows] = await db.query(`
      SELECT r.id, a.nombre AS actividad, t.fecha, r.estado
      FROM reservas r
      JOIN turnos t ON r.turno_id = t.id
      JOIN actividades a ON t.actividad_id = a.id
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
    // 1. Verificar que exista
    const [[reserva]] = await db.query(
      'SELECT id FROM reservas WHERE id = ?',
      [reserva_id]
    );
    if (!reserva) return res.status(404).json({ error: 'Reserva no encontrada' });

    // 2. Actualizar estado
    await db.query(
      'UPDATE reservas SET estado = "cancelada" WHERE id = ?',
      [reserva_id]
    );

    res.json({ mensaje: 'Reserva cancelada con éxito' });
  } catch (error) {
    console.error('Error al cancelar reserva:', error);
    res.status(500).json({ error: 'No se pudo cancelar la reserva' });
  }
};
