import { useState } from 'react';
import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';
import { useNavigate } from 'react-router-dom';
import { ENDPOINTS, ENDPOINTS_LOCAL } from '../api/endpoints';
import '../styles/Login.css';
import { ROUTES } from '../routers/routes';

function Login() {
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [serverMessage, setServerMessage] = useState('');
  const { login, sessionExpired } = useAuthStore();
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};
    if (!correo.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) newErrors.correo = 'Correo inválido';
    if (password.length < 3) newErrors.password = 'La contraseña debe tener al menos 3 caracteres';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setServerMessage('');
    if (!validateForm()) return;

    try {
      const res = await axios.post(ENDPOINTS_LOCAL.LOGIN, {
        correo_electronico: correo,
        password
      });

      login(res.data.usuario, res.data.token);
      setServerMessage('✅ Inicio de sesión exitoso, redirigiendo...');

      // 🔹 Redirección según rol
      const rol = res.data.usuario.rol;
      if (rol === 'admin') {
        navigate(ROUTES.ADMIN);
      } else if (rol === 'empleado') {
        navigate(ROUTES.EMPLEADO);
      } else {
        navigate(ROUTES.HOME);
      }
    } catch (error) {
      setServerMessage(error.response?.data?.error || '❌ Error al iniciar sesión');
    }
  };


  return (
    <div className="login-box">
      <h2 className="login-title">Login</h2>

      {sessionExpired && (
        <p className="expired-note">
          ⚠️ Tu sesión ha caducado, por favor vuelve a iniciar sesión.
        </p>
      )}

      <form onSubmit={handleLogin} className="login-form">
        <div className="login-field">
          <label>Correo electrónico</label>
          <input
            type="email"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
          />
          {errors.correo && <span className="login-error">{errors.correo}</span>}
        </div>

        <div className="login-field">
          <label>Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {errors.password && <span className="login-error">{errors.password}</span>}
        </div>

        <button type="submit" className="login-button">Ingresar</button>
        <button type="button" className="login-link" onClick={() => navigate(ROUTES.FORGOT_PASSWORD)}>
          ¿Olvidaste tu contraseña?
        </button>
        {serverMessage && <p className="login-message">{serverMessage}</p>}
      </form>
    </div>
  );
}

export default Login;
