USE gymmanager_pro;

ALTER TABLE pagos
  MODIFY estado VARCHAR(40) NOT NULL,
  ADD COLUMN plan_id INT NULL AFTER usuario_id,
  ADD COLUMN duracion_id INT NULL AFTER plan_id,
  ADD KEY idx_pagos_plan_id (plan_id),
  ADD KEY idx_pagos_duracion_id (duracion_id),
  ADD CONSTRAINT fk_pagos_plan
    FOREIGN KEY (plan_id) REFERENCES planes (id) ON DELETE SET NULL,
  ADD CONSTRAINT fk_pagos_duracion
    FOREIGN KEY (duracion_id) REFERENCES duraciones (id) ON DELETE SET NULL;

UPDATE pagos p
JOIN membresias m ON m.pago_id = p.id
SET p.plan_id = m.plan_id,
    p.duracion_id = m.duracion_id
WHERE p.id > 0
  AND (p.plan_id IS NULL OR p.duracion_id IS NULL);

ALTER TABLE membresias
  ADD UNIQUE KEY uq_membresias_pago_id (pago_id);
