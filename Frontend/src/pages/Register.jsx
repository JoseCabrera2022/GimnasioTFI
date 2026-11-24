import { useState } from 'react';
import axios from 'axios';
import { ENDPOINTS_LOCAL } from '../api/endpoints';
import { useNavigate } from 'react-router-dom';
import '../styles/Register.css';
import '../styles/Login.css';
import { ROUTES } from '../routers/routes';

import SelectorUbicacion from '../components/SelectorUbicacion';

function Register() {
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [telefono, setTelefono] = useState('');
  const [password, setPassword] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [ubicacionId, setUbicacionId] = useState(null);
  const [errors, setErrors] = useState({});
  const [serverMessage, setServerMessage] = useState('');
  const [correoPendiente, setCorreoPendiente] = useState('');
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};
    if (!nombre.trim()) newErrors.nombre = 'El nombre es obligatorio';
    if (!correo.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) newErrors.correo = 'Correo inválido';
    if (!telefono.match(/^\d{7,15}$/)) newErrors.telefono = 'Teléfono inválido';
    if (
      password.length < 8 ||
      !/[A-Z]/.test(password) ||
      !/\d/.test(password) ||
      !/[^\w\s]/.test(password)
    ) {
      newErrors.password = 'La contraseña no cumple con los requisitos indicados';
    }
    if (!ubicacionId) newErrors.ubicacion = 'Selecciona una sede';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setServerMessage('');
    if (!validateForm()) return;

    try {
      await axios.post(ENDPOINTS_LOCAL.REGISTER, {
        nombre,
        correo_electronico: correo,
        telefono,
        password,
        ubicacion_id: ubicacionId
      });
      setCorreoPendiente(correo);
    } catch (error) {
      setServerMessage(error.response?.data?.error || '❌ Error al registrar usuario');
    }
  };

  return (
    <div className="register-container login-box">
      <h2 className="login-title">{correoPendiente ? 'Revisá tu correo' : 'Crear cuenta'}</h2>
      <p className="register-subtitle">
        {correoPendiente
          ? `Enviamos un enlace de verificación a ${correoPendiente}. Confirmá tu dirección antes de iniciar sesión.`
          : 'Completá tus datos para unirte a Fuerza Vital.'}
      </p>
      {correoPendiente ? (
        <button type="button" className="login-button" onClick={() => navigate(ROUTES.LOGIN)}>
          Ir a iniciar sesión
        </button>
      ) : (
      <form onSubmit={handleRegister} className="login-form">
        
        <div className="login-field">
          <label>Nombre</label>
          <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} />
          {errors.nombre && <span className="login-error">{errors.nombre}</span>}
        </div>

        <div className="login-field">
          <label>Correo electrónico</label>
          <input type="email" value={correo} onChange={(e) => setCorreo(e.target.value)} />
          {errors.correo && <span className="login-error">{errors.correo}</span>}
        </div>

        <div className="login-field">
          <label>Teléfono</label>
          <input type="text" value={telefono} onChange={(e) => setTelefono(e.target.value)} />
          {errors.telefono && <span className="login-error">{errors.telefono}</span>}
        </div>

        <div className="login-field">
          <label>Contraseña</label>
          <div className="password-input-wrapper">
            <input
              id="register-password"
              type={mostrarPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-describedby="password-requirements"
              aria-invalid={Boolean(errors.password)}
            />
            <button
              type="button"
              className="password-toggle"
              aria-label={mostrarPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              aria-pressed={mostrarPassword}
              onClick={() => setMostrarPassword(!mostrarPassword)}
            >
              <i className={`fa-solid ${mostrarPassword ? 'fa-eye' : 'fa-eye-slash'}`} aria-hidden="true" />
            </button>
          </div>
          <small id="password-requirements" className="password-requirements">
            Longitud mínima de 8 caracteres, al menos una mayúscula, un número y un carácter especial.
          </small>
          {errors.password && <span className="login-error">{errors.password}</span>}
        </div>

        <div className="login-field register-location-field">
          <SelectorUbicacion selectedUbicacion={ubicacionId} setSelectedUbicacion={setUbicacionId} />
          {errors.ubicacion && <span className="login-error">{errors.ubicacion}</span>}
        </div>

        <button type="submit" className="login-button">Crear cuenta</button>
        <button type="button" className="login-link" onClick={() => navigate(ROUTES.LOGIN)}>
          ¿Ya tienes una cuenta? Inicia sesión
        </button>
        {serverMessage && <p className="login-message">{serverMessage}</p>}
      </form>
      )}
    </div>
  );
}

export default Register;
