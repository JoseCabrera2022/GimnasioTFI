import axios from 'axios';
import jsPDF from 'jspdf';
import { ENDPOINTS_LOCAL } from '../api/endpoints';
import { convertirImagenABase64, traducirEstado, traducirMetodo } from './conversiones';

const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
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

const fechaPago = (pago) => pago.fecha_aprobado || pago.creado_en;

export const descargarReporteAdministrativo = async (token) => {
  const { data } = await axios.get(ENDPOINTS_LOCAL.REPORTE_ADMIN, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const generatedAt = convertirFecha(data.generadoEn) || new Date();
  const socios = data.socios;
  const pagos = data.pagos;
  const membresias = data.membresias;
  const reservas = data.reservas;
  const planes = data.planes;
  const actividades = data.actividades;
  const pagosDelMes = pagos.filter((pago) => {
    const fecha = convertirFecha(fechaPago(pago));
    return fecha
      && fecha.getFullYear() === generatedAt.getFullYear()
      && fecha.getMonth() === generatedAt.getMonth();
  });
  const pagosAprobadosDelMes = pagosDelMes.filter((pago) => pago.estado === 'approved');
  const ingresosDelMes = pagosAprobadosDelMes.reduce(
    (total, pago) => total + (Number(pago.monto) || 0),
    0
  );
  const membresiasVigentes = membresias.filter((membresia) => {
    const fechaFin = convertirFecha(membresia.fecha_fin);
    return membresia.estado === 'activa' && fechaFin && fechaFin > generatedAt;
  });

  const pagosPorMetodo = new Map();
  pagosAprobadosDelMes.forEach((pago) => {
    const metodo = traducirMetodoSeguro(pago.metodo_pago);
    const acumulado = pagosPorMetodo.get(metodo) || { cantidad: 0, total: 0 };
    acumulado.cantidad += 1;
    acumulado.total += Number(pago.monto) || 0;
    pagosPorMetodo.set(metodo, acumulado);
  });

  const pagosPorEstado = new Map();
  pagosDelMes.forEach((pago) => {
    const estado = traducirEstadoSeguro(pago.estado);
    pagosPorEstado.set(estado, (pagosPorEstado.get(estado) || 0) + 1);
  });

  const membresiasPorPlan = new Map();
  membresiasVigentes.forEach((membresia) => {
    const plan = membresia.plan || 'Plan no disponible';
    membresiasPorPlan.set(plan, (membresiasPorPlan.get(plan) || 0) + 1);
  });

  const sociosPorSede = new Map();
  socios.forEach((socio) => {
    const sede = [socio.ubicacion, socio.ciudad].filter(Boolean).join(' - ') || 'Sin sede';
    sociosPorSede.set(sede, (sociosPorSede.get(sede) || 0) + 1);
  });

  const socioPorId = new Map(socios.map((socio) => [Number(socio.id), socio]));
  const pagosRecientes = [...pagos]
    .sort((a, b) => (convertirFecha(fechaPago(b))?.getTime() || 0) - (convertirFecha(fechaPago(a))?.getTime() || 0))
    .slice(0, 8);
  const reservasProximas = reservas
    .filter((reserva) => {
      const fecha = convertirFecha(reserva.fecha_turno);
      return reserva.estado === 'confirmada' && fecha && fecha >= generatedAt;
    })
    .sort((a, b) => convertirFecha(a.fecha_turno).getTime() - convertirFecha(b.fecha_turno).getTime())
    .slice(0, 8);

  const logo = await convertirImagenABase64('/assets/fuerzavitalgym.png');
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const periodo = capitalizar(generatedAt.toLocaleDateString('es-AR', {
    month: 'long',
    year: 'numeric',
  }));
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
    const separacion = 4;
    const ancho = (CONTENT_WIDTH - separacion) / 2;
    const alto = 21;
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
        pdf.text(indicador.etiqueta, x + 5, y + 6);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(12);
        pdf.setTextColor(...(indicador.destacado ? colors.blue : colors.navy));
        pdf.text(String(indicador.valor), x + 5, y + 15);
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
    { etiqueta: 'Socios activos', valor: socios.length },
    { etiqueta: 'Membresías vigentes', valor: membresiasVigentes.length },
    { etiqueta: 'Ingresos aprobados del mes', valor: formatearMonto(ingresosDelMes), destacado: true },
    { etiqueta: 'Pagos aprobados del mes', valor: pagosAprobadosDelMes.length },
    { etiqueta: 'Planes activos', valor: planes.length },
    { etiqueta: 'Actividades activas', valor: actividades.length },
  ];

  dibujarEncabezado(true);
  dibujarSeccion('Resumen del período', `Actividad registrada durante ${periodo}.`);
  dibujarIndicadores(indicadores);

  dibujarSeccion('Pagos del mes por estado');
  dibujarTabla(
    ['Estado', 'Cantidad'],
    Array.from(pagosPorEstado.entries()).sort((a, b) => b[1] - a[1]),
    [132, 50],
    'No se registraron pagos durante este período.'
  );

  dibujarSeccion('Ingresos aprobados por medio de pago');
  dibujarTabla(
    ['Medio de pago', 'Operaciones', 'Ingresos'],
    Array.from(pagosPorMetodo.entries())
      .sort((a, b) => b[1].total - a[1].total)
      .map(([metodo, resumen]) => [metodo, resumen.cantidad, formatearMonto(resumen.total)]),
    [80, 42, 60],
    'No hubo pagos aprobados durante este período.'
  );

  dibujarSeccion('Últimos pagos registrados', 'Se muestran los 8 movimientos más recientes.');
  dibujarTabla(
    ['Fecha', 'Socio', 'Método', 'Estado', 'Monto'],
    pagosRecientes.map((pago) => [
      formatearFechaHora(fechaPago(pago)),
      pago.socio || socioPorId.get(Number(pago.usuario_id))?.nombre || 'Socio no disponible',
      traducirMetodoSeguro(pago.metodo_pago),
      traducirEstadoSeguro(pago.estado),
      formatearMonto(pago.monto),
    ]),
    [30, 48, 37, 30, 37],
    'No hay pagos registrados.'
  );

  dibujarSeccion('Membresías vigentes por plan');
  dibujarTabla(
    ['Plan', 'Membresías'],
    Array.from(membresiasPorPlan.entries()).sort((a, b) => b[1] - a[1]),
    [132, 50],
    'No hay membresías vigentes.'
  );

  dibujarSeccion('Próximas reservas confirmadas', 'Próximos 8 turnos reservados por socios activos.');
  dibujarTabla(
    ['Turno', 'Socio', 'Actividad', 'Sede'],
    reservasProximas.map((reserva) => {
      const socio = socioPorId.get(Number(reserva.usuario_id));
      return [
        formatearFechaHora(reserva.fecha_turno),
        socio?.nombre || 'Socio no disponible',
        reserva.actividad || 'Actividad no disponible',
        [socio?.ubicacion, socio?.ciudad].filter(Boolean).join(' - ') || 'Sin sede',
      ];
    }),
    [38, 45, 54, 45],
    'No hay reservas confirmadas próximas.'
  );

  dibujarSeccion('Socios activos por sede');
  dibujarTabla(
    ['Sede', 'Socios'],
    Array.from(sociosPorSede.entries()).sort((a, b) => b[1] - a[1]),
    [132, 50],
    'No hay socios activos.'
  );

  dibujarSeccion('Oferta activa');
  escribirParrafo('Planes disponibles', { bold: true, size: 8 });
  dibujarTabla(
    ['Plan', 'Tipo', 'Precio'],
    planes.map((plan) => [plan.nombre || 'Plan sin nombre', capitalizar(plan.tipo), formatearMonto(plan.precio)]),
    [78, 48, 56],
    'No hay planes activos.'
  );
  escribirParrafo('Actividades disponibles', { bold: true, size: 8 });
  dibujarTabla(
    ['Actividad', 'Sede'],
    actividades.map((actividad) => [
      actividad.nombre || 'Actividad sin nombre',
      [actividad.ubicacion, actividad.ciudad].filter(Boolean).join(' - ') || 'Sin sede',
    ]),
    [100, 82],
    'No hay actividades activas.'
  );

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

  const fechaArchivo = [
    generatedAt.getFullYear(),
    String(generatedAt.getMonth() + 1).padStart(2, '0'),
    String(generatedAt.getDate()).padStart(2, '0'),
  ].join('-');
  pdf.save(`reporte_administrativo_${fechaArchivo}.pdf`);
};
