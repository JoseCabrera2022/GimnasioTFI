ALTER TABLE membresias
  DROP FOREIGN KEY membresias_ibfk_1,
  ADD CONSTRAINT fk_membresias_usuario_cascade
    FOREIGN KEY (usuario_id) REFERENCES usuarios (id) ON DELETE CASCADE;

ALTER TABLE pagos
  DROP FOREIGN KEY pagos_ibfk_1,
  ADD CONSTRAINT fk_pagos_usuario_cascade
    FOREIGN KEY (usuario_id) REFERENCES usuarios (id) ON DELETE CASCADE;

ALTER TABLE reservas
  DROP FOREIGN KEY reservas_ibfk_1,
  ADD CONSTRAINT fk_reservas_usuario_cascade
    FOREIGN KEY (usuario_id) REFERENCES usuarios (id) ON DELETE CASCADE;
