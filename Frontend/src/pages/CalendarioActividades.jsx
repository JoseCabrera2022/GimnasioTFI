import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';
import { ENDPOINTS_LOCAL } from '../api/endpoints';
import '../styles/CalendarioActividades.css';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../routers/routes';

function CalendarioActividades() {
  const { token } = useAuthStore();
  const [actividades, setActividades] = useState([]);
  const [currentWeekStart, setCurrentWeekStart] = useState(getStartOfWeek(new Date()));
  const [mensaje, setMensaje] = useState(null);
  const [tipoMensaje, setTipoMensaje] = useState('');
  const navigate = useNavigate();

  // 🔹 Helper: obtener inicio de semana (lunes)
  function getStartOfWeek(date) {
    const d = new Date(date);
    const day = d.getDay(); // 0 domingo, 1 lunes...
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // mover a lunes
    return new Date(d.setDate(diff));
  }

  // 🔹 Helper: sumar semanas
  function addWeeks(date, weeks) {
    const d = new Date(date);
    d.setDate(d.getDate() + weeks * 7);
    return d;
  }

  const fetchActividades = async () => {
    try {
      const res = await axios.get(ENDPOINTS_LOCAL.ACTIVIDADES, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setActividades(res.data);
    } catch (error) {
      setTipoMensaje('error');
      setMensaje(error.response?.data?.error || 'Error al obtener actividades');
    }
  };

  useEffect(() => {
    if (token) fetchActividades();
  }, [token]);

  const crearReserva = async (turnoId) => {
    try {
      await axios.post(ENDPOINTS_LOCAL.RESERVAS, { turno_id: turnoId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTipoMensaje('success');
      setMensaje('Reserva creada con éxito');
      fetchActividades(); // refrescar lista y disponibilidad
    } catch (error) {
      setTipoMensaje('error');
      setMensaje(error.response?.data?.error || 'Error al crear reserva');
    }
  };

  // 🔹 Filtrar turnos de la semana actual
  const weekEnd = addWeeks(currentWeekStart, 1);
  const turnosSemana = actividades.filter(act => {
    const fecha = new Date(act.fecha);
    return fecha >= currentWeekStart && fecha < weekEnd;
  });

  return (
    <div className="calendario-container">
      <h2>🗓️ Calendario de Actividades</h2>

      {mensaje && (
        <div className={`mensaje ${tipoMensaje}`}>
          <p>{mensaje}</p>
          {mensaje.includes('membresía') && (
            <button 
              className="btn-link" 
              onClick={() => navigate(ROUTES.MEMBRESIAS)}
            >
              Ver Membresías
            </button>
          )}
          {mensaje.includes('Ya tienes una reserva') && (
            <button 
              className="btn-link" 
              onClick={() => navigate(ROUTES.RESERVAS)}
            >
              Ir a Mis Reservas
            </button>
          )}
        </div>
      )}

      {/* 🔹 Navegación semanal */}
      <div className="calendario-nav">
        <button 
          className="calendario-button" 
          onClick={() => setCurrentWeekStart(addWeeks(currentWeekStart, -1))}
        >
          ⬅️ Semana anterior
        </button>
        <span>
          {currentWeekStart.toLocaleDateString('es-AR')} - {weekEnd.toLocaleDateString('es-AR')}
        </span>
        <button 
          className="calendario-button" 
          onClick={() => setCurrentWeekStart(addWeeks(currentWeekStart, 1))}
        >
          Semana siguiente ➡️
        </button>
      </div>

      <div className="calendario-grid">
        {[...Array(7)].map((_, i) => {
          const diaFecha = new Date(currentWeekStart);
          diaFecha.setDate(currentWeekStart.getDate() + i);

          const diaClave = diaFecha.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'short' });
          const turnosDia = turnosSemana.filter(act => {
            const fecha = new Date(act.fecha);
            return fecha.toDateString() === diaFecha.toDateString();
          });

          return (
            <div key={diaClave} className="calendario-dia">
              <h3>{diaClave}</h3>
              {turnosDia.length === 0 ? (
                <p className="sin-turnos">Sin actividades</p>
              ) : (
                turnosDia.map(turno => (
                  <div key={turno.turno_id} className="calendario-turno">
                    <p><strong>{turno.nombre}</strong></p>
                    <p>{new Date(turno.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    {/* 🔹 Mostrar cupo dinámico */}
                    <p>Cupo: {turno.cupo_disponible} / {turno.cupo_maximo}</p>
                    <button onClick={() => crearReserva(turno.turno_id)}>Reservar</button>
                  </div>
                ))
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default CalendarioActividades;
