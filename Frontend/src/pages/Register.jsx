import { useState } from 'react';
import axios from 'axios';
import { ENDPOINTS, ENDPOINTS_LOCAL } from '../api/endpoints';
import { useAuthStore } from '../store/useAuthStore';
import { useNavigate } from 'react-router-dom';
import '../styles/Register.css';
import { ROUTES } from '../routers/routes';

import SelectorUbicacion from '../components/SelectorUbicacion';

function Register() {
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [telefono, setTelefono] = useState('');
  const [password, setPassword] = useState('');
  const [ubicacionId, setUbicacionId] = useState(null);
  const [errors, setErrors] = useState({});
  const [serverMessage, setServerMessage] = useState('');
  const loginStore = useAuthStore();
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};
    if (!nombre.trim()) newErrors.nombre = 'El nombre es obligatorio';
    if (!correo.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) newErrors.correo = 'Correo inválido';
    if (!telefono.match(/^\d{7,15}$/)) newErrors.telefono = 'Teléfono inválido';
    if (password.length < 3) newErrors.password = 'La contraseña debe tener al menos 3 caracteres';
    if (!ubicacionId) newErrors.ubicacion = 'Selecciona una sede';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setServerMessage('');
    if (!validateForm()) return;

    try {
      const res = await axios.post(ENDPOINTS_LOCAL.REGISTER, {
        nombre,
        correo_electronico: correo,
        telefono,
        password,
        ubicacion_id: ubicacionId
      });
      loginStore.login(res.data.usuario, res.data.token);
      setServerMessage('✅ Registro exitoso, redirigiendo...');
      navigate(ROUTES.HOME);
    } catch (error) {
      setServerMessage(error.response?.data?.error || '❌ Error al registrar usuario');
    }
  };

  return (
    <div className="register-container">
      <h2>Registro</h2>
      <form onSubmit={handleRegister} className="register-form">
        
        <div className="form-group">
          <label>Nombre</label>
          <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} />
          {errors.nombre && <span className="error">{errors.nombre}</span>}
        </div>

        <div className="form-group">
          <label>Correo electrónico</label>
          <input type="email" value={correo} onChange={(e) => setCorreo(e.target.value)} />
          {errors.correo && <span className="error">{errors.correo}</span>}
        </div>

        <div className="form-group">
          <label>Teléfono</label>
          <input type="text" value={telefono} onChange={(e) => setTelefono(e.target.value)} />
          {errors.telefono && <span className="error">{errors.telefono}</span>}
        </div>

        <div className="form-group">
          <label>Contraseña</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          {errors.password && <span className="error">{errors.password}</span>}
        </div>

        <div className="form-group">
          <SelectorUbicacion selectedUbicacion={ubicacionId} setSelectedUbicacion={setUbicacionId} />
          {errors.ubicacion && <span className="error">{errors.ubicacion}</span>}
        </div>

        <button type="submit">Registrarse</button>
        {serverMessage && <p className="server-message">{serverMessage}</p>}
      </form>
    </div>
  );
}

export default Register;
