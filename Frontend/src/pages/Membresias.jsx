// src/pages/Membresias.jsx
import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import http from '../utils/axiosConfig';
import { ENDPOINTS_LOCAL } from '../api/endpoints';
import '../styles/Membresias.css';
import SessionBanner from '../components/SessionBanner';
import { traducirEstado, traducirMetodo } from '../utils/conversiones';
import { ROUTES } from '../routers/routes';
import { useNavigate } from 'react-router-dom';

function Membresias() {
  const { usuario, token, sessionExpired } = useAuthStore();
  const [membresias, setMembresias] = useState([]);
  const [horaActual, setHoraActual] = useState(new Date());
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMembresias = async () => {
      if (!token || sessionExpired) return;
      try {
        const res = await http.get(ENDPOINTS_LOCAL.MEMBRESIAS, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMembresias(res.data);
      } catch (error) {
        console.error("Error al obtener membresías:", error);
      }
    };
    fetchMembresias();
  }, [token, sessionExpired]);

  useEffect(() => {
    const interval = setInterval(() => {
      setHoraActual(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!usuario || sessionExpired) {
    return <SessionBanner />;
  }

  const obtenerColor = (m) => {
    const fechaFin = new Date(m.fecha_fin);
    const diff = fechaFin - horaActual;
    const diasRestantes = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (m.estado === 'vencida' || diff <= 0) return 'rojo';
    if (diasRestantes <= 7) return 'amarillo';
    return 'verde';
  };

  const obtenerIcono = (m) => {
    const fechaFin = new Date(m.fecha_fin);
    const diff = fechaFin - horaActual;
    const diasRestantes = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (m.estado === 'vencida' || diff <= 0) return '❌';
    if (diasRestantes <= 7) return '⚠️';
    return '✅';
  };

  const obtenerCuentaRegresiva = (m) => {
    const fechaFin = new Date(m.fecha_fin);
    const diff = fechaFin - horaActual;
    if (diff <= 0) return "Vencida";

    const dias = Math.floor(diff / (1000 * 60 * 60 * 24));
    const horas = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutos = Math.floor((diff / (1000 * 60)) % 60);
    const segundos = Math.floor((diff / 1000) % 60);

    return `${dias}d ${horas}h ${minutos}m ${segundos}s`;
  };

  return (
    <div className="membresias-container">
      <h2>📋 Mis Membresías</h2>

      <div className="hora-actual">
        🕒 {horaActual.toLocaleDateString('es-ES', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })} – {horaActual.toLocaleTimeString('es-ES')}
      </div>

      {membresias.length === 0 ? (
        <div className="membresias-empty">
          <p>⚠️ No tienes membresías activas ⚠️</p>
          <button 
            className="membresia-btn-link" 
            onClick={() => navigate(ROUTES.PLANES)}
          >
            Ver Planes
          </button>
        </div>
      ) : (
        <table className="membresias-table">
          <thead>
            <tr>
              <th>Estado</th>
              <th>Plan</th>
              <th>Duración</th>
              <th>Inicio</th>
              <th>Fin</th>
              <th>Tiempo restante</th>
              <th>Monto</th>
              <th>Método</th>
              <th>Fecha pago</th>
            </tr>
          </thead>
          <tbody>
            {membresias.map((m) => (
              <tr key={m.id} className={obtenerColor(m)}>
                <td>{obtenerIcono(m)} {traducirEstado(m.estado)}</td>
                <td>{m.plan}</td>
                <td>{m.duracion}</td>
                <td>{new Date(m.fecha_inicio).toLocaleDateString('es-ES')}</td>
                <td>{new Date(m.fecha_fin).toLocaleDateString('es-ES')}</td>
                <td>{obtenerCuentaRegresiva(m)}</td>
                <td>{m.monto ? `$${m.monto}` : '-'}</td>
                <td>{m.metodo_pago ? traducirMetodo(m.metodo_pago) : '-'}</td>
                <td>{m.fecha_aprobado ? new Date(m.fecha_aprobado).toLocaleDateString('es-ES') : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Membresias;
