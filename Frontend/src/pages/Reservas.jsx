import { useState, useEffect } from 'react';
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

  const fetchReservas = async () => {
    try {
      const res = await axios.get(ENDPOINTS_LOCAL.RESERVAS, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReservas(res.data);
    } catch (error) {
      setTipoMensaje('error');
      setMensaje(error.response?.data?.error || 'Error al obtener reservas');
    }
  };

  useEffect(() => {
    if (token) fetchReservas();
  }, [token]);

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
          {reservas.map(r => (
            <li key={r.id}>
              <span>
                {r.actividad} - {new Date(r.fecha).toLocaleString()} 
                <span className={`estado-badge ${r.estado}`}>{r.estado}</span>
              </span>
              {r.estado !== 'cancelada' && (
                <button className="btn-cancelar" onClick={() => cancelarReserva(r.id)}>Cancelar</button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Reservas;
