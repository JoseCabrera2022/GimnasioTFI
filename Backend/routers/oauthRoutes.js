import express from 'express';
import { oAuth2Client } from '../services/gmail/googleAuth.js';
import db from '../configs/database.js';

const router = express.Router();

router.get('/oauth2callback', async (req, res) => {
  const code = req.query.code;

  try {
    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);

    // Guardá el refresh_token en tu base de datos o archivo seguro
    //await db.query('UPDATE usuarios SET gmail_refresh_token = ? WHERE correo_electronico = ?', [tokens.refresh_token, email]);
    console.log('refresh_token: ',tokens.refresh_token)

    res.send('Autenticación exitosa. Ya podés enviar correos.');
  } catch (error) {
    console.error('❌ Error al obtener tokens:', error);
    res.status(500).send('Error en la autenticación.');
  }
});

export default router;
