import db from '../configs/database.js';

export const getMembresiasUsuario = async (req, res) => {
  try {
    const usuarioId = req.usuario.id;

    // 🔹 Actualizar vencidas en cada consulta
    await db.query(`
      UPDATE membresias 
      SET estado = 'vencida'
      WHERE estado = 'activa' AND fecha_fin < NOW() AND usuario_id = ?
    `, [usuarioId]);

    // 🔹 Traer membresías con datos del plan, duración y pago
    const [rows] = await db.query(`
      SELECT m.id, 
             p.nombre AS plan, 
             d.nombre AS duracion,
             m.fecha_inicio, 
             m.fecha_fin, 
             m.estado,
             m.pago_id,
             pg.monto, 
             pg.metodo_pago, 
             pg.fecha_aprobado
      FROM membresias m
      JOIN planes p ON m.plan_id = p.id
      JOIN duraciones d ON m.duracion_id = d.id
      LEFT JOIN pagos pg ON m.pago_id = pg.id
      WHERE m.usuario_id = ?
      ORDER BY m.fecha_inicio DESC
    `, [usuarioId]);

    res.json(rows);
  } catch (error) {
    console.error('Error en getMembresiasUsuario:', error);
    res.status(500).json({ error: 'No se pudo obtener las membresías' });
  }
};
