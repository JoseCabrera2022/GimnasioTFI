import jwt from 'jsonwebtoken';
import db from '../configs/database.js';
import fs from 'fs/promises';
import path from 'path';

export const getPerfil = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, nombre, correo_electronico, telefono, rol, foto, ubicacion_id FROM usuarios WHERE id=?',
      [req.usuario.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Error en getPerfil:', error);
    res.status(500).json({ error: 'No se pudo obtener el perfil' });
  }
};

export const updatePerfil = async (req, res) => {
  try {
    const { nombre, correo_electronico, telefono, ubicacion_id } = req.body;
    const nuevaFoto = req.file ? `/uploads/${req.file.filename}` : null;

    // Validaciones básicas
    if (!nombre || !correo_electronico || !ubicacion_id) {
      return res.status(400).json({ error: 'Nombre, correo y sede son obligatorios' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo_electronico)) {
      return res.status(400).json({ error: 'Correo electrónico inválido' });
    }
    if (telefono && !/^\d{7,15}$/.test(telefono)) {
      return res.status(400).json({ error: 'Teléfono inválido' });
    }

    // Buscar foto anterior
    const [rows] = await db.query('SELECT foto FROM usuarios WHERE id=?', [req.usuario.id]);
    const fotoAnterior = rows[0]?.foto;

    if (fotoAnterior && nuevaFoto) {
      const rutaAnterior = path.join(process.cwd(), fotoAnterior);
      try {
        await fs.unlink(rutaAnterior);
      } catch (err) {
        console.error('No se pudo borrar la foto anterior:', err);
      }
    }

    // Verificar si el correo ya existe en otro usuario
    const [existe] = await db.query(
      'SELECT id FROM usuarios WHERE correo_electronico = ? AND id <> ?',
      [correo_electronico, req.usuario.id]
    );
    if (existe.length > 0) {
      return res.status(400).json({ error: 'El correo ya está registrado por otro usuario' });
    }

    // Actualizar BD
    await db.query(
      'UPDATE usuarios SET nombre=?, correo_electronico=?, telefono=?, foto=?, ubicacion_id=? WHERE id=?',
      [nombre, correo_electronico, telefono, nuevaFoto || fotoAnterior, ubicacion_id, req.usuario.id]
    );

    // Obtener perfil actualizado
    const [updated] = await db.query(
      'SELECT id, nombre, correo_electronico, telefono, rol, foto, ubicacion_id FROM usuarios WHERE id=?',
      [req.usuario.id]
    );

    // 🔹 Generar nuevo token con ubicacion_id actualizado
    const token = jwt.sign(
      {
        id: updated[0].id,
        correo_electronico: updated[0].correo_electronico,
        rol: updated[0].rol,
        telefono: updated[0].telefono,
        ubicacion_id: updated[0].ubicacion_id
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ usuario: updated[0], token });
  } catch (error) {
    console.error('Error en updatePerfil:', error);
    res.status(500).json({ error: 'No se pudo actualizar el perfil' });
  }
};