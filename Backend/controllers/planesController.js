import db from '../configs/database.js';

// Obtener todos los planes y duraciones
export const obtenerPlanes = async (req, res) => {
  try {
    const soloInactivos = req.query.soloInactivos === 'true';
    const [planes] = await db.query('SELECT * FROM planes WHERE eliminado = ?', [soloInactivos ? 1 : 0]);
    const [duraciones] = await db.query('SELECT * FROM duraciones');
    res.json({ planes, duraciones });
  } catch (error) {
    console.error('Error al obtener planes:', error);
    if (error.code === 'ER_BAD_FIELD_ERROR' && error.message.includes('eliminado')) {
      return res.status(500).json({
        error: 'Falta aplicar la migración de borrado lógico en la base de datos. Ejecuta Backend/migrations/20261102_add_soft_delete_planes_ubicaciones_actividades.sql.'
      });
    }
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

    const [planes] = await db.query(
      'SELECT id FROM planes WHERE id=? AND eliminado=0',
      [id]
    );
    if (planes.length === 0) {
      return res.status(404).json({ error: 'Plan no encontrado o eliminado' });
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

// Borrado lógico
export const eliminarPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query(
      'UPDATE planes SET eliminado=1 WHERE id=? AND eliminado=0',
      [id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Plan no encontrado o ya eliminado' });
    }
    res.json({ mensaje: 'Plan eliminado lógicamente con éxito' });
  } catch (error) {
    console.error('Error al eliminar plan:', error);
    res.status(500).json({ error: 'No se pudo eliminar el plan' });
  }
};

export const activarPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query(
      'UPDATE planes SET eliminado=0 WHERE id=? AND eliminado=1',
      [id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Plan no encontrado o ya activo' });
    }
    res.json({ mensaje: 'Plan activado con éxito' });
  } catch (error) {
    console.error('Error al activar plan:', error);
    res.status(500).json({ error: 'No se pudo activar el plan' });
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
