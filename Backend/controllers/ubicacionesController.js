import db from '../configs/database.js';

// Obtener todas las ubicaciones
export const getUbicaciones = async (req, res) => {
  try {
    const soloInactivas = req.query.soloInactivas === 'true';
    const [rows] = await db.query(
      'SELECT * FROM ubicaciones WHERE eliminado = ?',
      [soloInactivas ? 1 : 0]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener ubicaciones:', error);
    res.status(500).json({ error: 'No se pudieron obtener las ubicaciones' });
  }
};

// Crear ubicación
export const crearUbicacion = async (req, res) => {
  try {
    const { nombre, direccion, ciudad, provincia, pais, telefono, email, lat, lng } = req.body;

    if (!nombre || !direccion || !ciudad || !provincia || !pais) {
      return res.status(400).json({ error: 'Nombre, dirección, ciudad, provincia y país son obligatorios' });
    }

    const [result] = await db.query(
      `INSERT INTO ubicaciones (nombre, direccion, ciudad, provincia, pais, telefono, email, lat, lng)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [nombre.trim(), direccion.trim(), ciudad.trim(), provincia.trim(), pais.trim(), telefono || null, email || null, lat || null, lng || null]
    );

    res.json({ mensaje: 'Ubicación creada con éxito', id: result.insertId });
  } catch (error) {
    console.error('Error al crear ubicación:', error);
    res.status(500).json({ error: 'No se pudo crear la ubicación' });
  }
};

// Actualizar ubicación
export const actualizarUbicacion = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, direccion, ciudad, provincia, pais, telefono, email, lat, lng } = req.body;

    if (!nombre || !direccion || !ciudad || !provincia || !pais) {
      return res.status(400).json({ error: 'Nombre, dirección, ciudad, provincia y país son obligatorios' });
    }

    const [ubicaciones] = await db.query(
      'SELECT id FROM ubicaciones WHERE id=? AND eliminado=0',
      [id]
    );
    if (ubicaciones.length === 0) {
      return res.status(404).json({ error: 'Ubicación no encontrada o eliminada' });
    }

    await db.query(
      `UPDATE ubicaciones SET nombre=?, direccion=?, ciudad=?, provincia=?, pais=?, telefono=?, email=?, lat=?, lng=? WHERE id=?`,
      [nombre.trim(), direccion.trim(), ciudad.trim(), provincia.trim(), pais.trim(), telefono || null, email || null, lat || null, lng || null, id]
    );

    res.json({ mensaje: 'Ubicación actualizada con éxito' });
  } catch (error) {
    console.error('Error al actualizar ubicación:', error);
    res.status(500).json({ error: 'No se pudo actualizar la ubicación' });
  }
};

// Borrado lógico
export const eliminarUbicacion = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query(
      'UPDATE ubicaciones SET eliminado=1 WHERE id=? AND eliminado=0',
      [id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Ubicación no encontrada o ya eliminada' });
    }
    res.json({ mensaje: 'Ubicación eliminada lógicamente con éxito' });
  } catch (error) {
    console.error('Error al eliminar ubicación:', error);
    res.status(500).json({ error: 'No se pudo eliminar la ubicación' });
  }
};

export const activarUbicacion = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query(
      'UPDATE ubicaciones SET eliminado=0 WHERE id=? AND eliminado=1',
      [id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Ubicación no encontrada o ya activa' });
    }
    res.json({ mensaje: 'Ubicación activada con éxito' });
  } catch (error) {
    console.error('Error al activar ubicación:', error);
    res.status(500).json({ error: 'No se pudo activar la ubicación' });
  }
};
