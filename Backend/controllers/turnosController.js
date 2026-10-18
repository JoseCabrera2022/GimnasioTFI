import db from '../configs/database.js';

// Listar turnos de una actividad
export const getTurnosByActividad = async (req, res) => {
  try {
    const { actividad_id } = req.params;
    const [rows] = await db.query(
      `SELECT t.id, t.actividad_id, t.fecha, t.cupo_maximo,
              (t.cupo_maximo - COUNT(r.id)) AS cupo_disponible
       FROM turnos t
       LEFT JOIN reservas r ON r.turno_id = t.id AND r.estado="confirmada"
       WHERE t.actividad_id=?
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
  try {
    const { actividad_id, fecha, cupo_maximo } = req.body;
    if (!actividad_id || !fecha || !cupo_maximo) {
      return res.status(400).json({ error: 'Actividad, fecha y cupo máximo son obligatorios' });
    }

    const [result] = await db.query(
      'INSERT INTO turnos (actividad_id, fecha, cupo_maximo) VALUES (?, ?, ?)',
      [actividad_id, fecha, cupo_maximo]
    );

    res.json({ mensaje: 'Turno creado con éxito', id: result.insertId });
  } catch (error) {
    console.error('Error al crear turno:', error);
    res.status(500).json({ error: 'No se pudo crear el turno' });
  }
};

// Actualizar turno
export const updateTurno = async (req, res) => {
  try {
    const { id } = req.params;
    const { fecha, cupo_maximo } = req.body;
    if (!fecha || !cupo_maximo) {
      return res.status(400).json({ error: 'Fecha y cupo máximo son obligatorios' });
    }

    await db.query('UPDATE turnos SET fecha=?, cupo_maximo=? WHERE id=?', [fecha, cupo_maximo, id]);
    res.json({ mensaje: 'Turno actualizado con éxito' });
  } catch (error) {
    console.error('Error al actualizar turno:', error);
    res.status(500).json({ error: 'No se pudo actualizar el turno' });
  }
};

// Eliminar turno
export const deleteTurno = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM reservas WHERE turno_id=?', [id]);
    await db.query('DELETE FROM turnos WHERE id=?', [id]);
    res.json({ mensaje: 'Turno eliminado con éxito' });
  } catch (error) {
    console.error('Error al eliminar turno:', error);
    res.status(500).json({ error: 'No se pudo eliminar el turno' });
  }
};
