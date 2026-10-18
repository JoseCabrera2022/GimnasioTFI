import db from "../configs/database.js";

export const activarMembresia = async (metadata, pagoId) => {
  const { usuario_id, tipo, duracion } = metadata;

  const [plan] = await db.query('SELECT id FROM planes WHERE tipo = ?', [tipo]);
  const [duracionData] = await db.query('SELECT id, dias FROM duraciones WHERE nombre = ?', [duracion]);

  const fechaInicio = new Date();
  const fechaFin = new Date(fechaInicio.getTime() + duracionData[0].dias * 86400000);

  await db.query(`
    INSERT INTO membresias (usuario_id, plan_id, duracion_id, pago_id, fecha_inicio, fecha_fin, estado)
    VALUES (?, ?, ?, ?, ?, ?, 'activa')
  `, [usuario_id, plan[0].id, duracionData[0].id, pagoId, fechaInicio, fechaFin]);
};
