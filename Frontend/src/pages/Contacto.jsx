import { useState } from 'react';
import axios from 'axios';
import '../styles/Contacto.css';
import { ENDPOINTS } from '../api/endpoints';
import SelectorUbicacion from '../components/SelectorUbicacion';

function Contacto() {
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [ubicacionId, setUbicacionId] = useState(null);
  const [errors, setErrors] = useState({});
  const [serverMessage, setServerMessage] = useState('');

  const validateForm = () => {
    const newErrors = {};
    if (!nombre.trim()) newErrors.nombre = 'El nombre es obligatorio';
    if (!correo.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) newErrors.correo = 'Correo inválido';
    if (mensaje.length < 5) newErrors.mensaje = 'El mensaje debe tener al menos 5 caracteres';
    if (!ubicacionId) newErrors.ubicacion = 'Selecciona una sede';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerMessage('');
    if (!validateForm()) return;

    try {
      const res = await axios.post(ENDPOINTS.CONTACTO, {
        nombre,
        correo,
        mensaje,
        ubicacion_id: ubicacionId
      });
      setServerMessage(res.data.message);
      setNombre('');
      setCorreo('');
      setMensaje('');
      setUbicacionId(null);
    } catch (error) {
      setServerMessage(error.response?.data?.error || 'Error al enviar el mensaje');
    }
  };

  return (
    <div className="contact-box">
      <h1 className="contact-title">Contacto</h1>
      <form className="contact-form" onSubmit={handleSubmit}>
        <div className="contact-field">
          <label>Nombre</label>
          <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} />
          {errors.nombre && <span className="contact-error">{errors.nombre}</span>}
        </div>

        <div className="contact-field">
          <label>Correo electrónico</label>
          <input type="email" value={correo} onChange={(e) => setCorreo(e.target.value)} />
          {errors.correo && <span className="contact-error">{errors.correo}</span>}
        </div>

        <div className="contact-field">
          <label>Mensaje</label>
          <textarea value={mensaje} onChange={(e) => setMensaje(e.target.value)} />
          {errors.mensaje && <span className="contact-error">{errors.mensaje}</span>}
        </div>

        <div className="contact-field">
          <label>Sede</label>
          <SelectorUbicacion selectedUbicacion={ubicacionId} setSelectedUbicacion={setUbicacionId} />
          {errors.ubicacion && <span className="contact-error">{errors.ubicacion}</span>}
        </div>

        <button type="submit" className="contact-button">Enviar</button>
        {serverMessage && <p className="contact-message">{serverMessage}</p>}
      </form>
    </div>
  );
}

export default Contacto;
