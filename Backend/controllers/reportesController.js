import db from '../configs/database.js';

export const obtenerReporteAdministrativo = async (req, res) => {
  try {
    const [socios] = await db.query(`
      SELECT u.id, u.nombre, u.correo_electronico, u.telefono,
             l.nombre AS ubicacion, l.ciudad
      FROM usuarios u
      LEFT JOIN ubicaciones l ON l.id = u.ubicacion_id
      WHERE u.rol = 'socio' AND u.estado = 'activo' AND u.eliminado = 0
      ORDER BY u.nombre
    `);

    const [pagos] = await db.query(`
      SELECT p.id, p.usuario_id, p.monto, p.estado, p.metodo_pago,
             p.fecha_aprobado, p.creado_en
      FROM pagos p
      JOIN usuarios u ON u.id = p.usuario_id
      WHERE u.rol = 'socio' AND u.estado = 'activo' AND u.eliminado = 0
      ORDER BY p.usuario_id, COALESCE(p.fecha_aprobado, p.creado_en) DESC
    `);

    const [membresias] = await db.query(`
      SELECT m.id, m.usuario_id, m.estado, m.fecha_inicio, m.fecha_fin,
             p.nombre AS plan, p.tipo AS tipo_plan, p.eliminado AS plan_inactivo,
             d.nombre AS duracion
      FROM membresias m
      JOIN usuarios u ON u.id = m.usuario_id
      LEFT JOIN planes p ON p.id = m.plan_id
      LEFT JOIN duraciones d ON d.id = m.duracion_id
      WHERE u.rol = 'socio' AND u.estado = 'activo' AND u.eliminado = 0
      ORDER BY m.usuario_id, m.fecha_inicio DESC
    `);

    const [reservas] = await db.query(`
      SELECT r.id, r.usuario_id, r.estado, r.creado_en,
             a.nombre AS actividad, a.eliminado AS actividad_inactiva,
             t.fecha AS fecha_turno
      FROM reservas r
      JOIN usuarios u ON u.id = r.usuario_id
      JOIN turnos t ON t.id = r.turno_id
      JOIN actividades a ON a.id = t.actividad_id
      WHERE u.rol = 'socio' AND u.estado = 'activo' AND u.eliminado = 0
      ORDER BY r.usuario_id, t.fecha DESC
    `);

    const [planes] = await db.query(`
      SELECT id, nombre, tipo, precio
      FROM planes
      WHERE eliminado = 0
      ORDER BY nombre
    `);

    const [actividades] = await db.query(`
      SELECT a.id, a.nombre, l.nombre AS ubicacion, l.ciudad
      FROM actividades a
      LEFT JOIN ubicaciones l ON l.id = a.ubicacion_id
      WHERE a.eliminado = 0 AND (l.id IS NULL OR l.eliminado = 0)
      ORDER BY a.nombre
    `);

    res.json({ generadoEn: new Date().toISOString(), socios, pagos, membresias, reservas, planes, actividades });
  } catch (error) {
    console.error('Error al generar datos del reporte administrativo:', error);
    res.status(500).json({ error: 'No se pudieron obtener los datos del reporte' });
  }
};
