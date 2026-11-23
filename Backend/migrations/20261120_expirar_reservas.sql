USE gymmanager_pro;

ALTER TABLE reservas
  MODIFY COLUMN estado ENUM('pendiente', 'confirmada', 'cancelada', 'expirada')
  DEFAULT 'confirmada';

-- Requires the asistencias table from 20261120_add_asistencias.sql.
UPDATE reservas r
JOIN turnos t ON t.id = r.turno_id
LEFT JOIN asistencias a ON a.reserva_id = r.id
SET r.estado = 'expirada'
WHERE r.estado = 'confirmada'
  AND r.id > 0
  AND a.id IS NULL
  AND t.fecha <= DATE_SUB(NOW(), INTERVAL 1 HOUR);
