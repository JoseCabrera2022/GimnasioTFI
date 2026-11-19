import jwt from 'jsonwebtoken';

export const SESSION_TOKEN_DURATION = '30m';
export const SESSION_TOKEN_REFRESH_THRESHOLD_SECONDS = 15 * 60;

export const crearTokenSesion = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: SESSION_TOKEN_DURATION });
