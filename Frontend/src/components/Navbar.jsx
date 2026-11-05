import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../routers/routes';
import { useAuthStore } from '../store/useAuthStore';
import '../styles/Navbar.css';
import { ENDPOINTS_LOCAL } from '../api/endpoints';
import http from '../utils/axiosConfig';

function Navbar() {
  const { usuario, token, logout, updateUsuario } = useAuthStore();

  useEffect(() => {
    const fetchPerfil = async () => {
      if (!token) return;
      try {
        const res = await http.get(ENDPOINTS_LOCAL.PERFIL, {
          headers: { Authorization: `Bearer ${token}` }
        });
        updateUsuario(res.data);
      } catch (error) {
        console.error("Error al refrescar perfil en Navbar:", error);
      }
    };
    fetchPerfil();
  }, [token, updateUsuario]);

  return (
    <nav className="navbar">
      <Link to={ROUTES.HOME} className="navbar-logo">
        <span>GymManager Pro</span>
      </Link>

      <ul className="navbar-links">
        <li><Link to={ROUTES.HOME}>Inicio</Link></li>
        <li><Link to={ROUTES.PLANES}>Planes</Link></li>
        <li><Link to={ROUTES.CONTACTO}>Contacto</Link></li>
        <li><Link to={ROUTES.UBICACIONES}>Ubicacion</Link></li>

        {!usuario && (
          <>
            <li><Link to={ROUTES.LOGIN}>Login</Link></li>
            <li><Link to={ROUTES.REGISTER}>Registro</Link></li>
          </>
        )}

        {usuario && (
          <li>
            <button className="navbar-button" onClick={logout}>
              Cerrar sesión
            </button>
          </li>
        )}

        <li className="navbar-brand-icon">
          <Link to={ROUTES.HOME} aria-label="Ir al inicio de GymManager Pro">
            <img
              src="/assets/fuerzavitalgym2.png"
              alt="Logo de GymManager Pro"
              className="gym-logo-right"
            />
          </Link>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;
