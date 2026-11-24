import { useEffect } from 'react';
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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

const SECCIONES_SOCIO = {
  [ROUTES.HOME]: 'Inicio',
  [ROUTES.MEMBRESIAS]: 'Mi membresía',
  [ROUTES.HISTORIALPAGOS]: 'Historial de pagos',
  [ROUTES.PERFIL]: 'Mi perfil',
  [ROUTES.RESERVAS]: 'Mis reservas',
  [ROUTES.ACTIVIDADES]: 'Actividades',
  [ROUTES.PLANES]: 'Planes disponibles',
  [ROUTES.UBICACIONES]: 'Sedes',
  [ROUTES.CONTACTO]: 'Contacto',
  [ROUTES.PAGOREXITOSO]: 'Estado del pago',
  [ROUTES.PAGOPENDIENTE]: 'Estado del pago',
  [ROUTES.PAGOFALLIDO]: 'Estado del pago',
};

const SECCIONES_EMPLEADO = {
  [ROUTES.EMPLEADO]: 'Operación de hoy',
  [ROUTES.PERFIL]: 'Mi perfil',
};

function Navbar() {
  const { usuario, logout, updateUsuario } = useAuthStore();
  const [avatarUrl, setAvatarUrl] = useState(null);
  const esAdmin = usuario?.rol === 'admin';
  const esSocio = usuario?.rol === 'socio';
  const esEmpleado = usuario?.rol === 'empleado';
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate(ROUTES.LOGIN, { replace: true });
  };

  useEffect(() => {
    const fetchPerfil = async () => {
      const token = useAuthStore.getState().token;
      if (!token) return;
      try {
        const res = await http.get(ENDPOINTS_LOCAL.PERFIL, {
          headers: { Authorization: `Bearer ${token}` }
        });
        updateUsuario(res.data, token);
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
    <nav className={`navbar${esAdmin ? ' navbar-admin' : ''}${esSocio ? ' navbar-member' : ''}${esEmpleado ? ' navbar-employee' : ''}`}>
      <Link
        to={esAdmin ? ROUTES.ADMIN : esEmpleado ? ROUTES.EMPLEADO : ROUTES.HOME}
        className="navbar-logo"
      >
        <span>{esAdmin || esEmpleado ? 'Fuerza Vital' : esSocio ? 'Fuerza Vital' : 'Fuerza Vital'}</span>
      </Link>

      {(esAdmin || esSocio || esEmpleado) && (
        <div className="navbar-admin-context">
          <span>{esAdmin ? 'Panel de administración' : esEmpleado ? 'Portal del empleado' : 'Portal del socio'}</span>
          <strong>
            {(esAdmin
              ? SECCIONES_ADMIN[pathname]
              : esEmpleado
                ? SECCIONES_EMPLEADO[pathname]
                : SECCIONES_SOCIO[pathname])
              || (esAdmin ? 'Administración' : esEmpleado ? 'Operación de hoy' : 'Mi espacio')}
          </strong>
        </div>
      )}

      <ul className={`navbar-links${esAdmin ? ' navbar-links-admin' : ''}${esSocio ? ' navbar-links-member' : ''}${esEmpleado ? ' navbar-links-employee' : ''}`}>
        {/* Del Código 2: menú público limpio, sin Inicio ni Login/Registro en texto */}
        {!usuario && (
          <>
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

        {esSocio && (
          <li className="navbar-member-identity">
            <span>{usuario.nombre}</span>
            <small>Socio</small>
          </li>
        )}

        {esEmpleado && (
          <li className="navbar-employee-identity">
            <span>{usuario.nombre}</span>
            <small>Empleado</small>
          </li>
        )}

        {usuario && !esSocio && !esAdmin && !esEmpleado && (
          <li>
            <button className="navbar-button" onClick={handleLogout}>
              Cerrar sesión
            </button>
          </li>
        )}

        <li className="navbar-brand-icon">
          {/* Unificado: si estás logueado va a Perfil (Código 1), si no va a Login (Código 2) */}
          <Link
            to={usuario ? ROUTES.PERFIL : ROUTES.LOGIN}
            aria-label={usuario ? `Ver el perfil de ${usuario.nombre}` : 'Ir a iniciar sesión'}
            title={usuario ? 'Ver perfil' : 'Iniciar sesión'}
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