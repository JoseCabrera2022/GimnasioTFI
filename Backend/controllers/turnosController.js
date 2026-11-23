import db from '../configs/database.js';

const parseEntrenadores = (value) => {
  if (value === undefined) return undefined;
  if (!Array.isArray(value)) return null;

  const ids = value.map(Number);
  if (
    ids.some((id) => !Number.isInteger(id) || id <= 0)
    || new Set(ids).size !== ids.length
  ) {
    return null;
  }
  return ids;
};

const validarEntrenadores = async (connection, entrenadorIds, ubicacionId, fecha, turnoId = null) => {
  if (entrenadorIds.length === 0) return null;

  const [empleados] = await connection.query(`
    SELECT id
    FROM usuarios
    WHERE id IN (?)
      AND rol = 'empleado'
      AND estado = 'activo'
      AND eliminado = 0
      AND ubicacion_id = ?
    ORDER BY id
    FOR UPDATE
  `, [entrenadorIds, ubicacionId]);

  if (empleados.length !== entrenadorIds.length) {
    return {
      status: 400,
      error: 'Todos los entrenadores deben ser empleados activos de la misma sede',
    };
  }

  const excluirTurno = turnoId === null ? '' : 'AND t.id <> ?';
  const parametros = [entrenadorIds, fecha, fecha];
  if (turnoId !== null) parametros.push(turnoId);

  const [superposiciones] = await connection.query(`
    SELECT DISTINCT u.nombre
    FROM turno_entrenadores te
    JOIN turnos t ON t.id = te.turno_id
    JOIN usuarios u ON u.id = te.empleado_id
    WHERE te.empleado_id IN (?)
      AND t.fecha < DATE_ADD(?, INTERVAL 2 HOUR)
      AND DATE_ADD(t.fecha, INTERVAL 2 HOUR) > ?
      ${excluirTurno}
  `, parametros);

  if (superposiciones.length > 0) {
    const nombres = superposiciones.map((empleado) => empleado.nombre).join(', ');
    return {
      status: 409,
      error: `Estos entrenadores ya tienen otro turno que se superpone con el bloque de dos horas: ${nombres}`,
    };
  }

  return null;
};

const insertarEntrenadores = async (connection, turnoId, entrenadorIds) => {
  if (entrenadorIds.length === 0) return;
  await connection.query(
    'INSERT INTO turno_entrenadores (turno_id, empleado_id) VALUES ?',
    [entrenadorIds.map((empleadoId) => [turnoId, empleadoId])]
  );
};

// Listar turnos de una actividad
export const getTurnosByActividad = async (req, res) => {
  try {
    const { actividad_id } = req.params;
    const [rows] = await db.query(
      `SELECT t.id, t.actividad_id, t.fecha, t.cupo_maximo,
              (t.cupo_maximo - COUNT(DISTINCT r.id)) AS cupo_disponible,
              GROUP_CONCAT(DISTINCT te.empleado_id ORDER BY te.empleado_id) AS entrenador_ids,
              GROUP_CONCAT(DISTINCT e.nombre ORDER BY e.nombre SEPARATOR ', ') AS entrenadores
       FROM turnos t
       JOIN actividades a ON a.id = t.actividad_id AND a.eliminado = 0
       JOIN ubicaciones u ON u.id = a.ubicacion_id AND u.eliminado = 0
       LEFT JOIN reservas r ON r.turno_id = t.id AND r.estado = 'confirmada'
       LEFT JOIN turno_entrenadores te ON te.turno_id = t.id
       LEFT JOIN usuarios e ON e.id = te.empleado_id
       WHERE t.actividad_id = ?
       GROUP BY t.id
       ORDER BY t.fecha ASC`,
      [actividad_id]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener turnos:', error);
    res.status(500).json({ error: 'No se pudieron obtener los turnos' });
  }
};

// Crear turno
export const createTurno = async (req, res) => {
  const { actividad_id, fecha, cupo_maximo } = req.body;
  const entrenadorIds = req.body.entrenadores === undefined
    ? []
    : parseEntrenadores(req.body.entrenadores);
  const cupo = Number(cupo_maximo);

  if (!actividad_id || !fecha || !Number.isInteger(cupo) || cupo < 1) {
    return res.status(400).json({ error: 'Actividad, fecha y cupo máximo válido son obligatorios' });
  }
  if (entrenadorIds === null) {
    return res.status(400).json({ error: 'La lista de entrenadores no es válida' });
  }

  let connection;
  let transactionStarted = false;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction();
    transactionStarted = true;

    const [[actividad]] = await connection.query(`
      SELECT a.id, a.ubicacion_id
      FROM actividades a
      JOIN ubicaciones u ON u.id = a.ubicacion_id AND u.eliminado = 0
      WHERE a.id = ? AND a.eliminado = 0
      FOR UPDATE
    `, [actividad_id]);

    if (!actividad) {
      await connection.rollback();
      transactionStarted = false;
      return res.status(400).json({ error: 'La actividad no existe o está eliminada' });
    }

    const errorEntrenadores = await validarEntrenadores(
      connection,
      entrenadorIds,
      actividad.ubicacion_id,
      fecha
    );
    if (errorEntrenadores) {
      await connection.rollback();
      transactionStarted = false;
      return res.status(errorEntrenadores.status).json({ error: errorEntrenadores.error });
    }

    const [result] = await connection.query(
      'INSERT INTO turnos (actividad_id, fecha, cupo_maximo) VALUES (?, ?, ?)',
      [actividad_id, fecha, cupo]
    );
    await insertarEntrenadores(connection, result.insertId, entrenadorIds);
    await connection.commit();
    transactionStarted = false;

    res.json({ mensaje: 'Turno creado con éxito', id: result.insertId });
  } catch (error) {
    if (transactionStarted) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error('Error al revertir la creación del turno:', rollbackError);
      }
    }
    console.error('Error al crear turno:', error);
    res.status(500).json({ error: 'No se pudo crear el turno' });
  } finally {
    if (connection) connection.release();
  }
};

