// controllers/pagosController.js
import { crearPreferenciaMP } from '../services/mercadoPago/preferenceService.js';
import { obtenerPago } from '../services/mercadoPago/paymentService.js';
import { enviarConfirmacionPago } from '../services/gmail/emailService.js';
import { activarMembresia, cancelarMembresiaDePago } from '../services/membresiaService.js';
import db from '../configs/database.js';

export const crearPreferencia = async (req, res) => {
  try {
    const usuario_id = req.usuario.id;
    const { plan_id, duracion } = req.body;
    if (!plan_id || !duracion) {
      return res.status(400).json({ error: 'Selecciona un plan y una duración válidos' });
    }

    const [[plan]] = await db.query(
      'SELECT id, nombre, tipo, precio, descripcion FROM planes WHERE id = ? AND eliminado = 0',
      [plan_id]
    );
    if (!plan) return res.status(404).json({ error: 'El plan no existe o no está disponible' });

    const [[duracionPlan]] = await db.query(
      'SELECT id, nombre, dias, descuento FROM duraciones WHERE nombre = ?',
      [duracion]
    );
    if (!duracionPlan) {
      return res.status(400).json({ error: 'La duración seleccionada no es válida' });
    }

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

    const precio = Math.round(
      Number(plan.precio) * (Number(duracionPlan.dias) / 30)
      * (1 - Number(duracionPlan.descuento || 0))
    );
    if (!Number.isFinite(precio) || precio <= 0) {
      return res.status(400).json({ error: 'El precio calculado no es válido' });
    }

    const response = await crearPreferenciaMP({
      nombre: `${plan.nombre} - ${duracionPlan.nombre}`,
      precio,
      tipo: plan.tipo,
      duracion: duracionPlan.nombre,
      usuario_id,
      plan_id: plan.id,
      correo_electronico: req.usuario.correo_electronico,
      beneficios: plan.descripcion,
    });
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

  let resultado;
  try {
    resultado = await obtenerPago(paymentId);
  } catch (error) {
    console.error('Error al consultar pago en Mercado Pago:', error.response?.data || error.message);
    return res.sendStatus(500);
  }

  const { transaction_amount, payment_type_id, date_approved, metadata } = resultado;
  const estado = String(resultado.status || '').slice(0, 40);
  const usuarioId = Number(metadata?.usuario_id);
  const planId = Number(metadata?.plan_id);
  const duracionNombre = String(metadata?.duracion || '');
  const monto = Number(transaction_amount);

  if (
    !estado
    || !Number.isInteger(usuarioId)
    || usuarioId <= 0
    || !Number.isInteger(planId)
    || planId <= 0
    || !duracionNombre
    || !Number.isFinite(monto)
    || monto <= 0
  ) {
    console.error('El pago recibido no contiene metadatos válidos para asociarlo al socio, plan y duración.');
    return res.sendStatus(500);
  }

  let connection;
  let transactionStarted = false;
  let enviarConfirmacion = false;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction();
    transactionStarted = true;

    const [[duracion]] = await connection.query(
      'SELECT id FROM duraciones WHERE nombre = ?',
      [duracionNombre]
    );
    if (!duracion) {
      throw new Error(`No se encontró la duración "${duracionNombre}" asociada al pago ${paymentId}`);
    }

    const [pagosExistentes] = await connection.query(
      'SELECT id, usuario_id, estado FROM pagos WHERE id_pago_mp = ? FOR UPDATE',
      [paymentId]
    );
    let pago = pagosExistentes[0];
    let pagoId;

    if (!pago) {
      try {
        const [insert] = await connection.query(`
          INSERT INTO pagos
            (id_pago_mp, usuario_id, plan_id, duracion_id, monto, estado, fecha_aprobado, metodo_pago)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          paymentId,
          usuarioId,
          planId,
          duracion.id,
          monto,
          estado,
          date_approved || null,
          payment_type_id || null,
        ]);
        pagoId = insert.insertId;
      } catch (error) {
        if (error.code !== 'ER_DUP_ENTRY') throw error;
        const [[pagoConcurrente]] = await connection.query(
          'SELECT id, usuario_id, estado FROM pagos WHERE id_pago_mp = ? FOR UPDATE',
          [paymentId]
        );
        if (!pagoConcurrente) throw error;
        pago = pagoConcurrente;
      }
    }

    if (pago) {
      if (Number(pago.usuario_id) !== usuarioId) {
        throw new Error(`El pago ${paymentId} ya está asociado a otro socio`);
      }
      enviarConfirmacion = estado === 'approved' && pago.estado !== 'approved';
      pagoId = pago.id;
      await connection.query(`
        UPDATE pagos
        SET plan_id = ?, duracion_id = ?, monto = ?, estado = ?,
            fecha_aprobado = COALESCE(?, fecha_aprobado), metodo_pago = ?
        WHERE id = ?
      `, [
        planId,
        duracion.id,
        monto,
        estado,
        date_approved || null,
        payment_type_id || null,
        pagoId,
      ]);
    } else {
      enviarConfirmacion = estado === 'approved';
    }

    if (estado === 'approved') {
      await activarMembresia(connection, metadata, pagoId, date_approved);
    } else if (['rejected', 'cancelled', 'refunded', 'charged_back'].includes(estado)) {
      await cancelarMembresiaDePago(connection, pagoId);
    }

    await connection.commit();
    transactionStarted = false;
  } catch (error) {
    if (transactionStarted) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error('Error al revertir el registro del pago:', rollbackError);
      }
    }
    console.error('Error al registrar el pago o actualizar la membresía:', error);
    return res.sendStatus(500);
  } finally {
    if (connection) connection.release();
  }

  if (enviarConfirmacion) {
    try {
      await enviarConfirmacionPago({
        to: process.env.GMAIL_TO,
        fecha: new Date(date_approved || Date.now()).toLocaleString('es-AR'),
        paymentId,
        monto,
        metodo: payment_type_id,
        email: metadata?.correo_electronico,
        plan: metadata?.nombre,
        duracion: duracionNombre,
        beneficios: metadata?.beneficios,
      });
    } catch (error) {
      console.error('Error al enviar el email de confirmación del pago:', error.response?.data || error.message);
    }
  }

  return res.sendStatus(200);
};

export const getHistorialPagos = async (req, res) => {
  try {
    const usuarioId = req.usuario.id;

    const [rows] = await db.query(`
      SELECT p.id, p.id_pago_mp, p.monto, p.estado, p.metodo_pago,
             COALESCE(p.fecha_aprobado, p.creado_en) AS fecha_pago,
             COALESCE(pl.nombre, pl_anterior.nombre) AS plan,
             COALESCE(d.nombre, d_anterior.nombre) AS duracion
      FROM pagos p
      LEFT JOIN planes pl ON pl.id = p.plan_id
      LEFT JOIN duraciones d ON d.id = p.duracion_id
      LEFT JOIN membresias m ON m.pago_id = p.id
      LEFT JOIN planes pl_anterior ON pl_anterior.id = m.plan_id
      LEFT JOIN duraciones d_anterior ON d_anterior.id = m.duracion_id
      WHERE p.usuario_id = ?
      ORDER BY p.creado_en DESC, p.id DESC
    `, [usuarioId]);

    res.json(rows);
  } catch (error) {
    console.error('Error al obtener historial de pagos:', error);
    res.status(500).json({ error: 'No se pudo obtener el historial de pagos' });
  }
};
