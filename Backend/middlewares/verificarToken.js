import jwt from 'jsonwebtoken';
import db from '../configs/database.js';

export const verificarToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(403).json({ error: 'Token requerido' });

  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) return res.status(403).json({ error: 'Token inválido' });
    try {
      const [rows] = await db.query(
        'SELECT id FROM usuarios WHERE id=? AND eliminado=0',
        [decoded.id]
      );
      if (rows.length === 0) {
        return res.status(403).json({ error: 'La cuenta ya no está disponible' });
      }
      req.usuario = decoded;
      next();
    } catch (error) {
      console.error('Error al verificar el estado de la cuenta:', error);
      res.status(500).json({ error: 'No se pudo verificar la cuenta' });
    }
  });
};