// Actualizar turno
export const updateTurno = async (req, res) => {
  const { id } = req.params;
  const { fecha, cupo_maximo } = req.body;
  const entrenadorIds = parseEntrenadores(req.body.entrenadores);
  const cupo = Number(cupo_maximo);

  if (!fecha || !Number.isInteger(cupo) || cupo < 1) {
    return res.status(400).json({ error: 'Fecha y cupo máximo válido son obligatorios' });
  }
  if (entrenadorIds === null) {
    return res.status(400).json({ error: 'La lista de entrenadores no es válida' });
  }

  let connection;
  let transactionStarted = false;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction();
    transactionStarted = true;

    const [[turno]] = await connection.query(`
      SELECT t.id, a.ubicacion_id
      FROM turnos t
      JOIN actividades a ON a.id = t.actividad_id
      WHERE t.id = ?
      FOR UPDATE
    `, [id]);

    if (!turno) {
      await connection.rollback();
      transactionStarted = false;
      return res.status(404).json({ error: 'Turno no encontrado' });
    }

    const errorEntrenadores = entrenadorIds === undefined
      ? null
      : await validarEntrenadores(connection, entrenadorIds, turno.ubicacion_id, fecha, turno.id);
    if (errorEntrenadores) {
      await connection.rollback();
      transactionStarted = false;
      return res.status(errorEntrenadores.status).json({ error: errorEntrenadores.error });
    }

    await connection.query(
      'UPDATE turnos SET fecha = ?, cupo_maximo = ? WHERE id = ?',
      [fecha, cupo, id]
    );
    if (entrenadorIds !== undefined) {
      await connection.query('DELETE FROM turno_entrenadores WHERE turno_id = ?', [id]);
      await insertarEntrenadores(connection, id, entrenadorIds);
    }
    await connection.commit();
    transactionStarted = false;

    res.json({ mensaje: 'Turno actualizado con éxito' });
  } catch (error) {
    if (transactionStarted) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error('Error al revertir la actualización del turno:', rollbackError);
      }
    }
    console.error('Error al actualizar turno:', error);
    res.status(500).json({ error: 'No se pudo actualizar el turno' });
  } finally {
    if (connection) connection.release();
  }
};

// Eliminar turno
export const deleteTurno = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM reservas WHERE turno_id = ?', [id]);
    await db.query('DELETE FROM turnos WHERE id = ?', [id]);
    res.json({ mensaje: 'Turno eliminado con éxito' });
  } catch (error) {
    console.error('Error al eliminar turno:', error);
    res.status(500).json({ error: 'No se pudo eliminar el turno' });
  }
};
