import db from '../configs/database.js';

// Obtener todos los planes y duraciones
export const obtenerPlanes = async (req, res) => {
  try {
    const [planes] = await db.query('SELECT * FROM planes');
    const [duraciones] = await db.query('SELECT * FROM duraciones');
    res.json({ planes, duraciones });
  } catch (error) {
    console.error('Error al obtener planes:', error);
    res.status(500).json({ error: 'No se pudieron obtener los planes.' });
  }
};

// Crear plan
export const crearPlan = async (req, res) => {
  try {
    const { nombre, tipo, precio, descripcion } = req.body;

    if (!nombre || !tipo || !precio) {
      return res.status(400).json({ error: 'Nombre, tipo y precio son obligatorios' });
    }
    if (precio <= 0) {
      return res.status(400).json({ error: 'El precio debe ser mayor a 0' });
    }

    const [result] = await db.query(
      'INSERT INTO planes (nombre, tipo, precio, descripcion) VALUES (?, ?, ?, ?)',
      [nombre.trim(), tipo.trim(), precio, descripcion?.trim() || null]
    );
    res.json({ mensaje: 'Plan creado con éxito', id: result.insertId });
  } catch (error) {
    res.status(500).json({ error: 'No se pudo crear el plan' });
  }
};

// Actualizar plan
export const actualizarPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, tipo, precio, descripcion } = req.body;

    if (!nombre || !tipo || !precio) {
      return res.status(400).json({ error: 'Nombre, tipo y precio son obligatorios' });
    }
    if (precio <= 0) {
      return res.status(400).json({ error: 'El precio debe ser mayor a 0' });
    }

    await db.query(
      'UPDATE planes SET nombre=?, tipo=?, precio=?, descripcion=? WHERE id=?',
      [nombre.trim(), tipo.trim(), precio, descripcion?.trim() || null, id]
    );
    res.json({ mensaje: 'Plan actualizado con éxito' });
  } catch (error) {
    res.status(500).json({ error: 'No se pudo actualizar el plan' });
  }
};

// Eliminar plan
export const eliminarPlan = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM planes WHERE id=?', [id]);
    res.json({ mensaje: 'Plan eliminado con éxito' });
  } catch (error) {
    res.status(500).json({ error: 'No se pudo eliminar el plan' });
  }
};

// CRUD de duraciones
// Crear duración
export const crearDuracion = async (req, res) => {
  try {
    const { nombre, dias, descuento } = req.body;

    if (!nombre || !dias) {
      return res.status(400).json({ error: 'Nombre y días son obligatorios' });
    }
    if (dias <= 0) {
      return res.status(400).json({ error: 'Los días deben ser mayores a 0' });
    }
    if (descuento < 0 || descuento > 1) {
      return res.status(400).json({ error: 'El descuento debe estar entre 0.0 y 1.0' });
    }

    await db.query(
      'INSERT INTO duraciones (nombre, dias, descuento) VALUES (?, ?, ?)',
      [nombre.trim(), dias, descuento || 0]
    );
    res.json({ mensaje: 'Duración creada con éxito' });
  } catch (error) {
    res.status(500).json({ error: 'No se pudo crear la duración' });
  }
};

// Actualizar duración
export const actualizarDuracion = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, dias, descuento } = req.body;

    if (!nombre || !dias) {
      return res.status(400).json({ error: 'Nombre y días son obligatorios' });
    }
    if (dias <= 0) {
      return res.status(400).json({ error: 'Los días deben ser mayores a 0' });
    }
    if (descuento < 0 || descuento > 1) {
      return res.status(400).json({ error: 'El descuento debe estar entre 0.0 y 1.0' });
    }

    await db.query(
      'UPDATE duraciones SET nombre=?, dias=?, descuento=? WHERE id=?',
      [nombre.trim(), dias, descuento || 0, id]
    );
    res.json({ mensaje: 'Duración actualizada con éxito' });
  } catch (error) {
    res.status(500).json({ error: 'No se pudo actualizar la duración' });
  }
};

export const eliminarDuracion = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM duraciones WHERE id=?', [id]);
    res.json({ mensaje: 'Duración eliminada con éxito' });
  } catch (error) {
    res.status(500).json({ error: 'No se pudo eliminar la duración' });
  }
};

