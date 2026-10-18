import { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { ENDPOINTS_LOCAL } from '../api/endpoints';
import { ROUTES } from '../routers/routes';
import '../styles/Login.css';

function RecuperarPassword() {
  const [correo, setCorreo] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMensaje('');
    setError('');

    try {
      const response = await axios.post(ENDPOINTS_LOCAL.FORGOT_PASSWORD, {
        correo_electronico: correo
      });
      setMensaje(response.data.mensaje);
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'No se pudo procesar la solicitud');
    }
  };

  return (
    <div className="login-box">
      <h2 className="login-title">Recuperar contraseña</h2>
      <p>Ingresa tu correo y te enviaremos un enlace para restablecerla.</p>
      <form onSubmit={handleSubmit} className="login-form">
        <div className="login-field">
          <label htmlFor="correo-recuperacion">Correo electrónico</label>
          <input
            id="correo-recuperacion"
            type="email"
            value={correo}
            onChange={(event) => setCorreo(event.target.value)}
            required
          />
        </div>
        <button type="submit" className="login-button">Enviar enlace</button>
        {mensaje && <p className="login-message">{mensaje}</p>}
        {error && <p className="login-error">{error}</p>}
        <Link to={ROUTES.LOGIN} className="login-link">Volver al inicio de sesión</Link>
      </form>
    </div>
  );
}

export default RecuperarPassword;
