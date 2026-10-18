import { Payment } from 'mercadopago';
import client from './mercadoPagoClient.js';

const payment = new Payment(client);

export const obtenerPago = async (id) => {
  return await payment.get({ id });
};
