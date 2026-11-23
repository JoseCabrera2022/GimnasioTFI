import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import http from '../utils/axiosConfig';
import { ENDPOINTS_LOCAL } from '../api/endpoints';
import '../styles/Membresias.css';
import SessionBanner from '../components/SessionBanner';
import { capitalizarPrimeraLetra, traducirEstado } from '../utils/conversiones';
import { ROUTES } from '../routers/routes';
import { useNavigate } from 'react-router-dom';

function Membresias() {
  const { usuario, token, sessionExpired } = useAuthStore();
  const [membresias, setMembresias] = useState([]);
  const [horaActual, setHoraActual] = useState(new Date());
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [intentoCarga, setIntentoCarga] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    let vigente = true;

    const fetchMembresias = async () => {
      if (!token || sessionExpired) {
        setCargando(false);
        return;
      }

      setCargando(true);
      setError('');
      try {
        const res = await http.get(ENDPOINTS_LOCAL.MEMBRESIAS);
        if (!Array.isArray(res.data)) {
          throw new Error('La respuesta de membresías no es válida.');
        }
        if (vigente) setMembresias(res.data);
      } catch (requestError) {
        if (vigente) {
          setError(requestError.response?.data?.error || 'No se pudieron cargar tus membresías.');
        }
      } finally {
        if (vigente) setCargando(false);
      }
    };

    fetchMembresias();
    return () => {
      vigente = false;
    };
  }, [token, sessionExpired, intentoCarga]);

  useEffect(() => {
    const interval = setInterval(() => setHoraActual(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  if (!usuario || sessionExpired) {
    return <SessionBanner />;
  }

  const obtenerColor = (membresia) => {
    const fechaFin = new Date(membresia.fecha_fin);
    const diasRestantes = Math.floor((fechaFin - horaActual) / 86400000);
    if (membresia.estado === 'cancelada' || membresia.estado === 'vencida' || fechaFin <= horaActual) {
      return 'rojo';
    }
    if (membresia.estado === 'pendiente' || diasRestantes <= 7) return 'amarillo';
    return 'verde';
  };

  const obtenerCuentaRegresiva = (membresia) => {
    if (membresia.estado !== 'activa') return traducirEstado(membresia.estado);

    const diff = new Date(membresia.fecha_fin) - horaActual;
    if (diff <= 0) return 'Vencida';

    const dias = Math.floor(diff / 86400000);
    const horas = Math.floor((diff / 3600000) % 24);
    const minutos = Math.floor((diff / 60000) % 60);
    const segundos = Math.floor((diff / 1000) % 60);
    return `${dias}d ${horas}h ${minutos}m ${segundos}s`;
  };

  const tieneMembresiaActiva = membresias.some((membresia) => (
    membresia.estado === 'activa' && new Date(membresia.fecha_fin) > horaActual
  ));

  return (
    <section className="membresias-container">
      <header className="membresias-header">
        <div>
          <span className="membresias-eyebrow">MI CUENTA</span>
          <h1>Mi membresía</h1>
          <p>Consulta el plan contratado y el tiempo de vigencia.</p>
        </div>
        <button
          type="button"
          className="membresias-action"
          onClick={() => navigate(ROUTES.HISTORIALPAGOS)}
        >
          <i className="fa-solid fa-receipt" aria-hidden="true"></i>
          Historial de pagos
        </button>
      </header>

      {!cargando && !error && !tieneMembresiaActiva && (
        <div className="membresias-notice">
          <div>
            <strong>{membresias.length ? 'No tienes una membresía vigente' : 'Todavía no tienes membresías'}</strong>
            <p>
              {membresias.length
                ? 'Puedes consultar tus membresías anteriores o elegir un nuevo plan.'
                : 'Explora los planes disponibles para comenzar a entrenar.'}
            </p>
          </div>
          <button type="button" className="membresias-action primary" onClick={() => navigate(ROUTES.PLANES)}>
            Ver planes
          </button>
        </div>
      )}

      {cargando ? (
        <p className="membresias-state">Cargando tus membresías...</p>
      ) : error ? (
        <div className="membresias-state error" role="alert">
          <p>{error}</p>
          <button type="button" className="membresias-action" onClick={() => setIntentoCarga((actual) => actual + 1)}>
            Reintentar
          </button>
        </div>
      ) : membresias.length === 0 ? null : (
        <div className="membresias-table-wrap">
          <table className="membresias-table">
            <thead>
              <tr>
                <th>Estado</th>
                <th>Plan</th>
                <th>Duración</th>
                <th>Inicio</th>
                <th>Vencimiento</th>
                <th>Tiempo restante</th>
              </tr>
            </thead>
            <tbody>
              {membresias.map((membresia) => (
                <tr key={membresia.id} className={obtenerColor(membresia)}>
                  <td>{traducirEstado(membresia.estado)}</td>
                  <td>{membresia.plan}</td>
                  <td>{capitalizarPrimeraLetra(membresia.duracion)}</td>
                  <td>{new Date(membresia.fecha_inicio).toLocaleDateString('es-AR')}</td>
                  <td>{new Date(membresia.fecha_fin).toLocaleDateString('es-AR')}</td>
                  <td>{obtenerCuentaRegresiva(membresia)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default Membresias;
