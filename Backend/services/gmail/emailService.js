import { enviarEmailConGmailAPI } from './gmailApiService.js';

export const enviarConfirmacionPago = async ({ to, fecha }) => {
  await enviarEmailConGmailAPI({
    to,
    subject: 'Confirmación de pago',
    html: `
      <h2>¡Gracias por tu compra!</h2>
      <p>Tu membresía ha sido activada correctamente.</p>
      <p>Fecha: ${fecha}</p>
    `
  });
};
