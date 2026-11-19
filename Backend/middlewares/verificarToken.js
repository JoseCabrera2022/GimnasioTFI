import jwt from 'jsonwebtoken';
import db from '../configs/database.js';
import { crearTokenSesion, SESSION_TOKEN_REFRESH_THRESHOLD_SECONDS } from '../utils/sessionToken.js';

export const verificarToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ code: 'TOKEN_REQUIRED', error: 'Token requerido' });
  }

  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) {
      const expired = err.name === 'TokenExpiredError';
      return res.status(401).json({
        code: expired ? 'TOKEN_EXPIRED' : 'TOKEN_INVALID',
        error: expired ? 'La sesión ha expirado' : 'Token inválido',
      });
    }

    try {
      const [rows] = await db.query(
        'SELECT id FROM usuarios WHERE id=? AND eliminado=0',
        [decoded.id]
      );
      if (rows.length === 0) {
        return res.status(401).json({
          code: 'ACCOUNT_UNAVAILABLE',
          error: 'La cuenta ya no está disponible',
        });
      }

      const tiempoRestante = decoded.exp - Math.floor(Date.now() / 1000);
      if (tiempoRestante <= SESSION_TOKEN_REFRESH_THRESHOLD_SECONDS) {
        const payload = { ...decoded };
        delete payload.iat;
        delete payload.exp;
        delete payload.nbf;
        res.setHeader('X-Auth-Token', crearTokenSesion(payload));
      }

      req.usuario = decoded;
      next();
    } catch (error) {
      console.error('Error al verificar el estado de la cuenta:', error);
      res.status(500).json({ error: 'No se pudo verificar la cuenta' });
    }
  });
};
