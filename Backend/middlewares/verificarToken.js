import jwt from 'jsonwebtoken';
import db from '../configs/database.js';
import { crearTokenSesion, SESSION_TOKEN_REFRESH_THRESHOLD_SECONDS } from '../utils/sessionToken.js';

export const verificarToken = (req, res, next) => {
  const authHeader = req.get('authorization')?.trim();
  const token = authHeader?.match(/^Bearer\s+(\S+)$/i)?.[1];
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
        `SELECT id, nombre, correo_electronico, rol, telefono, estado, ubicacion_id
         FROM usuarios
         WHERE id = ? AND eliminado = 0 AND estado = 'activo'`,
        [decoded.id]
      );
      if (rows.length === 0) {
        return res.status(401).json({
          code: 'ACCOUNT_UNAVAILABLE',
          error: 'La cuenta ya no está disponible',
        });
      }

      const cuenta = rows[0];
      const tiempoRestante = decoded.exp - Math.floor(Date.now() / 1000);
      if (tiempoRestante <= SESSION_TOKEN_REFRESH_THRESHOLD_SECONDS) {
        res.setHeader('X-Auth-Token', crearTokenSesion({
          id: cuenta.id,
          correo_electronico: cuenta.correo_electronico,
          rol: cuenta.rol,
          telefono: cuenta.telefono,
          ubicacion_id: cuenta.ubicacion_id,
          estado: cuenta.estado,
        }));
      }

      req.usuario = {
        ...decoded,
        id: cuenta.id,
        nombre: cuenta.nombre,
        correo_electronico: cuenta.correo_electronico,
        rol: cuenta.rol,
        telefono: cuenta.telefono,
        estado: cuenta.estado,
        ubicacion_id: cuenta.ubicacion_id,
      };
      next();
    } catch (error) {
      console.error('Error al verificar el estado de la cuenta:', error);
      res.status(500).json({ error: 'No se pudo verificar la cuenta' });
    }
  });
};
