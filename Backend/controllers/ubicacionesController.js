import db from '../configs/database.js';

// Obtener todas las ubicaciones
export const getUbicaciones = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM ubicaciones');
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

// Eliminar ubicación
export const eliminarUbicacion = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM ubicaciones WHERE id=?', [id]);
    res.json({ mensaje: 'Ubicación eliminada con éxito' });
  } catch (error) {
    console.error('Error al eliminar ubicación:', error);
    res.status(500).json({ error: 'No se pudo eliminar la ubicación' });
  }
};
