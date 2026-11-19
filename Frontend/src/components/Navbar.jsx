import { useEffect } from 'react';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ROUTES } from '../routers/routes';
import { useAuthStore } from '../store/useAuthStore';
import '../styles/Navbar.css';
import { API_LOCAL, ENDPOINTS_LOCAL } from '../api/endpoints';
import http from '../utils/axiosConfig';
import defaultAvatar from '../assets/default-avatar.png';
import axios from 'axios';

const SECCIONES_ADMIN = {
  [ROUTES.ADMIN]: 'Resumen del gimnasio',
  [ROUTES.USUARIOS]: 'Usuarios',
  [ROUTES.PLANESADMIN]: 'Planes',
  [ROUTES.ACTIVIDADESADMIN]: 'Actividades',
  [ROUTES.UBICACIONESADMIN]: 'Ubicaciones',
  [ROUTES.MENSAJES]: 'Mensajes de contacto',
  [ROUTES.PERFIL]: 'Mi perfil',
};

function Navbar() {
  const { usuario, logout, updateUsuario } = useAuthStore();
  const [avatarUrl, setAvatarUrl] = useState(null);
  const esAdmin = usuario?.rol === 'admin';
  const { pathname } = useLocation();

  useEffect(() => {
    const fetchPerfil = async () => {
      const token = useAuthStore.getState().token;
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
  }, [usuario?.id, updateUsuario]);

  useEffect(() => {
    let cancelled = false;
    let objectUrl;

    if (!usuario?.foto) {
      setAvatarUrl(null);
      return undefined;
    }

    const fetchAvatar = async () => {
      try {
        const { data } = await axios.get(`${API_LOCAL}${usuario.foto}`, {
          responseType: 'blob',
          headers: { 'ngrok-skip-browser-warning': 'true' },
        });
        if (!data.type.startsWith('image/')) {
          throw new Error('El archivo de foto de perfil no es una imagen.');
        }

        objectUrl = URL.createObjectURL(data);
        if (!cancelled) setAvatarUrl(objectUrl);
      } catch (error) {
        console.error('Error al cargar la foto de perfil del Navbar:', error);
        if (!cancelled) setAvatarUrl(null);
      }
    };

    fetchAvatar();
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [usuario?.foto]);

  return (
    <nav className={`navbar${esAdmin ? ' navbar-admin' : ''}`}>
      <Link
        to={esAdmin ? ROUTES.ADMIN : ROUTES.HOME}
        className="navbar-logo"
      >
        <span>{esAdmin ? 'Fuerza Vital' : 'GymManager Pro'}</span>
      </Link>

      {esAdmin && (
        <div className="navbar-admin-context">
          <span>Panel de administración</span>
          <strong>{SECCIONES_ADMIN[pathname] || 'Administración'}</strong>
        </div>
      )}

      <ul className={`navbar-links${esAdmin ? ' navbar-links-admin' : ''}`}>
        {!esAdmin && (
          <>
            <li><Link to={ROUTES.HOME}>Inicio</Link></li>
            <li><Link to={ROUTES.PLANES}>Planes</Link></li>
            <li><Link to={ROUTES.CONTACTO}>Contacto</Link></li>
            <li><Link to={ROUTES.UBICACIONES}>Ubicación</Link></li>
          </>
        )}

        {esAdmin && (
          <li className="navbar-admin-identity">
            <span>{usuario.nombre}</span>
            <small>Administrador</small>
          </li>
        )}

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
          <Link
            to={usuario ? ROUTES.PERFIL : ROUTES.HOME}
            aria-label={usuario ? `Ver el perfil de ${usuario.nombre}` : 'Ir al inicio de GymManager Pro'}
            title={usuario ? 'Ver perfil' : 'Inicio'}
          >
            <img
              src={usuario ? avatarUrl || defaultAvatar : '/assets/fuerzavitalgym2.png'}
              alt={usuario ? `Foto de perfil de ${usuario.nombre}` : 'Logo de GymManager Pro'}
              className={usuario ? 'navbar-avatar' : 'gym-logo-right'}
              onError={(event) => {
                event.currentTarget.onerror = null;
                event.currentTarget.src = defaultAvatar;
              }}
            />
          </Link>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;
