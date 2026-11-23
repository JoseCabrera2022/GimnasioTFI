import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import http from '../utils/axiosConfig';
import { ENDPOINTS_LOCAL } from '../api/endpoints';
import '../styles/HistorialPagos.css';
import { capitalizarPrimeraLetra, traducirEstado, traducirMetodo } from '../utils/conversiones';
import { ROUTES } from '../routers/routes';
import { useNavigate } from 'react-router-dom';
import SessionBanner from '../components/SessionBanner';

function HistorialPagos() {
  const { usuario, token, sessionExpired } = useAuthStore();
  const [pagos, setPagos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [intentoCarga, setIntentoCarga] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    let vigente = true;

    const fetchPagos = async () => {
      if (!token || sessionExpired) {
        setCargando(false);
        return;
      }

      setCargando(true);
      setError('');
      try {
        const res = await http.get(ENDPOINTS_LOCAL.HISTORIALPAGOS);
        if (!Array.isArray(res.data)) {
          throw new Error('La respuesta del historial no es válida.');
        }
        if (vigente) setPagos(res.data);
      } catch (requestError) {
        if (vigente) {
          setError(requestError.response?.data?.error || 'No se pudo cargar el historial de pagos.');
        }
      } finally {
        if (vigente) setCargando(false);
      }
    };

    fetchPagos();
    return () => {
      vigente = false;
    };
  }, [token, sessionExpired, intentoCarga]);

  if (!usuario || sessionExpired) return <SessionBanner />;

  return (
    <section className="historial-container">
      <header className="historial-header">
        <div>
          <span className="historial-eyebrow">MI CUENTA</span>
          <h1>Historial de pagos</h1>
          <p>Consulta el estado y los datos de tus transacciones.</p>
        </div>
        <button
          type="button"
          className="historial-action"
          onClick={() => navigate(ROUTES.MEMBRESIAS)}
        >
          <i className="fa-solid fa-id-card" aria-hidden="true"></i>
          Mi membresía
        </button>
      </header>

      {cargando ? (
        <p className="historial-state">Cargando tus pagos...</p>
      ) : error ? (
        <div className="historial-state error" role="alert">
          <p>{error}</p>
          <button type="button" className="historial-action" onClick={() => setIntentoCarga((actual) => actual + 1)}>
            Reintentar
          </button>
        </div>
      ) : pagos.length === 0 ? (
        <div className="historial-empty">
          <p>Todavía no tienes pagos registrados.</p>
          <button type="button" className="historial-action primary" onClick={() => navigate(ROUTES.PLANES)}>
            Ver planes
          </button>
        </div>
      ) : (
        <div className="historial-table-wrap">
          <table className="historial-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Plan</th>
                <th>Duración</th>
                <th>Monto</th>
                <th>Método</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {pagos.map((pago) => (
                <tr key={pago.id}>
                  <td>{pago.fecha_pago ? new Date(pago.fecha_pago).toLocaleString('es-AR') : '—'}</td>
                  <td>{pago.plan || '—'}</td>
                  <td>{capitalizarPrimeraLetra(pago.duracion) || '—'}</td>
                  <td>{pago.monto == null ? '—' : `$${Number(pago.monto).toLocaleString('es-AR')}`}</td>
                  <td>{pago.metodo_pago ? traducirMetodo(pago.metodo_pago) : '—'}</td>
                  <td>
                    <span className={`historial-status ${pago.estado}`}>
                      {traducirEstado(pago.estado)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default HistorialPagos;
