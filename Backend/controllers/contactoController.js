import db from '../configs/database.js';
import { enviarEmailConGmailAPI } from '../services/gmail/gmailApiService.js';

export const enviarMensajeContacto = async (req, res) => {
  const { nombre, correo, mensaje, ubicacion_id } = req.body;

  try {
    // Validaciones básicas
    if (!nombre || !correo || !mensaje || !ubicacion_id) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
      return res.status(400).json({ error: 'Correo electrónico inválido' });
    }
    if (mensaje.length < 5) {
      return res.status(400).json({ error: 'El mensaje debe tener al menos 5 caracteres' });
    }

    // Guardar en DB
    await db.query(
      'INSERT INTO mensajes_contacto (nombre, correo, mensaje, ubicacion_id) VALUES (?, ?, ?, ?)',
      [nombre, correo, mensaje, ubicacion_id]
    );

    // Enviar correo
    await enviarEmailConGmailAPI({
      to: process.env.GMAIL_USER,
      subject: `Nuevo mensaje de contacto de ${nombre}`,
      html: `
        <h2>Nuevo mensaje de contacto</h2>
        <p><strong>Nombre:</strong> ${nombre}</p>
        <p><strong>Correo:</strong> ${correo}</p>
        <p><strong>Ubicación ID:</strong> ${ubicacion_id}</p>
        <p><strong>Mensaje:</strong> ${mensaje}</p>
      `
    });

    res.json({ ok: true, message: 'Mensaje enviado y guardado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, message: 'Error en el servidor' });
  }
};

// Listar todos los mensajes
export const getMensajes = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM mensajes_contacto ORDER BY id DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'No se pudieron obtener los mensajes' });
  }
};

// Obtener un mensaje por id
export const getMensajeById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query('SELECT * FROM mensajes_contacto WHERE id=?', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Mensaje no encontrado' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener mensaje' });
  }
};

// Responder/editar respuesta
export const responderMensaje = async (req, res) => {
  try {
    const { id } = req.params;
    const { respuesta } = req.body;

    await db.query('UPDATE mensajes_contacto SET respuesta=?, respondido=NOW() WHERE id=?', [respuesta, id]);

    // enviar correo al usuario
    const [rows] = await db.query('SELECT correo, nombre FROM mensajes_contacto WHERE id=?', [id]);
    const { correo, nombre } = rows[0];

    await enviarEmailConGmailAPI({
      to: correo,
      subject: `Respuesta a tu mensaje`,
      html: `<p>Hola ${nombre},</p><p>${respuesta}</p>`
    });

    res.json({ mensaje: 'Respuesta enviada y guardada' });
  } catch (error) {
    res.status(500).json({ error: 'Error al responder mensaje' });
  }
};

// Eliminar mensaje
export const deleteMensaje = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM mensajes_contacto WHERE id=?', [id]);
    res.json({ mensaje: 'Mensaje eliminado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar mensaje' });
  }
};

// Limpiar bandeja
export const limpiarBandeja = async (req, res) => {
  try {
    await db.query('DELETE FROM mensajes_contacto');
    res.json({ mensaje: 'Bandeja vaciada' });
  } catch (error) {
    res.status(500).json({ error: 'Error al limpiar bandeja' });
  }
};
