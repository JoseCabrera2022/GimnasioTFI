USE gymmanager_pro;

CREATE TABLE IF NOT EXISTS turno_entrenadores (
  turno_id INT NOT NULL,
  empleado_id INT NOT NULL,
  asignado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (turno_id, empleado_id),
  KEY idx_turno_entrenadores_empleado (empleado_id, turno_id),
  CONSTRAINT fk_turno_entrenadores_turno
    FOREIGN KEY (turno_id) REFERENCES turnos (id) ON DELETE CASCADE,
  CONSTRAINT fk_turno_entrenadores_empleado
    FOREIGN KEY (empleado_id) REFERENCES usuarios (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
