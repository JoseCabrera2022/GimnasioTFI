import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';
import { ENDPOINTS_LOCAL } from '../api/endpoints';
import '../styles/HistorialPagos.css';
import { traducirEstado, traducirMetodo } from '../utils/conversiones';
import { ROUTES } from '../routers/routes';
import { useNavigate } from 'react-router-dom';

function HistorialPagos() {
  const { token } = useAuthStore();
  const [pagos, setPagos] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPagos = async () => {
      try {
        const res = await axios.get(ENDPOINTS_LOCAL.HISTORIALPAGOS, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPagos(res.data);
      } catch (error) {
        console.error('Error al obtener historial:', error);
      }
    };
    fetchPagos();
  }, [token]);

  return (
    <div className="historial-container">
      <h2>📜 Historial de Pagos</h2>

      {pagos.length === 0 ? (
        <div className="historial-empty">
          <p>⚠️ No tiene pagos registrados ⚠️</p>
          <button 
            className="historial-btn-link" 
            onClick={() => navigate(ROUTES.PLANES)}
          >
            Ver Planes
          </button>
        </div>
      ) : (
        <table className="historial-table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Monto</th>
              <th>Método</th>
              <th>Estado</th>
              <th>Plan</th>
              <th>Duración</th>
            </tr>
          </thead>
          <tbody>
            {pagos.map((p) => (
              <tr key={p.id} className={p.estado}>
                <td>{new Date(p.creado_en).toLocaleString('es-ES')}</td>
                <td>${p.monto}</td>
                <td>{traducirMetodo(p.metodo_pago)}</td>
                <td><span className={`estado-badge ${p.estado}`}>{traducirEstado(p.estado)}</span></td>
                <td>{p.plan || '-'}</td>
                <td>{p.duracion || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default HistorialPagos;
