import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';
import { ENDPOINTS_LOCAL, API_LOCAL } from '../api/endpoints';
import '../styles/Actividades.css';
import defaultImagen from '/assets/fuerzavitalgym.png';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../routers/routes';

function Actividades() {
  const { token } = useAuthStore();
  const [actividades, setActividades] = useState([]);
  const [nombreFiltro, setNombreFiltro] = useState('');
  const [diaFiltro, setDiaFiltro] = useState('');
  const [horaFiltro, setHoraFiltro] = useState('');
  const [mensaje, setMensaje] = useState(null);
  const [tipoMensaje, setTipoMensaje] = useState('');
  const navigate = useNavigate();

  const getStartOfWeek = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  };

  const addDays = (date, days) => {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
  };

  const startOfWeek = getStartOfWeek(new Date());
  const endOfWeek = addDays(startOfWeek, 7);

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
      fetchActividades();
    } catch (error) {
      setTipoMensaje('error');
      setMensaje(error.response?.data?.error || 'Error al crear reserva');
    }
  };

  const actividadesSemana = actividades.filter(a => {
    const fecha = new Date(a.fecha);
    return fecha >= startOfWeek && fecha < endOfWeek;
  });

  const actividadesFiltradas = actividadesSemana.filter(a => {
    const fecha = new Date(a.fecha);
    const nombreMatch = nombreFiltro ? a.nombre.toLowerCase().includes(nombreFiltro.toLowerCase()) : true;
    const diaMatch = diaFiltro ? fecha.toLocaleDateString('es-AR') === diaFiltro : true;
    const horaMatch = horaFiltro ? fecha.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) === horaFiltro : true;
    return nombreMatch && diaMatch && horaMatch;
  });

  const diasUnicos = [...new Set(actividadesSemana.map(a => new Date(a.fecha).toLocaleDateString('es-AR')))];
  const nombresUnicos = [...new Set(actividadesSemana.map(a => a.nombre))];
  const horasUnicos = [...new Set(actividadesSemana.map(a => new Date(a.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })))];

  return (
    <div className="actividades-container">
      <h2>🎯 Actividades disponibles esta semana</h2>

      {mensaje && (
        <div className={`mensaje ${tipoMensaje}`}>
          <span className="mensaje-texto">{mensaje}</span>
          {mensaje.includes('membresía') && (
            <button className="btn-link" onClick={() => navigate(ROUTES.MEMBRESIAS)}>
              Ver Membresías
            </button>
          )}
          {mensaje.includes('Ya tienes una reserva') && (
            <button className="btn-link" onClick={() => navigate(ROUTES.RESERVAS)}>
              Ir a Mis Reservas
            </button>
          )}
        </div>
      )}

      <div className="filtros-actividades">
        <select value={nombreFiltro} onChange={e => setNombreFiltro(e.target.value)}>
          <option value="">Todas las actividades</option>
          {nombresUnicos.map(n => <option key={n} value={n}>{n}</option>)}
        </select>
        <select value={diaFiltro} onChange={e => setDiaFiltro(e.target.value)}>
          <option value="">Todos los días</option>
          {diasUnicos.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <select value={horaFiltro} onChange={e => setHoraFiltro(e.target.value)}>
          <option value="">Todos los horarios</option>
          {horasUnicos.map(h => <option key={h} value={h}>{h}</option>)}
        </select>
      </div>

      {actividadesFiltradas.length === 0 ? (
        <p>No hay actividades que coincidan con los filtros.</p>
      ) : (
        <ul className="actividades-list">
          {actividadesFiltradas.map(a => (
            <li key={a.turno_id}>
              <div className="actividad-card">
                <div className="actividad-foto">
                  <img src={a.foto ? `${API_LOCAL}${a.foto}` : defaultImagen} alt={a.nombre} />
                </div>
                <div className="actividad-info">
                  <h4>{a.nombre}</h4>
                  <p><strong>Fecha:</strong> {new Date(a.fecha).toLocaleString()}</p>
                  <p><strong>Cupo:</strong> {a.cupo_disponible} / {a.cupo_maximo}</p>
                  <button onClick={() => crearReserva(a.turno_id)}>Reservar</button>
                </div>
                <div className="actividad-descripcion">
                  <p>{a.descripcion}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Actividades;
