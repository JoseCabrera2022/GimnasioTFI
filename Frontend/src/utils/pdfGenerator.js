import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import { traducirEstado, traducirMetodo, convertirImagenABase64 } from './conversiones';
import { API_LOCAL } from '../api/endpoints';

export const generarPDF = async (detallePago, paymentId) => {
  if (!detallePago) return;

  const { estado, monto, metodo, email, fecha, metadata } = detallePago;
  const logoBase64 = await convertirImagenABase64('/assets/fuerzavitalgym.png');
  const qrData = `${API_LOCAL}/validar-pago/${paymentId}`;
  const qrBase64 = await QRCode.toDataURL(qrData);

  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  pdf.setFont('courier');
  pdf.setFontSize(12);
  pdf.setTextColor(40, 40, 40);
  pdf.setDrawColor(180);
  pdf.rect(10, 10, 190, 277);

  if (logoBase64) {
    pdf.addImage(logoBase64, 'PNG', 85, 20, 40, 15);
  }

  pdf.setFontSize(10);
  pdf.text('COMPROBANTE DE PAGO', 105, 42, { align: 'center' });
  pdf.line(20, 45, 190, 45);

  pdf.setFontSize(9);
  pdf.text(`Estado: ${traducirEstado(estado)}`, 20, 55);
  pdf.text(`Monto: $${monto}`, 20, 62);
  pdf.text(`Método: ${traducirMetodo(metodo)}`, 20, 69);
  pdf.text(`Email: ${email}`, 20, 76);
  pdf.text(`Fecha: ${new Date(fecha).toLocaleString()}`, 20, 83);
  pdf.text(`Plan: ${metadata?.nombre}`, 20, 90);
  pdf.text(`Duración: ${metadata?.duracion}`, 20, 97);

  const beneficios = metadata?.beneficios
    ? metadata.beneficios.split(',').map(b => b.trim())
    : [];

  pdf.text('Beneficios incluidos:', 20, 107);
  beneficios.forEach((b, i) => {
    pdf.rect(20, 112 + i * 8, 170, 7);
    pdf.text(b, 25, 117 + i * 8);
  });

  pdf.addImage(qrBase64, 'PNG', 160, 250, 30, 30);
  pdf.setFontSize(9);
  pdf.text('Gracias por entrenar con nosotros', 20, 270);
  pdf.textWithLink('https://fuerzavitalgym.com', 20, 275, {
    url: 'http://localhost:5173'
  });
  pdf.save(`comprobante_pago_${paymentId}.pdf`);
};
