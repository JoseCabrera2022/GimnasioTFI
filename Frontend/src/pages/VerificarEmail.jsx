import { useEffect, useState } from 'react';
import axios from 'axios';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ENDPOINTS } from '../api/endpoints';
import { ROUTES } from '../routers/routes';
import '../styles/Login.css';

function VerificarEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [estado, setEstado] = useState({ cargando: true, mensaje: 'Verificando tu correo...' });
  const token = searchParams.get('token');

  useEffect(() => {
    let activo = true;

    if (!token) {
      setEstado({ cargando: false, mensaje: 'El enlace de verificación no es válido.' });
      return () => {
        activo = false;
      };
    }

    axios.get(ENDPOINTS.VERIFY_EMAIL, { params: { token } })
      .then(({ data }) => {
        if (activo) setEstado({ cargando: false, mensaje: data.mensaje });
      })
      .catch((error) => {
        if (activo) {
          setEstado({
            cargando: false,
            mensaje: error.response?.data?.error || 'No se pudo verificar el correo.'
          });
        }
      });

    return () => {
      activo = false;
    };
  }, [token]);

  return (
    <div className="login-box">
      <h2 className="login-title">Verificación de correo</h2>
      <p className="login-message" role="status">{estado.mensaje}</p>
      {!estado.cargando && (
        <button type="button" className="login-button" onClick={() => navigate(ROUTES.LOGIN)}>
          Ir a iniciar sesión
        </button>
      )}
    </div>
  );
}

export default VerificarEmail;
