CREATE TABLE IF NOT EXISTS asistencias (
  id INT NOT NULL AUTO_INCREMENT,
  reserva_id INT NOT NULL,
  empleado_id INT NULL,
  registrado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_asistencias_reserva (reserva_id),
  KEY idx_asistencias_empleado (empleado_id),
  CONSTRAINT fk_asistencias_reserva
    FOREIGN KEY (reserva_id) REFERENCES reservas (id) ON DELETE CASCADE,
  CONSTRAINT fk_asistencias_empleado
    FOREIGN KEY (empleado_id) REFERENCES usuarios (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
