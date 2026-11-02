import axios from 'axios';
import jsPDF from 'jspdf';
import { ENDPOINTS_LOCAL } from '../api/endpoints';

const formatearMonto = (monto) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(Number(monto) || 0);

const formatearFecha = (fecha) => {
  if (!fecha) return 'Sin fecha';
  const valor = new Date(fecha);
  return Number.isNaN(valor.getTime()) ? 'Sin fecha' : valor.toLocaleString('es-AR');
};

export const descargarReporteAdministrativo = async (token) => {
  const { data } = await axios.get(ENDPOINTS_LOCAL.REPORTE_ADMIN, {
    headers: { Authorization: `Bearer ${token}` }
  });

  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const margin = 14;
  const maxY = 280;
  const contentWidth = 182;
  let y = 18;

  const ensureSpace = (height) => {
    if (y + height > maxY) {
      pdf.addPage();
      y = 18;
    }
  };

  const writeParagraph = (text, { size = 9, bold = false, indent = 0 } = {}) => {
    pdf.setFont('helvetica', bold ? 'bold' : 'normal');
    pdf.setFontSize(size);
    const lines = pdf.splitTextToSize(String(text), contentWidth - indent);
    lines.forEach((line) => {
      ensureSpace(size * 0.45 + 2);
      pdf.text(line, margin + indent, y);
      y += size * 0.45 + 2;
    });
  };

  const writeSection = (title) => {
    ensureSpace(12);
    y += 3;
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(13);
    pdf.text(title, margin, y);
    y += 7;
  };

  const pagosAprobados = data.pagos.filter((pago) => pago.estado === 'approved');
  const totalPagos = pagosAprobados.reduce((total, pago) => total + (Number(pago.monto) || 0), 0);
  const totalesPorSocio = new Map();
  pagosAprobados.forEach((pago) => {
    const socioId = Number(pago.usuario_id);
    totalesPorSocio.set(socioId, (totalesPorSocio.get(socioId) || 0) + (Number(pago.monto) || 0));
  });

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(18);
  pdf.text('Reporte administrativo del gimnasio', margin, y);
  y += 8;
  writeParagraph(`Generado: ${formatearFecha(data.generadoEn)}`);
  writeParagraph(`Socios activos: ${data.socios.length}`);
  writeParagraph(`Pagos aprobados: ${pagosAprobados.length}`);
  writeParagraph(`Total de pagos realizados: ${formatearMonto(totalPagos)}`, { bold: true });

  writeSection('Socios activos y relaciones');
  if (data.socios.length === 0) writeParagraph('No hay socios activos.');

  data.socios.forEach((socio) => {
    const pagosSocio = data.pagos.filter((pago) => Number(pago.usuario_id) === Number(socio.id));
    const membresiasSocio = data.membresias.filter((membresia) => Number(membresia.usuario_id) === Number(socio.id));
    const reservasSocio = data.reservas.filter((reserva) => Number(reserva.usuario_id) === Number(socio.id));
    const totalSocio = totalesPorSocio.get(Number(socio.id)) || 0;

    writeParagraph(socio.nombre, { size: 11, bold: true });
    writeParagraph(`Correo: ${socio.correo_electronico || 'Sin correo'} | Teléfono: ${socio.telefono || 'Sin teléfono'}`, { indent: 3 });
    writeParagraph(`Sede: ${[socio.ubicacion, socio.ciudad].filter(Boolean).join(' - ') || 'Sin sede'} | Pagos aprobados acumulados: ${formatearMonto(totalSocio)}`, { indent: 3 });

    writeParagraph('Planes y membresías:', { bold: true, indent: 3 });
    if (membresiasSocio.length === 0) {
      writeParagraph('Sin membresías registradas.', { indent: 6 });
    } else {
      membresiasSocio.forEach((membresia) => {
        writeParagraph(
          `${membresia.plan || 'Plan no disponible'}${membresia.plan_inactivo ? ' (inactivo)' : ''} (${membresia.tipo_plan || 'sin tipo'}) - ${membresia.duracion || 'duración no disponible'} | Estado: ${membresia.estado} | ${formatearFecha(membresia.fecha_inicio)} a ${formatearFecha(membresia.fecha_fin)}`,
          { indent: 6 }
        );
      });
    }

    writeParagraph('Pagos:', { bold: true, indent: 3 });
    if (pagosSocio.length === 0) {
      writeParagraph('Sin pagos registrados.', { indent: 6 });
    } else {
      pagosSocio.forEach((pago) => {
        writeParagraph(
          `${formatearFecha(pago.fecha_aprobado || pago.creado_en)} | ${formatearMonto(pago.monto)} | Estado: ${pago.estado} | Método: ${pago.metodo_pago || 'No informado'}`,
          { indent: 6 }
        );
      });
    }

    writeParagraph('Actividades y reservas:', { bold: true, indent: 3 });
    if (reservasSocio.length === 0) {
      writeParagraph('Sin reservas registradas.', { indent: 6 });
    } else {
      reservasSocio.forEach((reserva) => {
        writeParagraph(
          `${reserva.actividad || 'Actividad no disponible'}${reserva.actividad_inactiva ? ' (inactiva)' : ''} | Turno: ${formatearFecha(reserva.fecha_turno)} | Reserva: ${reserva.estado}`,
          { indent: 6 }
        );
      });
    }
    y += 2;
  });

  writeSection('Planes activos');
  if (data.planes.length === 0) writeParagraph('No hay planes activos.');
  data.planes.forEach((plan) => {
    writeParagraph(`${plan.nombre || 'Plan sin nombre'} (${plan.tipo}) - ${formatearMonto(plan.precio)}`);
  });

  writeSection('Actividades activas');
  if (data.actividades.length === 0) writeParagraph('No hay actividades activas.');
  data.actividades.forEach((actividad) => {
    const sede = [actividad.ubicacion, actividad.ciudad].filter(Boolean).join(' - ');
    writeParagraph(`${actividad.nombre}${sede ? ` | Sede: ${sede}` : ''}`);
  });

  for (let pagina = 1; pagina <= pdf.getNumberOfPages(); pagina += 1) {
    pdf.setPage(pagina);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.text(`Página ${pagina} de ${pdf.getNumberOfPages()}`, 196, 287, { align: 'right' });
  }

  pdf.save(`reporte_administrativo_${new Date().toISOString().slice(0, 10)}.pdf`);
};
