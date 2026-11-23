import axios from 'axios';
import jsPDF from 'jspdf';
import { ENDPOINTS_LOCAL } from '../api/endpoints';
import { convertirImagenABase64, traducirEstado, traducirMetodo } from './conversiones';

const PAGE_WIDTH = 210;
const MARGIN = 14;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const PAGE_BOTTOM = 275;

const colors = {
  navy: [22, 42, 70],
  blue: [23, 105, 210],
  text: [37, 50, 71],
  muted: [105, 119, 140],
  line: [228, 234, 242],
  surface: [247, 249, 252],
  blueSurface: [238, 245, 255],
  white: [255, 255, 255],
};

const formatearMonto = (monto) =>
  new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 2,
  }).format(Number(monto) || 0);

const convertirFecha = (valor) => {
  if (!valor) return null;
  const fecha = new Date(valor);
  return Number.isNaN(fecha.getTime()) ? null : fecha;
};

const formatearFechaHora = (valor) => {
  const fecha = convertirFecha(valor);
  return fecha
    ? fecha.toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    })
    : 'Sin fecha';
};

const capitalizar = (valor) => {
  const texto = String(valor || '').trim();
  return texto ? texto.charAt(0).toLocaleUpperCase('es-AR') + texto.slice(1) : 'No disponible';
};

const traducirMetodoSeguro = (metodo) => {
  if (!metodo) return 'No informado';
  const valor = String(metodo);
  const traducido = traducirMetodo(valor);
  return traducido === valor && /^[a-z0-9_]+$/i.test(valor) ? 'Otro medio de pago' : traducido;
};

const traducirEstadoSeguro = (estado) => {
  if (!estado) return 'Sin estado';
  const valor = String(estado);
  const traducido = traducirEstado(valor);
  return traducido === valor && /^[a-z0-9_]+$/i.test(valor) ? 'Otro estado' : traducido;
};

