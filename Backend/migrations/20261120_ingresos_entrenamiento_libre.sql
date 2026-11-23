USE gymmanager_pro;

CREATE TABLE IF NOT EXISTS ingresos_gimnasio (
  id INT NOT NULL AUTO_INCREMENT,
  usuario_id INT NOT NULL,
  ubicacion_id INT NOT NULL,
  empleado_id INT DEFAULT NULL,
  ingresado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_ingresos_socio_fecha (usuario_id, ingresado_en),
  KEY idx_ingresos_sede_fecha (ubicacion_id, ingresado_en),
  KEY idx_ingresos_empleado (empleado_id),
  CONSTRAINT fk_ingresos_socio
    FOREIGN KEY (usuario_id) REFERENCES usuarios (id) ON DELETE CASCADE,
  CONSTRAINT fk_ingresos_sede
    FOREIGN KEY (ubicacion_id) REFERENCES ubicaciones (id) ON DELETE CASCADE,
  CONSTRAINT fk_ingresos_empleado
    FOREIGN KEY (empleado_id) REFERENCES usuarios (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
