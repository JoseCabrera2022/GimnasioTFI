import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { generarPDF } from '../utils/pdfGenerator';
import { QRCodeCanvas } from 'qrcode.react';
import { capitalizarPrimeraLetra, traducirEstado, traducirMetodo } from '../utils/conversiones';
import { ENDPOINTS } from '../api/endpoints';
import { ROUTES } from '../routers/routes';
import '../styles/PagoResultado.css';

const formatearMonto = (monto) => new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 2,
}).format(Number(monto) || 0);

const formatearFecha = (valor) => {
  if (!valor) return '—';
  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) return '—';
  return fecha.toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  });
};

function PagoResultado() {
  const location = useLocation();
  const navigate = useNavigate();
  const query = new URLSearchParams(location.search);
  const paymentId = query.get('payment_id');
  const estadoQuery = query.get('status');
  const estado = estadoQuery || (
    location.pathname.includes('fallido') ? 'rejected'
      : location.pathname.includes('exitoso') ? 'approved'
        : 'pending'
  );
  const [detallePago, setDetallePago] = useState(null);
  const [error, setError] = useState(null);
  const estadoVerificado = detallePago?.estado || estado;

  useEffect(() => {
    if (!paymentId) return;
    let vigente = true;

    const fetchPago = async () => {
      try {
        const res = await axios.get(ENDPOINTS.VERIFICAR_PAGO, {
          params: { payment_id: paymentId },
        });
        if (vigente) setDetallePago(res.data);
      } catch (requestError) {
        console.error('Error al verificar pago:', requestError);
        if (vigente) setError('No se pudo verificar el pago. Intenta más tarde.');
      }
    };

    fetchPago();
    return () => {
      vigente = false;
    };
  }, [paymentId]);

  const volverAlInicio = () => navigate(ROUTES.HOME);

  if (!paymentId || error || !detallePago) {
    const titulo = !paymentId
      ? 'No pudimos identificar el pago'
      : error
        ? 'No pudimos verificar el pago'
        : 'Verificando tu pago';
    const descripcion = !paymentId
      ? 'No recibimos un identificador de pago. Consulta el historial antes de volver a intentarlo.'
      : error || 'Estamos consultando el estado confirmado por Mercado Pago.';

    return (
      <section className="pago-resultado-page">
        <section className="comprobante-estado" aria-live="polite">
          <div className={`comprobante-estado-icono ${error || !paymentId ? 'error' : 'cargando'}`}>
            <i
              className={`fa-solid ${error || !paymentId ? 'fa-circle-exclamation' : 'fa-spinner fa-spin'}`}
              aria-hidden="true"
            ></i>
          </div>
          <span className="comprobante-eyebrow">FUERZA VITAL GYM</span>
          <h1>{titulo}</h1>
          <p>{descripcion}</p>
          <div className="comprobante-estado-acciones">
            {!paymentId && (
              <button type="button" className="pago-button primary" onClick={() => navigate(ROUTES.HISTORIALPAGOS)}>
                Ver historial de pagos
              </button>
            )}
            <button type="button" className="pago-button secondary" onClick={volverAlInicio}>
              Volver al inicio
            </button>
          </div>
        </section>
      </section>
    );
  }

  const beneficios = detallePago.metadata?.beneficios
    ? detallePago.metadata.beneficios.split(',').map((beneficio) => beneficio.trim()).filter(Boolean)
    : [];
  const mostrarMembresia = estadoVerificado === 'approved';
  const estadoPendiente = ['pending', 'in_process', 'in_mediation', 'authorized'].includes(estadoVerificado);

  return (
    <section className="pago-resultado-page">
      <div className="botones-superior">
        <button type="button" className="pago-button primary" onClick={() => generarPDF(detallePago, paymentId)}>
          <i className="fa-solid fa-file-arrow-down" aria-hidden="true"></i>
          Descargar comprobante
        </button>
        <button type="button" className="pago-button secondary" onClick={volverAlInicio}>
          Volver al inicio
        </button>
      </div>

      <article className="comprobante-visual">
        <header className="comprobante-header">
          <div className="comprobante-marca">
            <img src="/assets/fuerzavitalgym.png" alt="" className="comprobante-logo" />
            <div>
              <span className="comprobante-eyebrow">FUERZA VITAL GYM</span>
              <h1>Comprobante de pago</h1>
            </div>
          </div>
          <span className={`estado-badge ${estadoVerificado}`}>
            <i
              className={`fa-solid ${mostrarMembresia ? 'fa-circle-check' : estadoPendiente ? 'fa-clock' : 'fa-circle-xmark'}`}
              aria-hidden="true"
            ></i>
            {traducirEstado(estadoVerificado)}
          </span>
        </header>

        <section className="comprobante-total" aria-label="Importe del pago">
          <div>
            <span className="comprobante-label">Importe</span>
            <strong>{formatearMonto(detallePago.monto)}</strong>
          </div>
          <span className="comprobante-moneda">ARS</span>
        </section>

        <section className="comprobante-detalles" aria-label="Detalles de la operación">
          <h2>Detalles de la operación</h2>
          <div className="comprobante-datos">
            <div className="dato-comprobante">
              <span>Referencia</span>
              <strong>{paymentId}</strong>
            </div>
            <div className="dato-comprobante">
              <span>Fecha y hora</span>
              <strong>{formatearFecha(detallePago.fecha)}</strong>
            </div>
            <div className="dato-comprobante">
              <span>Medio de pago</span>
              <strong>{detallePago.metodo ? traducirMetodo(detallePago.metodo) : 'No informado'}</strong>
            </div>
            <div className="dato-comprobante">
              <span>Correo asociado</span>
              <strong>{detallePago.email || 'No informado'}</strong>
            </div>
            <div className="dato-comprobante">
              <span>Plan</span>
              <strong>{detallePago.metadata?.nombre || 'No informado'}</strong>
            </div>
            <div className="dato-comprobante">
              <span>Duración</span>
              <strong>{capitalizarPrimeraLetra(detallePago.metadata?.duracion) || 'No informada'}</strong>
            </div>
          </div>
        </section>

        {beneficios.length > 0 && (
          <section className="comprobante-beneficios">
            <h2>Beneficios incluidos</h2>
            <ul>
              {beneficios.map((beneficio, indice) => (
                <li key={`${beneficio}-${indice}`}>
                  <i className="fa-solid fa-check" aria-hidden="true"></i>
                  <span>{beneficio}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className="pago-resultado-acciones">
          {mostrarMembresia ? (
            <button type="button" className="pago-button primary" onClick={() => navigate(ROUTES.MEMBRESIAS)}>
              Ver mi membresía
            </button>
          ) : estadoPendiente ? (
            <p>El pago todavía no figura como aprobado. Puedes consultar su estado en el historial.</p>
          ) : (
            <button type="button" className="pago-button primary" onClick={() => navigate(ROUTES.PLANES)}>
              Volver a los planes
            </button>
          )}
          <button type="button" className="pago-button secondary" onClick={() => navigate(ROUTES.HISTORIALPAGOS)}>
            Historial de pagos
          </button>
        </div>

        <aside className="comprobante-verificacion">
          <div>
            <strong>Comprobante digital</strong>
            <p>Escanea el código para volver a consultar el estado de esta operación.</p>
          </div>
          <QRCodeCanvas value={window.location.href} size={88} includeMargin />
        </aside>

        <footer className="comprobante-footer">
          <span>Gracias por entrenar con nosotros.</span>
          <a href={ROUTES.HOME}>Fuerza Vital Gym</a>
        </footer>
      </article>
    </section>
  );
}

export default PagoResultado;
