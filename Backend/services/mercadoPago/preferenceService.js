import { Preference } from 'mercadopago';
import client from './mercadoPagoClient.js';

const preference = new Preference(client);

export const crearPreferenciaMP = async ({ nombre, precio, tipo, duracion, usuario_id, plan_id, correo_electronico, beneficios }) => {
  return await preference.create({
    body: {
      items: [
        { title: nombre, unit_price: parseFloat(precio), quantity: 1 }
      ],
      back_urls: {
        success: 'https://stubbled-attendantly-israel.ngrok-free.dev/pago-exitoso',
        failure: 'https://stubbled-attendantly-israel.ngrok-free.dev/pago-fallido',
        pending: 'https://stubbled-attendantly-israel.ngrok-free.dev/pago-pendiente'
      },
      external_reference: `${usuario_id}-${plan_id}-${tipo}-${duracion}`,
      metadata: { usuario_id, plan_id, tipo, duracion, nombre, precio, correo_electronico, beneficios },
    }
  });
};
