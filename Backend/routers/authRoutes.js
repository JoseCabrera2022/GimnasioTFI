import express from 'express';
import { oAuth2Client } from '../services/gmail/googleAuth.js';
import {
  registrarUsuario,
  verificarEmail,
  loginUsuario,
  solicitarRecuperacionPassword,
  restablecerPassword
} from '../controllers/authController.js';
import { verificarToken } from '../middlewares/verificarToken.js';

const router = express.Router();

// Ruta para iniciar el flujo OAuth de Gmail
router.get('/auth', (req, res) => {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/gmail.send'],
    prompt: 'consent'
  });
  res.redirect(authUrl);
});

// Rutas de autenticación de usuarios
router.post('/api/register', registrarUsuario);
router.get('/api/verify-email', verificarEmail);
router.post('/api/login', loginUsuario);
router.post('/api/auth/refresh', verificarToken, (req, res) => res.status(204).end());
router.post('/api/forgot-password', solicitarRecuperacionPassword);
router.post('/api/reset-password', restablecerPassword);

export default router;
