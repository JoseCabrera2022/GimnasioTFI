import db from '../configs/database.js';

export const expirarReservasVencidas = async () => {
  const [result] = await db.query(`
    UPDATE reservas r
    JOIN turnos t ON t.id = r.turno_id
    LEFT JOIN asistencias a ON a.reserva_id = r.id
    SET r.estado = 'expirada'
    WHERE r.estado = 'confirmada'
      AND a.id IS NULL
      AND t.fecha <= DATE_SUB(NOW(), INTERVAL 1 HOUR)
  `);

  return result.affectedRows;
};
