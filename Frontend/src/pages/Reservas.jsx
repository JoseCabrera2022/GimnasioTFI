import { useCallback, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';
import { ENDPOINTS_LOCAL } from '../api/endpoints';
import '../styles/Reservas.css';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../routers/routes';

function Reservas() {
  const { token } = useAuthStore();
  const [reservas, setReservas] = useState([]);
  const [mensaje, setMensaje] = useState(null);
  const [tipoMensaje, setTipoMensaje] = useState('');
  const navigate = useNavigate();

  const fetchReservas = useCallback(async () => {
    try {
      const res = await axios.get(ENDPOINTS_LOCAL.RESERVAS, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReservas(res.data);
    } catch (error) {
      setTipoMensaje('error');
      setMensaje(error.response?.data?.error || 'Error al obtener reservas');
    }
  }, [token]);

  useEffect(() => {
    if (token) fetchReservas();
    const intervalId = token ? window.setInterval(fetchReservas, 60_000) : null;
    return () => {
      if (intervalId) window.clearInterval(intervalId);
    };
  }, [token, fetchReservas]);

  const cancelarReserva = async (id) => {
    try {
      await axios.delete(`${ENDPOINTS_LOCAL.RESERVAS}/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTipoMensaje('success');
      setMensaje('Reserva cancelada con éxito');
      fetchReservas();
    } catch (error) {
      setTipoMensaje('error');
      setMensaje(error.response?.data?.error || 'Error al cancelar reserva');
    }
  };

  return (
    <div className="reservas-container">
      <h2>📅 Mis Reservas</h2>
      <aside className="reservas-policy" role="note">
        Puedes cancelar hasta 24 horas antes del turno. Si reservas con menos anticipación, no podrás cancelarla.
        Si no se registra tu asistencia, la reserva expira una hora después del inicio.
      </aside>

      {/* 🔹 Mensaje dinámico */}
      {mensaje && (
        <div className={`mensaje ${tipoMensaje}`}>
          <p>{mensaje}</p>
          {/* Si se canceló una reserva, ofrecer ir a Actividades */}
          {mensaje.includes('cancelada') && (
            <button 
              className="btn-link" 
              onClick={() => navigate(ROUTES.ACTIVIDADES)}
            >
              Reservar otra actividad
            </button>
          )}
          {/* Si no hay reservas, ofrecer ir a Actividades */}
          {mensaje.includes('No tienes reservas') && (
            <button 
              className="btn-link" 
              onClick={() => navigate(ROUTES.ACTIVIDADES)}
            >
              Ver Actividades
            </button>
          )}
        </div>
      )}

      {reservas.length === 0 ? (
        <div className="reservas-empty">
          <p>⚠️ No tienes reservas ⚠️</p>
          <button 
            className="reservas-btn-link" 
            onClick={() => navigate(ROUTES.ACTIVIDADES)}
          >
            Ver Actividades
          </button>
        </div>
      ) : (
        <ul className="reservas-list">
          {reservas.map((r) => {
            const puedeCancelar = Number(r.puede_cancelar) === 1;
            const etiquetasEstado = {
              confirmada: 'Confirmada',
              cancelada: 'Cancelada',
              expirada: 'Expirada',
              asistida: 'Asistida',
              pendiente: 'Pendiente',
            };

            return (
              <li key={r.id}>
                <div className="reserva-detalle">
                  <span>
                    {r.actividad} - {new Date(r.fecha).toLocaleString()}
                    <span className={`estado-badge ${r.estado}`}>
                      {etiquetasEstado[r.estado] || r.estado}
                    </span>
                  </span>
                  {r.estado === 'confirmada' && !puedeCancelar && (
                    <small className="reservas-cancelacion-cerrada">
                      Ya no se puede cancelar: faltan menos de 24 horas para el turno.
                    </small>
                  )}
                </div>
                {puedeCancelar && (
                  <button className="btn-cancelar" onClick={() => cancelarReserva(r.id)}>Cancelar</button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default Reservas;
