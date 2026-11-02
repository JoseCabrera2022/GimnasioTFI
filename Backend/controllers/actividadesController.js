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
      JOIN ubicaciones u ON u.id = a.ubicacion_id AND u.eliminado = 0
      LEFT JOIN reservas r ON r.turno_id = t.id AND r.estado = "confirmada"
      WHERE a.ubicacion_id = ? AND a.eliminado = 0
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
    const soloInactivas = req.query.soloInactivas === 'true';
    const [rows] = await db.query(
      `SELECT a.* FROM actividades a
       LEFT JOIN ubicaciones u ON u.id = a.ubicacion_id
       WHERE a.eliminado = ?
       ${soloInactivas ? '' : 'AND (u.id IS NULL OR u.eliminado = 0)'}
       ORDER BY a.id DESC`,
      [soloInactivas ? 1 : 0]
    );
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
    const [rows] = await db.query(
      `SELECT a.* FROM actividades a
       LEFT JOIN ubicaciones u ON u.id = a.ubicacion_id
       WHERE a.id=? AND a.eliminado=0 AND (u.id IS NULL OR u.eliminado=0)`,
      [id]
    );
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

    const [ubicaciones] = await db.query(
      'SELECT id FROM ubicaciones WHERE id=? AND eliminado=0',
      [ubicacion_id]
    );
    if (ubicaciones.length === 0) {
      return res.status(400).json({ error: 'La sede no existe o está eliminada' });
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

    const [prev] = await db.query(
      'SELECT foto FROM actividades WHERE id=? AND eliminado=0',
      [id]
    );
    if (prev.length === 0) return res.status(404).json({ error: 'Actividad no encontrada' });

    const [ubicaciones] = await db.query(
      'SELECT id FROM ubicaciones WHERE id=? AND eliminado=0',
      [ubicacion_id]
    );
    if (ubicaciones.length === 0) {
      return res.status(400).json({ error: 'La sede no existe o está eliminada' });
    }

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

// Borrado lógico; se conservan turnos, reservas y la foto asociada.
export const deleteActividad = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query(
      'UPDATE actividades SET eliminado=1 WHERE id=? AND eliminado=0',
      [id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Actividad no encontrada o ya eliminada' });
    }
    res.json({ mensaje: 'Actividad eliminada lógicamente con éxito' });
  } catch (error) {
    console.error('Error al eliminar actividad:', error);
    res.status(500).json({ error: 'No se pudo eliminar la actividad' });
  }
};

export const activarActividad = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query(
      `UPDATE actividades SET eliminado=0
       WHERE id=? AND eliminado=1
       AND EXISTS (
         SELECT 1 FROM ubicaciones u
         WHERE u.id = actividades.ubicacion_id AND u.eliminado=0
       )`,
      [id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({
        error: 'Actividad no encontrada, ya activa o vinculada a una ubicación inactiva'
      });
    }
    res.json({ mensaje: 'Actividad activada con éxito' });
  } catch (error) {
    console.error('Error al activar actividad:', error);
    res.status(500).json({ error: 'No se pudo activar la actividad' });
  }
};