import db from '../configs/database.js';
import fs from 'fs/promises';
import path from 'path';

export const getActividadesConTurnos = async (req, res) => {
  try {
    const usuarioUbicacionId = req.usuario.ubicacion_id; // viene del token

    const [rows] = await db.query(`
      SELECT a.id AS actividad_id, a.nombre, a.descripcion, a.foto,
             t.id AS turno_id, t.fecha, t.cupo_maximo,
             (t.cupo_maximo - COUNT(r.id)) AS cupo_disponible
      FROM actividades a
      JOIN turnos t ON a.id = t.actividad_id
      LEFT JOIN reservas r ON r.turno_id = t.id AND r.estado = "confirmada"
      WHERE a.ubicacion_id = ?
      GROUP BY t.id
      ORDER BY t.fecha ASC
    `, [usuarioUbicacionId]);

    res.json(rows);
  } catch (error) {
    console.error('Error al obtener actividades:', error);
    res.status(500).json({ error: 'No se pudieron obtener las actividades' });
  }
};

// Listar todas las actividades
export const getActividades = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM actividades ORDER BY id DESC');
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener actividades:', error);
    res.status(500).json({ error: 'No se pudieron obtener las actividades' });
  }
};

// Obtener actividad por id
export const getActividadById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query('SELECT * FROM actividades WHERE id=?', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Actividad no encontrada' });
    res.json(rows[0]);
  } catch (error) {
    console.error('Error al obtener actividad:', error);
    res.status(500).json({ error: 'No se pudo obtener la actividad' });
  }
};

// Crear actividad
export const createActividad = async (req, res) => {
  try {
    const { nombre, descripcion, ubicacion_id } = req.body;
    const foto = req.file ? `/uploads/${req.file.filename}` : null;

    if (!nombre || !descripcion || !ubicacion_id) {
      return res.status(400).json({ error: 'Nombre, descripción y sede son obligatorios' });
    }

    const [result] = await db.query(
      'INSERT INTO actividades (nombre, descripcion, foto, ubicacion_id) VALUES (?, ?, ?, ?)',
      [nombre, descripcion, foto, ubicacion_id]
    );

    res.json({ mensaje: 'Actividad creada con éxito', id: result.insertId });
  } catch (error) {
    console.error('Error al crear actividad:', error);
    res.status(500).json({ error: 'No se pudo crear la actividad' });
  }
};

// Actualizar actividad
export const updateActividad = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, ubicacion_id } = req.body;
    const nuevaFoto = req.file ? `/uploads/${req.file.filename}` : null;

    if (!nombre || !descripcion || !ubicacion_id) {
      return res.status(400).json({ error: 'Nombre, descripción y sede son obligatorios' });
    }

    const [prev] = await db.query('SELECT foto FROM actividades WHERE id=?', [id]);
    if (prev.length === 0) return res.status(404).json({ error: 'Actividad no encontrada' });

    const fotoAnterior = prev[0].foto;
    if (fotoAnterior && nuevaFoto) {
      try { await fs.unlink(path.join(process.cwd(), fotoAnterior)); } catch (err) { console.error(err); }
    }

    await db.query(
      'UPDATE actividades SET nombre=?, descripcion=?, foto=?, ubicacion_id=? WHERE id=?',
      [nombre, descripcion, nuevaFoto || fotoAnterior, ubicacion_id, id]
    );

    res.json({ mensaje: 'Actividad actualizada con éxito' });
  } catch (error) {
    console.error('Error al actualizar actividad:', error);
    res.status(500).json({ error: 'No se pudo actualizar la actividad' });
  }
};

// Eliminar actividad
export const deleteActividad = async (req, res) => {
  try {
    const { id } = req.params;

    await db.query('DELETE FROM reservas WHERE turno_id IN (SELECT id FROM turnos WHERE actividad_id=?)', [id]);
    await db.query('DELETE FROM turnos WHERE actividad_id=?', [id]);

    const [prev] = await db.query('SELECT foto FROM actividades WHERE id=?', [id]);
    if (prev[0]?.foto) {
      try { await fs.unlink(path.join(process.cwd(), prev[0].foto)); } catch (err) { console.error(err); }
    }

    await db.query('DELETE FROM actividades WHERE id=?', [id]);
    res.json({ mensaje: 'Actividad eliminada con éxito' });
  } catch (error) {
    console.error('Error al eliminar actividad:', error);
    res.status(500).json({ error: 'No se pudo eliminar la actividad' });
  }
};