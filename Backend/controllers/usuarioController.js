import db from '../configs/database.js';
import fs from 'fs/promises';
import path from 'path';

// Listar todos los usuarios
export const getUsuarios = async (req, res) => {
  try {
    const incluirEliminados = req.query.incluirEliminados === 'true';
    const [rows] = await db.query(
      `SELECT id, nombre, correo_electronico, rol, estado, telefono, ubicacion_id, creado_en, actualizado_en, eliminado
       FROM usuarios${incluirEliminados ? '' : ' WHERE eliminado = 0'}`
    );
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ error: 'No se pudieron obtener los usuarios' });
  }
};

export const getUsuarioById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query(
      'SELECT id, nombre, correo_electronico, telefono, rol, foto, ubicacion_id, estado FROM usuarios WHERE id=? AND eliminado=0',
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    res.status(500).json({ error: 'No se pudo obtener el usuario' });
  }
};

// Crear usuario (solo admin)
export const createUsuario = async (req, res) => {
  try {
    const { nombre, correo_electronico, telefono, rol, estado, ubicacion_id, password } = req.body;

    // Validaciones básicas
    if (!nombre || !correo_electronico || !ubicacion_id || !password) {
      return res.status(400).json({ error: 'Nombre, correo, contraseña y sede son obligatorios' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo_electronico)) {
      return res.status(400).json({ error: 'Correo electrónico inválido' });
    }
    if (password.length < 3) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 3 caracteres' });
    }
    if (telefono && !/^\d{7,15}$/.test(telefono)) {
      return res.status(400).json({ error: 'Teléfono inválido' });
    }
    if (rol && !['socio','empleado','admin'].includes(rol)) {
      return res.status(400).json({ error: 'Rol inválido' });
    }
    if (estado && !['activo','inactivo'].includes(estado)) {
      return res.status(400).json({ error: 'Estado inválido' });
    }

    // 🔹 Verificar si el correo ya existe
    const [rows] = await db.query(
      'SELECT id FROM usuarios WHERE correo_electronico = ?',
      [correo_electronico]
    );
    if (rows.length > 0) {
      return res.status(400).json({ error: 'El correo ya está registrado' });
    }

    // Hash de contraseña
    const bcrypt = await import('bcrypt');
    const hash = await bcrypt.hash(password, 10);

    const [result] = await db.query(
      'INSERT INTO usuarios (nombre, correo_electronico, contraseña_hash, telefono, rol, estado, ubicacion_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [nombre, correo_electronico, hash, telefono || null, rol || 'socio', estado || 'activo', ubicacion_id]
    );

    res.json({ mensaje: 'Usuario creado con éxito', id: result.insertId });
  } catch (error) {
    console.error('Error al crear usuario:', error);
    res.status(500).json({ error: 'No se pudo crear el usuario' });
  }
};

// Actualizar usuario
export const updateUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, correo_electronico, telefono, rol, estado, ubicacion_id } = req.body;
    const nuevaFoto = req.file ? `/uploads/${req.file.filename}` : null;

    // Validaciones
    if (!nombre || !correo_electronico || !ubicacion_id) {
      return res.status(400).json({ error: 'Nombre, correo y sede son obligatorios' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo_electronico)) {
      return res.status(400).json({ error: 'Correo electrónico inválido' });
    }
    if (telefono && !/^\d{7,15}$/.test(telefono)) {
      return res.status(400).json({ error: 'Teléfono inválido' });
    }
    if (rol && !['socio','empleado','admin'].includes(rol)) {
      return res.status(400).json({ error: 'Rol inválido' });
    }
    if (estado && !['activo','inactivo'].includes(estado)) {
      return res.status(400).json({ error: 'Estado inválido' });
    }

    // Verificar si el correo ya existe
    const [existe] = await db.query(
      'SELECT id FROM usuarios WHERE correo_electronico = ? AND id <> ?',
      [correo_electronico, id]
    );
    if (existe.length > 0) {
      return res.status(400).json({ error: 'El correo ya está registrado por otro usuario' });
    }

    // Buscar foto anterior
    const [rows] = await db.query('SELECT foto FROM usuarios WHERE id=?', [id]);
    const fotoAnterior = rows[0]?.foto;

    if (fotoAnterior && nuevaFoto) {
      const rutaAnterior = path.join(process.cwd(), fotoAnterior);
      try { await fs.unlink(rutaAnterior); } catch (err) { console.error(err); }
    }

    await db.query(
      'UPDATE usuarios SET nombre=?, correo_electronico=?, telefono=?, rol=?, estado=?, ubicacion_id=?, foto=? WHERE id=?',
      [nombre, correo_electronico, telefono || null, rol, estado, ubicacion_id, nuevaFoto || fotoAnterior, id]
    );

    res.json({ mensaje: 'Usuario actualizado con éxito' });
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({ error: 'No se pudo actualizar el usuario' });
  }
};

// Borrado lógico
export const deleteUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query(
      'UPDATE usuarios SET eliminado=1 WHERE id=? AND eliminado=0',
      [id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado o ya eliminado' });
    }
    res.json({ mensaje: 'Usuario eliminado lógicamente con éxito' });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({ error: 'No se pudo eliminar el usuario' });
  }
};

// Borrado físico definitivo
export const deleteUsuarioDefinitivo = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query('DELETE FROM usuarios WHERE id=?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json({ mensaje: 'Usuario borrado definitivamente' });
  } catch (error) {
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(409).json({
        error: 'No se pudo completar el borrado en cascada por registros relacionados'
      });
    }
    console.error('Error al borrar definitivamente el usuario:', error);
    res.status(500).json({ error: 'No se pudo borrar definitivamente el usuario' });
  }
};
