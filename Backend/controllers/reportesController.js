import db from '../configs/database.js';

const obtenerRangoPeriodo = (valor) => {
  const ahora = new Date();
  const periodo = valor || `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, '0')}`;
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(periodo)) return null;

  const [anio, mes] = periodo.split('-').map(Number);
  if (anio < 2000 || anio > 9998) return null;

  const anioSiguiente = mes === 12 ? anio + 1 : anio;
  const mesSiguiente = mes === 12 ? 1 : mes + 1;
  return {
    periodo,
    inicio: `${periodo}-01 00:00:00`,
    fin: `${anioSiguiente}-${String(mesSiguiente).padStart(2, '0')}-01 00:00:00`,
  };
};

export const obtenerDashboardAdministrativo = async (req, res) => {
  try {
    const [
      [socios],
      [membresias],
      [ingresosMes],
      [reservasHoy],
      [asistenciasHoy],
      [ingresosLibresHoy],
      [membresiasPorVencer],
      [planes],
      [actividades],
      [ubicaciones],
      [pagosRecientes],
      [proximosTurnos],
      [ingresosDiarios],
      [ingresosMesAnterior],
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
        WHERE m.estado = 'activa' AND m.fecha_inicio <= NOW() AND m.fecha_fin > NOW()
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
      db.query(`
        SELECT COUNT(*) AS total
        FROM asistencias
        WHERE registrado_en >= CURDATE()
          AND registrado_en < DATE_ADD(CURDATE(), INTERVAL 1 DAY)
      `),
      db.query(`
        SELECT COUNT(*) AS total
        FROM ingresos_gimnasio
        WHERE ingresado_en >= CURDATE()
          AND ingresado_en < DATE_ADD(CURDATE(), INTERVAL 1 DAY)
      `),
      db.query(`
        SELECT COUNT(*) AS total
        FROM membresias m
        JOIN usuarios u ON u.id = m.usuario_id
        WHERE m.estado = 'activa'
          AND m.fecha_inicio <= NOW()
          AND m.fecha_fin > NOW()
          AND m.fecha_fin <= DATE_ADD(NOW(), INTERVAL 7 DAY)
          AND u.rol = 'socio' AND u.estado = 'activo' AND u.eliminado = 0
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
               (SELECT GROUP_CONCAT(entrenador.nombre ORDER BY entrenador.nombre SEPARATOR ', ')
                FROM turno_entrenadores te
                JOIN usuarios entrenador ON entrenador.id = te.empleado_id
                  AND entrenador.estado = 'activo' AND entrenador.eliminado = 0
                WHERE te.turno_id = t.id) AS entrenadores,
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
      db.query(`
        SELECT COALESCE(SUM(monto), 0) AS total
        FROM pagos
        WHERE estado = 'approved'
          AND COALESCE(fecha_aprobado, creado_en) >= DATE_SUB(DATE_FORMAT(CURDATE(), '%Y-%m-01'), INTERVAL 1 MONTH)
          AND COALESCE(fecha_aprobado, creado_en) < DATE_FORMAT(CURDATE(), '%Y-%m-01')
      `),
    ]);

    res.json({
      generadoEn: new Date().toISOString(),
      metricas: {
        sociosActivos: Number(socios[0].total),
        membresiasActivas: Number(membresias[0].total),
        ingresosMes: Number(ingresosMes[0].total),
        pagosMes: Number(ingresosMes[0].cantidad),
        ingresosMesAnterior: Number(ingresosMesAnterior[0].total),
        reservasHoy: Number(reservasHoy[0].total),
        asistenciasHoy: Number(asistenciasHoy[0].total),
        ingresosLibresHoy: Number(ingresosLibresHoy[0].total),
        membresiasPorVencer: Number(membresiasPorVencer[0].total),
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
  const rango = obtenerRangoPeriodo(req.query.periodo);
  if (!rango) {
    return res.status(400).json({ error: 'El período debe tener el formato AAAA-MM.' });
  }

  try {
    const [
      [sociosActivos],
      [membresiasActivas],
      [pagosPorEstado],
      [pagosPorMetodo],
      [ingresosPeriodo],
      [reservasPorEstado],
      [asistenciasPorActividad],
      [ingresosLibresPorSede],
    ] = await Promise.all([
      db.query(`
        SELECT COUNT(*) AS cantidad
        FROM usuarios
        WHERE rol = 'socio' AND estado = 'activo' AND eliminado = 0
      `),
      db.query(`
        SELECT COUNT(*) AS cantidad
        FROM membresias m
        JOIN usuarios u ON u.id = m.usuario_id
        WHERE m.estado = 'activa'
          AND m.fecha_inicio <= NOW() AND m.fecha_fin > NOW()
          AND u.rol = 'socio' AND u.estado = 'activo' AND u.eliminado = 0
      `),
      db.query(`
        SELECT p.estado, COUNT(*) AS cantidad
        FROM pagos p
        WHERE COALESCE(p.fecha_aprobado, p.creado_en) >= ?
          AND COALESCE(p.fecha_aprobado, p.creado_en) < ?
        GROUP BY p.estado
        ORDER BY cantidad DESC
      `, [rango.inicio, rango.fin]),
      db.query(`
        SELECT p.metodo_pago, COUNT(*) AS cantidad, COALESCE(SUM(p.monto), 0) AS total
        FROM pagos p
        WHERE p.estado = 'approved'
          AND COALESCE(p.fecha_aprobado, p.creado_en) >= ?
          AND COALESCE(p.fecha_aprobado, p.creado_en) < ?
        GROUP BY p.metodo_pago
        ORDER BY total DESC
      `, [rango.inicio, rango.fin]),
      db.query(`
        SELECT COUNT(*) AS cantidad, COALESCE(SUM(p.monto), 0) AS total
        FROM pagos p
        WHERE p.estado = 'approved'
          AND COALESCE(p.fecha_aprobado, p.creado_en) >= ?
          AND COALESCE(p.fecha_aprobado, p.creado_en) < ?
      `, [rango.inicio, rango.fin]),
      db.query(`
        SELECT r.estado, COUNT(*) AS cantidad
        FROM reservas r
        JOIN turnos t ON t.id = r.turno_id
        JOIN usuarios u ON u.id = r.usuario_id
        WHERE u.rol = 'socio' AND u.estado = 'activo' AND u.eliminado = 0
          AND t.fecha >= ? AND t.fecha < ?
        GROUP BY r.estado
        ORDER BY cantidad DESC
      `, [rango.inicio, rango.fin]),
      db.query(`
        SELECT a.nombre AS actividad, l.nombre AS ubicacion, l.ciudad,
               COUNT(asi.id) AS cantidad, COUNT(DISTINCT r.usuario_id) AS socios
        FROM asistencias asi
        JOIN reservas r ON r.id = asi.reserva_id
        JOIN turnos t ON t.id = r.turno_id
        JOIN actividades a ON a.id = t.actividad_id
        LEFT JOIN ubicaciones l ON l.id = a.ubicacion_id
        WHERE asi.registrado_en >= ? AND asi.registrado_en < ?
        GROUP BY a.id, a.nombre, l.id, l.nombre, l.ciudad
        ORDER BY cantidad DESC, a.nombre
      `, [rango.inicio, rango.fin]),
      db.query(`
        SELECT l.nombre AS ubicacion, l.ciudad, COUNT(ig.id) AS cantidad,
               COUNT(DISTINCT ig.usuario_id) AS socios
        FROM ingresos_gimnasio ig
        JOIN ubicaciones l ON l.id = ig.ubicacion_id
        WHERE ig.ingresado_en >= ? AND ig.ingresado_en < ?
        GROUP BY l.id, l.nombre, l.ciudad
        ORDER BY cantidad DESC, l.nombre
      `, [rango.inicio, rango.fin]),
    ]);

    res.json({
      generadoEn: new Date().toISOString(),
      periodo: rango.periodo,
      sociosActivos: Number(sociosActivos[0].cantidad),
      membresiasActivas: Number(membresiasActivas[0].cantidad),
      pagosPorEstado,
      pagosPorMetodo,
      ingresosPeriodo: {
        cantidad: Number(ingresosPeriodo[0].cantidad),
        total: Number(ingresosPeriodo[0].total),
      },
      reservasPorEstado,
      asistenciasPorActividad,
      ingresosLibresPorSede,
    });
  } catch (error) {
    console.error('Error al generar datos del reporte administrativo:', error);
    res.status(500).json({ error: 'No se pudieron obtener los datos del reporte' });
  }
};
