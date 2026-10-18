// controllers/pagosController.js
import { crearPreferenciaMP } from '../services/mercadoPago/preferenceService.js';
import { obtenerPago } from '../services/mercadoPago/paymentService.js';
import { enviarConfirmacionPago } from '../services/gmail/emailService.js';
import { activarMembresia } from '../services/membresiaService.js';
import db from '../configs/database.js';

export const crearPreferencia = async (req, res) => {
  try {
    const { usuario_id } = req.body;

    // 🔹 Validar si ya tiene una membresía activa
    const [rows] = await db.query(
      `SELECT id FROM membresias 
       WHERE usuario_id = ? AND estado = 'activa' 
       AND fecha_fin > NOW()`,
      [usuario_id]
    );

    if (rows.length > 0) {
      return res.status(400).json({ 
        error: 'Ya tienes una membresía activa. No puedes comprar otro plan hasta que venza.' 
      });
    }

    // 🔹 Si no tiene activa, crear preferencia normalmente
    const response = await crearPreferenciaMP(req.body);
    res.json({ init_point: response.init_point });
  } catch (error) {
    console.error('Error al crear preferencia:', error);
    res.status(500).json({ error: error.message });
  }
};


export const verificarPago = async (req, res) => {
  const { payment_id } = req.query;

  // 🔹 Validación: si no hay payment_id, devolver 400 en vez de 500
  if (!payment_id || payment_id === 'null') {
    return res.status(400).json({ error: 'Falta un payment_id válido' });
  }

  try {
    const resultado = await obtenerPago(payment_id);
    res.json({
      estado: resultado.status,
      monto: resultado.transaction_amount,
      metodo: resultado.payment_type_id,
      email: resultado.metadata?.correo_electronico,
      fecha: resultado.date_approved,
      metadata: resultado.metadata
    });
  } catch (error) {
    console.error('Error al verificar pago:', error.response?.data || error.message);
    res.status(500).json({ error: 'No se pudo verificar el pago.' });
  }
};


export const recibirWebhook = async (req, res) => {
  const { action, data } = req.body;
  if (!['payment.updated', 'payment.created'].includes(action)) return res.sendStatus(200);

  const paymentId = data?.id;
  if (!paymentId || isNaN(paymentId)) return res.sendStatus(200);

  try {
    const resultado = await obtenerPago(paymentId);
    if (resultado.status === 'approved') {
      const { transaction_amount, payment_type_id, date_approved, metadata } = resultado;

      // 🔽 IDEMPOTENCIA: evitar duplicados
      const [existe] = await db.query('SELECT id FROM pagos WHERE id_pago_mp = ?', [paymentId]);
      if (existe.length > 0) return res.sendStatus(200);

      // 🔽 Insertar pago y obtener su id
      const [insert] = await db.query(`
        INSERT INTO pagos (id_pago_mp, usuario_id, monto, estado, fecha_aprobado, metodo_pago)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [resultado.id, metadata.usuario_id, transaction_amount, 'approved', date_approved, payment_type_id]);

      const pagoId = insert.insertId;

      // 🔽 Activar membresía con pagoId
      await activarMembresia(metadata, pagoId);

      // 🔽 Enviar email
      await enviarConfirmacionPago({
        to: process.env.GMAIL_TO, //resultado.payer?.email,
        fecha: new Date(resultado.date_approved).toLocaleString()
      });
    }
    res.sendStatus(200);
  } catch (error) {
    console.error('Error al consultar pago:', error.response?.data || error.message);
    res.sendStatus(500);
  }
};


export const getHistorialPagos = async (req, res) => {
  try {
    const usuarioId = req.usuario.id;

    const [rows] = await db.query(`
      SELECT p.id, p.monto, p.estado, p.metodo_pago, p.creado_en,
             pl.nombre AS plan, d.nombre AS duracion
      FROM pagos p
      LEFT JOIN membresias m ON p.id = m.pago_id
      LEFT JOIN planes pl ON m.plan_id = pl.id
      LEFT JOIN duraciones d ON m.duracion_id = d.id
      WHERE p.usuario_id = ?
      ORDER BY p.creado_en DESC
    `, [usuarioId]);

    res.json(rows);
  } catch (error) {
    console.error('Error al obtener historial de pagos:', error);
    res.status(500).json({ error: 'No se pudo obtener el historial de pagos' });
  }
};
