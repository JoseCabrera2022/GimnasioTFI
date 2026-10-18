import { useState, useEffect } from 'react';
import axios from 'axios';
import { ENDPOINTS_LOCAL } from '../api/endpoints';
import '../styles/Ubicaciones.css';

function Ubicaciones() {
  const [ubicaciones, setUbicaciones] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const fetchUbicaciones = async () => {
      try {
        const res = await axios.get(ENDPOINTS_LOCAL.UBICACIONES);
        setUbicaciones(res.data);
        if (res.data.length > 0) setSelected(res.data[0]); // por defecto la primera
      } catch (error) {
        console.error('Error al cargar ubicaciones:', error);
      }
    };
    fetchUbicaciones();
  }, []);

  if (!selected) return <p>Cargando ubicación...</p>;

  return (
    <div className="ubicacion-container">
      <h2>📍 Nuestras Sedes</h2>

      <select onChange={(e) => setSelected(ubicaciones.find(u => u.id === parseInt(e.target.value)))}>
        {ubicaciones.map(u => (
          <option key={u.id} value={u.id}>{u.nombre} - {u.ciudad}</option>
        ))}
      </select>

      <div className="ubicacion-info">
        <p><strong>{selected.nombre}</strong></p>
        <p>{selected.direccion}, {selected.ciudad}, {selected.provincia}, {selected.pais}</p>
        <p>Tel: {selected.telefono}</p>
        <p>Email: {selected.email}</p>
      </div>

      <iframe
        title="Mapa Ubicación"
        src={`https://www.google.com/maps?q=${selected.lat},${selected.lng}&hl=es&z=15&output=embed`}
        width="100%"
        height="400"
        style={{ border: 0 }}
        allowFullScreen=""
        loading="lazy"
      ></iframe>
    </div>
  );
}

export default Ubicaciones;
