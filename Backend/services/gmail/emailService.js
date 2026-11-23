import { enviarEmailConGmailAPI } from './gmailApiService.js';

const escaparHtml = (valor) => String(valor ?? '').replace(/[&<>"']/g, (caracter) => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}[caracter]));

const formatearMonto = (monto) => new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 2,
}).format(Number(monto) || 0);

const traducirMetodo = (metodo) => ({
  credit_card: 'Tarjeta de crédito',
  debit_card: 'Tarjeta de débito',
  account_money: 'Dinero en cuenta',
  ticket: 'Pago en efectivo',
  bank_transfer: 'Transferencia bancaria',
  pix: 'Pix',
  prepaid_card: 'Tarjeta prepaga',
}[metodo] || metodo || 'No informado');

export const enviarConfirmacionPago = async ({
  to,
  fecha,
  paymentId,
  monto,
  metodo,
  email,
  plan,
  duracion,
  beneficios,
}) => {
  const detalles = [
    ['Referencia', paymentId || 'No informada'],
    ['Fecha y hora', fecha || 'No informada'],
    ['Medio de pago', traducirMetodo(metodo)],
    ['Correo asociado', email || 'No informado'],
    ['Plan', plan || 'No informado'],
    ['Duración', duracion || 'No informada'],
  ];
  const filas = detalles.map(([etiqueta, valor]) => `
    <tr>
      <td style="padding:11px 12px;border-bottom:1px solid #e4eaf2;color:#69778c;font-size:13px;width:38%;">${escaparHtml(etiqueta)}</td>
      <td style="padding:11px 12px;border-bottom:1px solid #e4eaf2;color:#253247;font-size:13px;font-weight:600;overflow-wrap:anywhere;">${escaparHtml(valor)}</td>
    </tr>
  `).join('');
  const listaBeneficios = (beneficios || '')
    .split(',')
    .map((beneficio) => beneficio.trim())
    .filter(Boolean)
    .map((beneficio) => `
      <tr>
        <td style="padding:4px 0;color:#43536a;font-size:13px;line-height:1.5;">
          <span style="color:#27814e;font-weight:bold;">&#10003;</span>&nbsp;&nbsp;${escaparHtml(beneficio)}
        </td>
      </tr>
    `).join('');
  const html = `
    <!doctype html>
    <html lang="es">
      <body style="margin:0;padding:24px 12px;background:#f4f6fa;font-family:Arial,Helvetica,sans-serif;color:#253247;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:620px;margin:0 auto;background:#ffffff;border:1px solid #e4eaf2;border-radius:14px;overflow:hidden;">
          <tr>
            <td style="padding:25px 28px;background:#162a46;color:#ffffff;">
              <p style="margin:0 0 7px;color:#a9c9f3;font-size:11px;font-weight:bold;letter-spacing:2px;">FUERZA VITAL GYM</p>
              <h1 style="margin:0;font-size:22px;line-height:1.3;">Comprobante de pago</h1>
              <p style="margin:7px 0 0;color:#d9e5f4;font-size:13px;">Gracias por elegirnos para entrenar.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:22px 28px 8px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#f1f6fd;border:1px solid #dce8f8;border-radius:10px;">
                <tr>
                  <td style="padding:16px 18px;">
                    <p style="margin:0 0 4px;color:#69778c;font-size:11px;font-weight:bold;letter-spacing:1px;">IMPORTE DE LA OPERACIÓN</p>
                    <p style="margin:0;color:#164b88;font-size:27px;font-weight:bold;">${escaparHtml(formatearMonto(monto))}</p>
                  </td>
                  <td align="right" style="padding:16px 18px;">
                    <span style="display:inline-block;padding:7px 10px;background:#e7f6ec;border-radius:20px;color:#247044;font-size:12px;font-weight:bold;">Pago aprobado</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:17px 28px 6px;">
              <h2 style="margin:0 0 10px;color:#162a46;font-size:15px;">Detalles de la operación</h2>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border:1px solid #e4eaf2;border-radius:9px;overflow:hidden;">
                ${filas}
              </table>
            </td>
          </tr>
          ${listaBeneficios ? `
          <tr>
            <td style="padding:17px 28px 21px;">
              <h2 style="margin:0 0 8px;color:#162a46;font-size:15px;">Beneficios incluidos</h2>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">${listaBeneficios}</table>
            </td>
          </tr>` : ''}
          <tr>
            <td style="padding:15px 28px;background:#f8fafc;border-top:1px solid #e4eaf2;color:#69778c;font-size:12px;line-height:1.5;">
              Conserva este correo como constancia de tu pago. Si tienes alguna consulta, comunícate con nuestro equipo.
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  await enviarEmailConGmailAPI({
    to,
    subject: 'Comprobante de pago | Fuerza Vital Gym',
    html,
  });
};
