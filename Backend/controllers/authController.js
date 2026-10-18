import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import db from '../configs/database.js';
import { enviarEmailConGmailAPI } from '../services/gmail/gmailApiService.js';

const URL_FRONTEND = process.env.FRONTEND_URL || 'http://localhost:5173';

const obtenerVersionPassword = (hash) =>
  crypto.createHash('sha256').update(hash).digest('hex');

export const registrarUsuario = async (req, res) => {
  try {
    const { nombre, correo_electronico, password, telefono, ubicacion_id } = req.body;

    // Validaciones básicas
    if (!nombre || !correo_electronico || !password || !telefono || !ubicacion_id) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo_electronico)) {
      return res.status(400).json({ error: 'Correo electrónico inválido' });
    }
    if (password.length < 3) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 3 caracteres' });
    }
    if (!/^\d{7,15}$/.test(telefono)) {
      return res.status(400).json({ error: 'Teléfono inválido' });
    }

    // Verificar si el correo ya existe
    const [existe] = await db.query(
      'SELECT id FROM usuarios WHERE correo_electronico = ?',
      [correo_electronico]
    );
    if (existe.length > 0) {
      return res.status(400).json({ error: 'El correo ya está registrado' });
    }

    // Hash de contraseña
    const hash = await bcrypt.hash(password, 10);

    const [result] = await db.query(
      'INSERT INTO usuarios (nombre, correo_electronico, contraseña_hash, telefono, ubicacion_id) VALUES (?, ?, ?, ?, ?)',
      [nombre, correo_electronico, hash, telefono, ubicacion_id]
    );

    // Obtener usuario recién creado
    const [rows] = await db.query('SELECT id, nombre, correo_electronico, rol, telefono, ubicacion_id, estado FROM usuarios WHERE id=?', [result.insertId]);
    const nuevoUsuario = rows[0];

    const token = jwt.sign(
      {
        id: nuevoUsuario.id,
        correo_electronico: nuevoUsuario.correo_electronico,
        rol: nuevoUsuario.rol,
        telefono: nuevoUsuario.telefono,
        ubicacion_id: nuevoUsuario.ubicacion_id,
        estado: nuevoUsuario.estado
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ usuario: nuevoUsuario, token });

  } catch (error) {
    console.error('Error al registrar usuario:', error);
    res.status(500).json({ error: 'No se pudo registrar el usuario' });
  }
};

export const loginUsuario = async (req, res) => {
  try {
    const { correo_electronico, password } = req.body;

    if (!correo_electronico || !password) {
      return res.status(400).json({ error: 'Correo y contraseña son obligatorios' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo_electronico)) {
      return res.status(400).json({ error: 'Correo electrónico inválido' });
    }
    if (password.length < 3) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 3 caracteres' });
    }

    const [rows] = await db.query(
      'SELECT * FROM usuarios WHERE correo_electronico = ? AND eliminado = 0',
      [correo_electronico]
    );
    const usuario = rows[0];

    if (!usuario) return res.status(401).json({ error: 'Usuario no encontrado' });

    const valido = await bcrypt.compare(password, usuario.contraseña_hash);
    if (!valido) return res.status(401).json({ error: 'Contraseña incorrecta' });

    // 🔹 incluir ubicacion_id en el token
    const token = jwt.sign(
      { 
        id: usuario.id, 
        correo_electronico: usuario.correo_electronico, 
        rol: usuario.rol, 
        telefono: usuario.telefono,
        ubicacion_id: usuario.ubicacion_id
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      usuario: { 
        id: usuario.id, 
        nombre: usuario.nombre, 
        correo_electronico: usuario.correo_electronico, 
        rol: usuario.rol, 
        telefono: usuario.telefono,
        ubicacion_id: usuario.ubicacion_id,
        estado: usuario.estado
      },
      token
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'No se pudo iniciar sesión' });
  }
};

export const solicitarRecuperacionPassword = async (req, res) => {
  const mensaje = 'Si el correo está registrado, recibirás un enlace para restablecer tu contraseña.';

  try {
    const correo_electronico = req.body.correo_electronico?.trim().toLowerCase();

    if (!correo_electronico || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo_electronico)) {
      return res.status(400).json({ error: 'Correo electrónico inválido' });
    }

    const [rows] = await db.query(
      'SELECT id, nombre, correo_electronico, contraseña_hash FROM usuarios WHERE correo_electronico = ? AND eliminado = 0',
      [correo_electronico]
    );
    const usuario = rows[0];

    if (usuario) {
      const token = jwt.sign(
        {
          id: usuario.id,
          tipo: 'recuperacion-password',
          version: obtenerVersionPassword(usuario.contraseña_hash)
        },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
      );
      const enlace = `${URL_FRONTEND}/restablecer-contrasena?token=${encodeURIComponent(token)}`;

      await enviarEmailConGmailAPI({
        to: usuario.correo_electronico,
        subject: 'Restablecer contraseña - Gimnasio TFI',
        html: `
          <h2>Hola, ${usuario.nombre}</h2>
          <p>Recibimos una solicitud para restablecer tu contraseña.</p>
          <p>El enlace es válido durante 15 minutos:</p>
          <p><a href="${enlace}">Restablecer mi contraseña</a></p>
          <p>Si no realizaste esta solicitud, puedes ignorar este correo.</p>
        `
      });
    }

    return res.json({ mensaje });
  } catch (error) {
    console.error('Error al solicitar recuperación de contraseña:', error);

    if (error.response?.data?.error === 'invalid_grant') {
      return res.status(503).json({
        error: 'El servicio de correo necesita volver a autorizarse. Abre la ruta /auth del backend.'
      });
    }

    return res.status(500).json({ error: 'No se pudo procesar la solicitud' });
  }
};

export const restablecerPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password || password.length < 3) {
      return res.status(400).json({ error: 'El token y una contraseña de al menos 3 caracteres son obligatorios' });
    }

    const datos = jwt.verify(token, process.env.JWT_SECRET);
    if (datos.tipo !== 'recuperacion-password') {
      return res.status(400).json({ error: 'Token de recuperación inválido' });
    }

    const [rows] = await db.query(
      'SELECT id, contraseña_hash FROM usuarios WHERE id = ?',
      [datos.id]
    );
    const usuario = rows[0];

    if (!usuario || obtenerVersionPassword(usuario.contraseña_hash) !== datos.version) {
      return res.status(400).json({ error: 'El enlace de recuperación ya no es válido' });
    }

    const hash = await bcrypt.hash(password, 10);
    await db.query('UPDATE usuarios SET contraseña_hash = ? WHERE id = ?', [hash, usuario.id]);

    return res.json({ mensaje: 'Contraseña actualizada correctamente' });
  } catch (error) {
    if (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError') {
      return res.status(400).json({ error: 'El enlace de recuperación no es válido o expiró' });
    }

    console.error('Error al restablecer contraseña:', error);
    return res.status(500).json({ error: 'No se pudo restablecer la contraseña' });
  }
};
