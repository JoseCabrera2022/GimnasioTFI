import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import {
  capitalizarPrimeraLetra,
  traducirEstado,
  traducirMetodo,
  convertirImagenABase64,
} from './conversiones';

const PAGE_WIDTH = 210;
const MARGIN = 16;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const colors = {
  navy: [22, 42, 70],
  blue: [23, 105, 210],
  text: [37, 50, 71],
  muted: [105, 119, 140],
  line: [228, 234, 242],
  surface: [247, 249, 252],
  blueSurface: [241, 246, 253],
  green: [36, 112, 68],
  greenSurface: [231, 246, 236],
  yellow: [119, 87, 14],
  yellowSurface: [255, 244, 217],
  red: [165, 46, 58],
  redSurface: [253, 235, 237],
  white: [255, 255, 255],
};

const formatearMonto = (monto) => new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 2,
}).format(Number(monto) || 0);

const formatearFecha = (valor) => {
  if (!valor) return 'No informada';
  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) return 'No informada';
  return fecha.toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  });
};

const obtenerColoresEstado = (estado) => {
  if (estado === 'approved') return { fondo: colors.greenSurface, texto: colors.green };
  if (['pending', 'in_process', 'in_mediation', 'authorized'].includes(estado)) {
    return { fondo: colors.yellowSurface, texto: colors.yellow };
  }
  return { fondo: colors.redSurface, texto: colors.red };
};