export const descargarReporteAdministrativo = async (token, periodoSolicitado) => {
  const { data } = await axios.get(ENDPOINTS_LOCAL.REPORTE_ADMIN, {
    headers: { Authorization: `Bearer ${token}` },
    params: { periodo: periodoSolicitado },
  });

  const generatedAt = convertirFecha(data.generadoEn) || new Date();
  const periodoSeleccionado = data.periodo || periodoSolicitado;
  const [anioPeriodo, mesPeriodo] = periodoSeleccionado.split('-').map(Number);
  const periodo = capitalizar(new Date(anioPeriodo, mesPeriodo - 1, 15).toLocaleDateString('es-AR', {
    month: 'long',
    year: 'numeric',
  }));
  const sociosActivos = Number(data.sociosActivos) || 0;
  const membresiasActivas = Number(data.membresiasActivas) || 0;
  const pagosPorEstado = data.pagosPorEstado || [];
  const pagosPorMetodo = data.pagosPorMetodo || [];
  const reservasPorEstado = data.reservasPorEstado || [];
  const asistenciasPorActividad = data.asistenciasPorActividad || [];
  const ingresosLibresPorSede = data.ingresosLibresPorSede || [];
  const ingresosPeriodo = data.ingresosPeriodo || { cantidad: 0, total: 0 };
  const cantidadReservas = reservasPorEstado.reduce(
    (total, reserva) => total + Number(reserva.cantidad || 0),
    0
  );
  const cantidadAsistencias = asistenciasPorActividad.reduce(
    (total, actividad) => total + Number(actividad.cantidad || 0),
    0
  );
  const cantidadIngresosLibres = ingresosLibresPorSede.reduce(
    (total, sede) => total + Number(sede.cantidad || 0),
    0
  );
  const estadosPagoResumen = pagosPorEstado
    .map((pago) => `${traducirEstadoSeguro(pago.estado)}: ${Number(pago.cantidad)}`)
    .join(' · ') || 'No se registraron pagos';
  const estadosReservaResumen = reservasPorEstado
    .map((reserva) => `${traducirEstadoSeguro(reserva.estado)}: ${Number(reserva.cantidad)}`)
    .join(' · ') || 'No se registraron reservas';
  const visitasPorSedeResumen = ingresosLibresPorSede
    .slice(0, 2)
    .map((sede) => `${[sede.ubicacion, sede.ciudad].filter(Boolean).join(' - ') || 'Sin sede'}: ${Number(sede.cantidad)} visitas`)
    .join(' · ') || 'Sin visitas de entrenamiento libre';

  const logo = await convertirImagenABase64('/assets/fuerzavitalgym.png');
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const generado = formatearFechaHora(generatedAt);
  let y = 0;

  const dibujarEncabezado = (primeraPagina = false) => {
    pdf.setFillColor(...colors.navy);
    pdf.rect(0, 0, PAGE_WIDTH, primeraPagina ? 48 : 23, 'F');
    pdf.setTextColor(...colors.white);

    if (primeraPagina) {
      if (logo) {
        const logoBox = { x: MARGIN, y: 10, width: 34, height: 28 };
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
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(16);
      pdf.text('REPORTE ADMINISTRATIVO', 53, 18);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      pdf.text(`Resumen ejecutivo | Período: ${periodo}`, 53, 26);
      pdf.text(`Generado: ${generado}`, 53, 33);
      pdf.setDrawColor(99, 164, 255);
      pdf.setLineWidth(1);
      pdf.line(MARGIN, 47, PAGE_WIDTH - MARGIN, 47);
      y = 57;
      return;
    }

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9);
    pdf.text('FUERZA VITAL  |  REPORTE ADMINISTRATIVO', MARGIN, 10);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7.5);
    pdf.text(`Período: ${periodo}  |  Generado: ${generado}`, MARGIN, 17);
    y = 32;
  };

  const agregarPagina = () => {
    pdf.addPage();
    dibujarEncabezado();
  };

  const asegurarEspacio = (alto) => {
    if (y + alto > PAGE_BOTTOM) agregarPagina();
  };

  const escribirParrafo = (texto, opciones = {}) => {
    const { size = 8.5, bold = false, color = colors.text, width = CONTENT_WIDTH } = opciones;
    pdf.setFont('helvetica', bold ? 'bold' : 'normal');
    pdf.setFontSize(size);
    pdf.setTextColor(...color);
    const lineas = pdf.splitTextToSize(String(texto), width);
    const altoLinea = size * 0.46 + 1.4;
    asegurarEspacio(lineas.length * altoLinea + 2);
    lineas.forEach((linea) => {
      pdf.text(linea, MARGIN, y);
      y += altoLinea;
    });
    y += 1;
  };

  const dibujarSeccion = (titulo, subtitulo = '') => {
    asegurarEspacio(subtitulo ? 16 : 12);
    y += 2;
    pdf.setFillColor(...colors.blue);
    pdf.roundedRect(MARGIN, y - 4.5, 2, 7, 1, 1, 'F');
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(11);
    pdf.setTextColor(...colors.navy);
    pdf.text(titulo, MARGIN + 6, y + 1);
    y += 6;
    if (subtitulo) {
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(7.5);
      pdf.setTextColor(...colors.muted);
      pdf.text(subtitulo, MARGIN + 6, y + 1);
      y += 5;
    }
  };

  const dibujarIndicadores = (indicadores) => {
    const separacion = 3;
    const ancho = (CONTENT_WIDTH - separacion) / 2;
    const alto = 18;
    for (let indice = 0; indice < indicadores.length; indice += 2) {
      asegurarEspacio(alto + separacion);
      indicadores.slice(indice, indice + 2).forEach((indicador, columna) => {
        const x = MARGIN + columna * (ancho + separacion);
        pdf.setFillColor(...(indicador.destacado ? colors.blueSurface : colors.surface));
        pdf.setDrawColor(...colors.line);
        pdf.roundedRect(x, y, ancho, alto, 2.5, 2.5, 'FD');
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(7.5);
        pdf.setTextColor(...colors.muted);
        pdf.text(indicador.etiqueta, x + 5, y + 5.5);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(12);
        pdf.setTextColor(...(indicador.destacado ? colors.blue : colors.navy));
        pdf.text(String(indicador.valor), x + 5, y + 13);
      });
      y += alto + separacion;
    }
  };

  const dibujarTabla = (encabezados, filas, anchos, mensajeVacio = 'Sin registros para mostrar.') => {
    const altoEncabezado = 8;
    const dibujarEncabezadoTabla = () => {
      pdf.setFillColor(...colors.navy);
      pdf.roundedRect(MARGIN, y, CONTENT_WIDTH, altoEncabezado, 1.5, 1.5, 'F');
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(7);
      pdf.setTextColor(...colors.white);
      let x = MARGIN;
      encabezados.forEach((encabezado, indice) => {
        pdf.text(String(encabezado), x + 2, y + 5.3);
        x += anchos[indice];
      });
      y += altoEncabezado;
    };

    if (!filas.length) {
      escribirParrafo(mensajeVacio, { size: 8, color: colors.muted });
      return;
    }

    asegurarEspacio(altoEncabezado + 8);
    dibujarEncabezadoTabla();
    filas.forEach((fila, filaIndice) => {
      const celdas = fila.map((valor, indice) =>
        pdf.splitTextToSize(String(valor ?? '—'), anchos[indice] - 4)
      );
      const lineasMaximas = Math.max(...celdas.map((celda) => celda.length));
      const altoFila = Math.max(8, lineasMaximas * 3.4 + 3);

      if (y + altoFila > PAGE_BOTTOM) {
        agregarPagina();
        dibujarEncabezadoTabla();
      }

      pdf.setFillColor(...(filaIndice % 2 === 0 ? colors.surface : colors.white));
      pdf.rect(MARGIN, y, CONTENT_WIDTH, altoFila, 'F');
      pdf.setDrawColor(...colors.line);
      pdf.setLineWidth(0.2);
      pdf.line(MARGIN, y + altoFila, MARGIN + CONTENT_WIDTH, y + altoFila);

      let x = MARGIN;
      celdas.forEach((lineas, indice) => {
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(7.2);
        pdf.setTextColor(...colors.text);
        pdf.text(lineas, x + 2, y + 4.2);
        x += anchos[indice];
      });
      y += altoFila;
    });
    y += 4;
  };

  const indicadores = [
    { etiqueta: 'Ingresos cobrados', valor: formatearMonto(ingresosPeriodo.total), destacado: true },
    { etiqueta: 'Pagos aprobados', valor: ingresosPeriodo.cantidad },
    { etiqueta: 'Reservas del período', valor: cantidadReservas },
    { etiqueta: 'Asistencias registradas', valor: cantidadAsistencias },
    { etiqueta: 'Visitas de entrenamiento libre', valor: cantidadIngresosLibres },
    { etiqueta: 'Socios / membresías vigentes al corte', valor: `${sociosActivos} / ${membresiasActivas}` },
  ];

  dibujarEncabezado(true);
  dibujarSeccion('Resumen ejecutivo', `Operación de ${periodo}; socios y membresías son el estado actual al generar el informe.`);
  dibujarIndicadores(indicadores);

  dibujarSeccion('Finanzas registradas', 'El total cobrado no descuenta gastos operativos.');
  escribirParrafo(`Pagos por estado: ${estadosPagoResumen}`, { size: 7.8 });
  dibujarTabla(
    ['Medio de pago', 'Operaciones', 'Ingresos'],
    pagosPorMetodo.slice(0, 3).map((pago) => [
      traducirMetodoSeguro(pago.metodo_pago),
      Number(pago.cantidad),
      formatearMonto(pago.total),
    ]),
    [80, 42, 60],
    'No hubo pagos aprobados durante este período.'
  );

  dibujarSeccion('Actividad y asistencia');
  escribirParrafo(`Reservas por estado: ${estadosReservaResumen}`, { size: 7.8 });
  dibujarTabla(
    ['Actividad', 'Sede', 'Asistencias', 'Socios'],
    asistenciasPorActividad.slice(0, 4).map((asistencia) => [
      asistencia.actividad,
      [asistencia.ubicacion, asistencia.ciudad].filter(Boolean).join(' - ') || 'Sin sede',
      Number(asistencia.cantidad),
      Number(asistencia.socios),
    ]),
    [62, 58, 33, 29],
    'No se registraron asistencias durante este período.'
  );

  escribirParrafo(`Entrenamiento libre por sede: ${visitasPorSedeResumen}`, { size: 7.8 });

  const totalPaginas = pdf.getNumberOfPages();
  for (let pagina = 1; pagina <= totalPaginas; pagina += 1) {
    pdf.setPage(pagina);
    pdf.setDrawColor(...colors.line);
    pdf.setLineWidth(0.3);
    pdf.line(MARGIN, 282, PAGE_WIDTH - MARGIN, 282);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7);
    pdf.setTextColor(...colors.muted);
    pdf.text('FUERZA VITAL  |  Uso interno administrativo', MARGIN, 288);
    pdf.text(`Página ${pagina} de ${totalPaginas}`, PAGE_WIDTH - MARGIN, 288, { align: 'right' });
  }

  pdf.save(`reporte_administrativo_${periodoSeleccionado}.pdf`);
};
