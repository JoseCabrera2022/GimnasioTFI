import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { ENDPOINTS_LOCAL } from '../api/endpoints';
import { useAuthStore } from '../store/useAuthStore';
import '../styles/MensajesAdmin.css';

function MensajesAdmin() {
  const { token } = useAuthStore();
  const [mensajes, setMensajes] = useState([]);
  const [respuesta, setRespuesta] = useState('');
  const [mensajeSeleccionado, setMensajeSeleccionado] = useState(null);
  const [alerta, setAlerta] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [mensajeAEliminar, setMensajeAEliminar] = useState(null);

  // 🔹 Ref para el formulario de respuesta
  const respuestaRef = useRef(null);

  const fetchMensajes = async () => {
    try {
      const res = await axios.get(ENDPOINTS_LOCAL.CONTACTO, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMensajes(res.data);
    } catch (error) {
      setAlerta('Error al cargar mensajes');
    }
  };

  useEffect(() => {
    fetchMensajes();
  }, []);

  const handleResponder = async (id) => {
    try {
      await axios.put(`${ENDPOINTS_LOCAL.CONTACTO}/${id}/responder`, { respuesta }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAlerta('Respuesta enviada');
      setRespuesta('');
      setMensajeSeleccionado(null);
      fetchMensajes();
    } catch (error) {
      setAlerta('Error al responder');
    }
  };

  const confirmarEliminar = (id) => {
    setMensajeAEliminar(id);
    setModalVisible(true);
  };

  const handleEliminar = async () => {
    try {
      await axios.delete(`${ENDPOINTS_LOCAL.CONTACTO}/${mensajeAEliminar}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAlerta('Mensaje eliminado');
      setModalVisible(false);
      setMensajeAEliminar(null);
      fetchMensajes();
    } catch (error) {
      setAlerta('Error al eliminar');
    }
  };

  const handleLimpiar = async () => {
    setModalVisible(true);
    setMensajeAEliminar('ALL'); // usamos un valor especial para limpiar todo
  };

  const handleConfirmLimpiar = async () => {
    try {
      await axios.delete(ENDPOINTS_LOCAL.CONTACTO, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAlerta('Bandeja vaciada');
      setModalVisible(false);
      setMensajeAEliminar(null);
      fetchMensajes();
    } catch (error) {
      setAlerta('Error al limpiar bandeja');
    }
  };

  return (
    <div className="mensajes-admin">
      <h1>Buzón de Mensajes</h1>
      {alerta && <p className="alerta">{alerta}</p>}
      <button onClick={handleLimpiar} className="btn-danger">Vaciar bandeja</button>

      <ul className="mensajes-list">
        {mensajes.map(m => (
          <li key={m.id} className="mensaje-item">
            <p><strong>De:</strong> {m.nombre} ({m.correo})</p>
            <p><strong>Mensaje:</strong> {m.mensaje}</p>
            {m.respuesta && <p><strong>Respuesta:</strong> {m.respuesta}</p>}
            <div className="acciones">
              <button onClick={() => {
                setMensajeSeleccionado(m);
                // 🔹 Scroll automático al formulario
                setTimeout(() => respuestaRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
              }}>Responder</button>
              <button onClick={() => confirmarEliminar(m.id)} className="btn-danger">Eliminar</button>
            </div>
          </li>
        ))}
      </ul>

      {mensajeSeleccionado && (
        <div className="respuesta-form" ref={respuestaRef}>
          <h2>Responder a {mensajeSeleccionado.nombre}</h2>
          <textarea value={respuesta} onChange={e => setRespuesta(e.target.value)} />
          <button onClick={() => handleResponder(mensajeSeleccionado.id)} className="btn-primary">Enviar respuesta</button>
          <button onClick={() => setMensajeSeleccionado(null)} className="btn-secondary">Cancelar</button>
        </div>
      )}

      {modalVisible && (
        <div className="modal-overlay">
          <div className="modal">
            {mensajeAEliminar === 'ALL' ? (
              <>
                <h3>¿Vaciar bandeja?</h3>
                <p>Se eliminarán todos los mensajes.</p>
                <div className="modal-actions">
                  <button onClick={handleConfirmLimpiar} className="btn-danger">Vaciar</button>
                  <button onClick={() => setModalVisible(false)} className="btn-secondary">Cancelar</button>
                </div>
              </>
            ) : (
              <>
                <h3>¿Confirmar eliminación?</h3>
                <p>Este mensaje se eliminará permanentemente.</p>
                <div className="modal-actions">
                  <button onClick={handleEliminar} className="btn-danger">Eliminar</button>
                  <button onClick={() => setModalVisible(false)} className="btn-secondary">Cancelar</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default MensajesAdmin;