export const generarPDF = async (detallePago, paymentId) => {
  if (!detallePago) return;

  const logo = await convertirImagenABase64('/assets/fuerzavitalgym.png');
  const qr = await QRCode.toDataURL(window.location.href, { margin: 1, width: 240 });
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const estado = detallePago.estado;
  const estadoTexto = traducirEstado(estado) || 'Sin estado';
  const estadoColores = obtenerColoresEstado(estado);
  const beneficios = detallePago.metadata?.beneficios
    ? detallePago.metadata.beneficios.split(',').map((beneficio) => beneficio.trim()).filter(Boolean)
    : [];

  pdf.setFont('helvetica', 'normal');
  pdf.setFillColor(...colors.navy);
  pdf.rect(0, 0, PAGE_WIDTH, 48, 'F');

  if (logo) {
    const logoBox = { x: MARGIN, y: 9, width: 34, height: 30 };
    const logoSize = pdf.getImageProperties(logo);
    const scale = Math.min(
      (logoBox.width - 4) / logoSize.width,
      (logoBox.height - 4) / logoSize.height
    );
    const logoWidth = logoSize.width * scale;
    const logoHeight = logoSize.height * scale;
    pdf.setFillColor(...colors.white);
    pdf.roundedRect(logoBox.x, logoBox.y, logoBox.width, logoBox.height, 2, 2, 'F');
    pdf.addImage(
      logo,
      'PNG',
      logoBox.x + (logoBox.width - logoWidth) / 2,
      logoBox.y + (logoBox.height - logoHeight) / 2,
      logoWidth,
      logoHeight
    );
  }

  pdf.setTextColor(...colors.white);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(15);
  pdf.text('COMPROBANTE DE PAGO', 58, 20);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8.5);
  pdf.text('Constancia digital de tu operación', 58, 28);
  pdf.setDrawColor(99, 164, 255);
  pdf.setLineWidth(0.8);
  pdf.line(MARGIN, 47, PAGE_WIDTH - MARGIN, 47);

  pdf.setFillColor(...estadoColores.fondo);
  pdf.roundedRect(151, 34, 43, 8, 2, 2, 'F');
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(7);
  pdf.setTextColor(...estadoColores.texto);
  pdf.text(estadoTexto.toLocaleUpperCase('es-AR'), 172.5, 39.3, { align: 'center' });

  pdf.setFillColor(...colors.blueSurface);
  pdf.setDrawColor(...colors.line);
  pdf.roundedRect(MARGIN, 57, CONTENT_WIDTH, 30, 3, 3, 'FD');
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7.5);
  pdf.setTextColor(...colors.muted);
  pdf.text('IMPORTE DE LA OPERACIÓN', MARGIN + 6, 66);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(19);
  pdf.setTextColor(...colors.navy);
  pdf.text(formatearMonto(detallePago.monto), MARGIN + 6, 79);
  pdf.setFillColor(...colors.white);
  pdf.roundedRect(171, 65, 17, 9, 2, 2, 'F');
  pdf.setFontSize(7);
  pdf.setTextColor(...colors.muted);
  pdf.text('ARS', 179.5, 71, { align: 'center' });

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.setTextColor(...colors.navy);
  pdf.text('DETALLES DE LA OPERACIÓN', MARGIN, 99);

  const detalles = [
    ['Referencia', String(paymentId || 'No informada')],
    ['Fecha y hora', formatearFecha(detallePago.fecha)],
    ['Medio de pago', detallePago.metodo ? traducirMetodo(detallePago.metodo) : 'No informado'],
    ['Correo asociado', detallePago.email || 'No informado'],
    ['Plan', detallePago.metadata?.nombre || 'No informado'],
    ['Duración', capitalizarPrimeraLetra(detallePago.metadata?.duracion) || 'No informada'],
  ];
  const gap = 4;
  const cardWidth = (CONTENT_WIDTH - gap) / 2;
  const cardHeight = 22;
  const startY = 105;

  detalles.forEach(([etiqueta, valor], indice) => {
    const columna = indice % 2;
    const fila = Math.floor(indice / 2);
    const x = MARGIN + columna * (cardWidth + gap);
    const y = startY + fila * (cardHeight + 4);
    pdf.setFillColor(...colors.surface);
    pdf.setDrawColor(...colors.line);
    pdf.roundedRect(x, y, cardWidth, cardHeight, 2, 2, 'FD');
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(6.5);
    pdf.setTextColor(...colors.muted);
    pdf.text(etiqueta.toLocaleUpperCase('es-AR'), x + 4, y + 6);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(...colors.text);
    const lineas = pdf.splitTextToSize(String(valor), cardWidth - 8).slice(0, 2);
    pdf.text(lineas, x + 4, y + 12);
  });

  const seccionY = startY + 3 * (cardHeight + 4) + 4;
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.setTextColor(...colors.navy);
  pdf.text('BENEFICIOS INCLUIDOS', MARGIN, seccionY);

  const panelY = seccionY + 6;
  const panelHeight = 72;
  const benefitsWidth = 122;
  const qrX = MARGIN + benefitsWidth + 5;
  const qrWidth = CONTENT_WIDTH - benefitsWidth - 5;
  pdf.setFillColor(...colors.surface);
  pdf.setDrawColor(...colors.line);
  pdf.roundedRect(MARGIN, panelY, benefitsWidth, panelHeight, 2.5, 2.5, 'FD');
  pdf.roundedRect(qrX, panelY, qrWidth, panelHeight, 2.5, 2.5, 'FD');

  if (beneficios.length) {
    let benefitY = panelY + 9;
    let panelBottom = panelY + panelHeight - 3;
    let enContinuacion = false;
    const iniciarContinuacion = () => {
      pdf.addPage();
      pdf.setFillColor(...colors.navy);
      pdf.rect(0, 0, PAGE_WIDTH, 27, 'F');
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(9);
      pdf.setTextColor(...colors.white);
      pdf.text('FUERZA VITAL  |  COMPROBANTE DE PAGO', MARGIN, 11);
      pdf.setFontSize(14);
      pdf.text('Beneficios incluidos', MARGIN, 21);
      pdf.setFillColor(...colors.surface);
      pdf.setDrawColor(...colors.line);
      pdf.roundedRect(MARGIN, 34, CONTENT_WIDTH, 233, 2.5, 2.5, 'FD');
      benefitY = 45;
      panelBottom = 260;
      enContinuacion = true;
    };

    beneficios.forEach((beneficio) => {
      const anchoTexto = enContinuacion ? CONTENT_WIDTH - 18 : benefitsWidth - 15;
      const xTexto = enContinuacion ? MARGIN + 10 : MARGIN + 10;
      const lineasRestantes = pdf.splitTextToSize(beneficio, anchoTexto);
      let primeraParte = true;

      while (lineasRestantes.length) {
        const lineasDisponibles = Math.floor((panelBottom - benefitY) / 4);
        if (lineasDisponibles < 1) {
          iniciarContinuacion();
          continue;
        }

        const lineas = lineasRestantes.splice(0, lineasDisponibles);
        if (primeraParte) {
          pdf.setFillColor(...colors.blue);
          pdf.circle(MARGIN + 6, benefitY - 0.8, 0.8, 'F');
        }
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(7.5);
        pdf.setTextColor(...colors.text);
        pdf.text(lineas, xTexto, benefitY);
        benefitY += lineas.length * 4 + 2;
        primeraParte = false;

        if (lineasRestantes.length) iniciarContinuacion();
      }
    });
  } else {
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(...colors.muted);
    pdf.text('No se detallaron beneficios para este plan.', MARGIN + 5, panelY + 11);
  }

  pdf.addImage(qr, 'PNG', qrX + (qrWidth - 30) / 2, panelY + 7, 30, 30);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(7);
  pdf.setTextColor(...colors.navy);
  pdf.text('CONSULTA DIGITAL', qrX + qrWidth / 2, panelY + 44, { align: 'center' });
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(6.5);
  pdf.setTextColor(...colors.muted);
  pdf.text('Escanea para revisar el pago', qrX + qrWidth / 2, panelY + 50, { align: 'center' });

  const totalPaginas = pdf.getNumberOfPages();
  for (let pagina = 1; pagina <= totalPaginas; pagina += 1) {
    pdf.setPage(pagina);
    pdf.setDrawColor(...colors.line);
    pdf.setLineWidth(0.3);
    pdf.line(MARGIN, 282, PAGE_WIDTH - MARGIN, 282);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7);
    pdf.setTextColor(...colors.muted);
    pdf.text('FUERZA VITAL  |  Gracias por entrenar con nosotros', MARGIN, 288);
    pdf.text(`Página ${pagina} de ${totalPaginas}`, PAGE_WIDTH - MARGIN, 288, { align: 'right' });
  }

  const nombrePago = String(paymentId || 'pago').replace(/[^a-zA-Z0-9_-]/g, '');
  pdf.save(`comprobante_pago_${nombrePago || 'pago'}.pdf`);
};
