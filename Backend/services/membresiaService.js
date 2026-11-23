export const activarMembresia = async (connection, metadata, pagoId, fechaAprobado) => {
  const usuarioId = Number(metadata.usuario_id);
  const planId = Number(metadata.plan_id);
  const duracionNombre = String(metadata.duracion || '');

  if (!Number.isInteger(usuarioId) || usuarioId <= 0 || !Number.isInteger(planId) || planId <= 0) {
    throw new Error('Los datos del socio o del plan no son válidos para activar la membresía');
  }

  const [[plan]] = await connection.query(
    'SELECT id FROM planes WHERE id = ?',
    [planId]
  );
  const [[duracion]] = await connection.query(
    'SELECT id, dias FROM duraciones WHERE nombre = ?',
    [duracionNombre]
  );
  if (!plan || !duracion) {
    throw new Error('No se encontró el plan o la duración asociados al pago');
  }

  const fechaInicio = fechaAprobado ? new Date(fechaAprobado) : new Date();
  if (Number.isNaN(fechaInicio.getTime())) {
    throw new Error('La fecha de aprobación del pago no es válida');
  }
  const fechaFin = new Date(fechaInicio.getTime() + Number(duracion.dias) * 86400000);

  const [[membresia]] = await connection.query(
    'SELECT id FROM membresias WHERE pago_id = ? FOR UPDATE',
    [pagoId]
  );

  if (membresia) {
    await connection.query(`
      UPDATE membresias
      SET usuario_id = ?, plan_id = ?, duracion_id = ?, fecha_inicio = ?, fecha_fin = ?, estado = 'activa'
      WHERE id = ?
    `, [usuarioId, plan.id, duracion.id, fechaInicio, fechaFin, membresia.id]);
    return;
  }

  await connection.query(`
    INSERT INTO membresias (usuario_id, plan_id, duracion_id, pago_id, fecha_inicio, fecha_fin, estado)
    VALUES (?, ?, ?, ?, ?, ?, 'activa')
  `, [usuarioId, plan.id, duracion.id, pagoId, fechaInicio, fechaFin]);
};

export const cancelarMembresiaDePago = async (connection, pagoId) => {
  await connection.query(
    `UPDATE membresias
     SET estado = 'cancelada'
     WHERE pago_id = ? AND estado = 'activa'`,
    [pagoId]
  );
};
