// src/components/SelectorUbicacion.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { ENDPOINTS_LOCAL } from '../api/endpoints';
import '../styles/SelectorUbicacion.css';

function SelectorUbicacion({ selectedUbicacion, setSelectedUbicacion }) {
  const [ubicaciones, setUbicaciones] = useState([]);

  useEffect(() => {
    const fetchUbicaciones = async () => {
      try {
        const res = await axios.get(ENDPOINTS_LOCAL.UBICACIONES);
        setUbicaciones(res.data);
      } catch (error) {
        console.error('Error al obtener ubicaciones:', error);
      }
    };
    fetchUbicaciones();
  }, []);

  return (
    <div className="selector-ubicacion">
      <label htmlFor="ubicacion">🏋️ Selecciona tu sede:</label>
      <select
        id="ubicacion"
        value={selectedUbicacion || ''}
        onChange={(e) => setSelectedUbicacion(e.target.value)}
      >
        <option value="">-- Selecciona una sede --</option>
        {ubicaciones.map((u) => (
          <option key={u.id} value={u.id}>
            {u.nombre} - {u.ciudad}
          </option>
        ))}
      </select>
    </div>
  );
}

export default SelectorUbicacion;
