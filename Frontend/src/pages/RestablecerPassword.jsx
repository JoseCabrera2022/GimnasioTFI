import { useState } from 'react';
import axios from 'axios';
import { Link, useSearchParams } from 'react-router-dom';
import { ENDPOINTS_LOCAL } from '../api/endpoints';
import { ROUTES } from '../routers/routes';
import '../styles/Login.css';

function RestablecerPassword() {
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmacion, setConfirmacion] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMensaje('');
    setError('');

    if (password.length < 3) {
      setError('La contraseña debe tener al menos 3 caracteres');
      return;
    }
    if (password !== confirmacion) {
      setError('Las contraseñas no coinciden');
      return;
    }

    try {
      const response = await axios.post(ENDPOINTS_LOCAL.RESET_PASSWORD, {
        token: searchParams.get('token'),
        password
      });
      setMensaje(response.data.mensaje);
      setPassword('');
      setConfirmacion('');
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'No se pudo restablecer la contraseña');
    }
  };

  return (
    <div className="login-box">
      <h2 className="login-title">Nueva contraseña</h2>
      <form onSubmit={handleSubmit} className="login-form">
        <div className="login-field">
          <label htmlFor="nueva-password">Nueva contraseña</label>
          <div className="password-input-wrapper">
            <input
              id="nueva-password"
              type={mostrarPassword ? 'text' : 'password'}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
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
        </div>
        <div className="login-field">
          <label htmlFor="confirmar-password">Repetir contraseña</label>
          <div className="password-input-wrapper">
            <input
              id="confirmar-password"
              type={mostrarConfirmacion ? 'text' : 'password'}
              value={confirmacion}
              onChange={(event) => setConfirmacion(event.target.value)}
              required
            />
            <button
              type="button"
              className="password-toggle"
              aria-label={mostrarConfirmacion ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              aria-pressed={mostrarConfirmacion}
              onClick={() => setMostrarConfirmacion(!mostrarConfirmacion)}
            >
              <i className={`fa-solid ${mostrarConfirmacion ? 'fa-eye' : 'fa-eye-slash'}`} aria-hidden="true" />
            </button>
          </div>
        </div>
        <button type="submit" className="login-button">Cambiar contraseña</button>
        {mensaje && <p className="login-message">{mensaje}</p>}
        {error && <p className="login-error">{error}</p>}
        <Link to={ROUTES.LOGIN} className="login-link">Volver al inicio de sesión</Link>
      </form>
    </div>
  );
}

export default RestablecerPassword;
