import db from '../configs/database.js';

export const obtenerDashboardAdministrativo = async (req, res) => {
  try {
    const [
      [socios],
      [membresias],
      [ingresosMes],
      [reservasHoy],
      [planes],
      [actividades],
      [ubicaciones],
      [pagosRecientes],
      [proximosTurnos],
      [ingresosDiarios],
    ] = await Promise.all([
      db.query(`
        SELECT COUNT(*) AS total
        FROM usuarios
        WHERE rol = 'socio' AND estado = 'activo' AND eliminado = 0
      `),
      db.query(`
        SELECT COUNT(*) AS total
        FROM membresias m
        JOIN usuarios u ON u.id = m.usuario_id
        WHERE m.estado = 'activa' AND m.fecha_fin > NOW()
          AND u.rol = 'socio' AND u.estado = 'activo' AND u.eliminado = 0
      `),
      db.query(`
        SELECT COALESCE(SUM(monto), 0) AS total, COUNT(*) AS cantidad
        FROM pagos
        WHERE estado = 'approved'
          AND COALESCE(fecha_aprobado, creado_en) >= DATE_FORMAT(CURDATE(), '%Y-%m-01')
          AND COALESCE(fecha_aprobado, creado_en) < DATE_ADD(LAST_DAY(CURDATE()), INTERVAL 1 DAY)
      `),
      db.query(`
        SELECT COUNT(*) AS total
        FROM reservas r
        JOIN turnos t ON t.id = r.turno_id
        JOIN usuarios u ON u.id = r.usuario_id
        WHERE r.estado = 'confirmada'
          AND t.fecha >= CURDATE() AND t.fecha < DATE_ADD(CURDATE(), INTERVAL 1 DAY)
          AND u.estado = 'activo' AND u.eliminado = 0
      `),
      db.query('SELECT COUNT(*) AS total FROM planes WHERE eliminado = 0'),
      db.query(`
        SELECT COUNT(*) AS total
        FROM actividades a
        LEFT JOIN ubicaciones u ON u.id = a.ubicacion_id
        WHERE a.eliminado = 0 AND (u.id IS NULL OR u.eliminado = 0)
      `),
      db.query('SELECT COUNT(*) AS total FROM ubicaciones WHERE eliminado = 0'),
      db.query(`
        SELECT p.id, p.monto, p.estado, p.metodo_pago,
               COALESCE(p.fecha_aprobado, p.creado_en) AS fecha,
               u.nombre AS socio
        FROM pagos p
        LEFT JOIN usuarios u ON u.id = p.usuario_id
        ORDER BY COALESCE(p.fecha_aprobado, p.creado_en) DESC
        LIMIT 6
      `),
      db.query(`
        SELECT t.id, t.fecha, t.cupo_maximo, a.nombre AS actividad,
               u.nombre AS ubicacion, u.ciudad,
               COUNT(r.id) AS reservas
        FROM turnos t
        JOIN actividades a ON a.id = t.actividad_id AND a.eliminado = 0
        LEFT JOIN ubicaciones u ON u.id = a.ubicacion_id
        LEFT JOIN reservas r ON r.turno_id = t.id AND r.estado = 'confirmada'
        WHERE t.fecha >= NOW() AND (u.id IS NULL OR u.eliminado = 0)
        GROUP BY t.id, t.fecha, t.cupo_maximo, a.nombre, u.nombre, u.ciudad
        ORDER BY t.fecha ASC
        LIMIT 5
      `),
      db.query(`
        SELECT DATE_FORMAT(COALESCE(fecha_aprobado, creado_en), '%Y-%m-%d') AS fecha,
               SUM(monto) AS total
        FROM pagos
        WHERE estado = 'approved'
          AND COALESCE(fecha_aprobado, creado_en) >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
          AND COALESCE(fecha_aprobado, creado_en) < DATE_ADD(CURDATE(), INTERVAL 1 DAY)
        GROUP BY DATE_FORMAT(COALESCE(fecha_aprobado, creado_en), '%Y-%m-%d')
        ORDER BY fecha ASC
      `),
    ]);

    res.json({
      generadoEn: new Date().toISOString(),
      metricas: {
        sociosActivos: Number(socios[0].total),
        membresiasActivas: Number(membresias[0].total),
        ingresosMes: Number(ingresosMes[0].total),
        pagosMes: Number(ingresosMes[0].cantidad),
        reservasHoy: Number(reservasHoy[0].total),
        planesActivos: Number(planes[0].total),
        actividadesActivas: Number(actividades[0].total),
        ubicacionesActivas: Number(ubicaciones[0].total),
      },
      pagosRecientes,
      proximosTurnos,
      ingresosDiarios,
    });
  } catch (error) {
    console.error('Error al obtener los datos del dashboard administrativo:', error);
    res.status(500).json({ error: 'No se pudieron obtener los datos del dashboard' });
  }
};

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
