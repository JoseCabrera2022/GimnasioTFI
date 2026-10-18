import axios from 'axios';

export const traducirEstado = (estado) => ({
  approved: 'Aprobado',
  pending: 'Pendiente',
  rejected: 'Rechazado',
  in_process: 'En proceso',
  cancelled: 'Cancelado',
  refunded: 'Reembolsado'
}[estado] || estado);

export const traducirMetodo = (metodo) => ({
  credit_card: 'Tarjeta de crédito',
  debit_card: 'Tarjeta de débito',
  account_money: 'Dinero en cuenta',
  ticket: 'Pago en efectivo',
  bank_transfer: 'Transferencia bancaria',
  pix: 'Pix',
  prepaid_card: 'Tarjeta prepaga'
}[metodo] || metodo);

export const convertirImagenABase64 = async (ruta) => {
  try {
    const response = await axios.get(ruta, { responseType: 'blob' });
    const reader = new FileReader();
    return await new Promise((resolve, reject) => {
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(response.data);
    });
  } catch (error) {
    console.error('Error al convertir imagen:', error);
    return null;
  }
};
