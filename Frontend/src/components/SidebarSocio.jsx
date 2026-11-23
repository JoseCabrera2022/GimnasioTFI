import { NavLink, useNavigate } from 'react-router-dom';
import { ROUTES } from '../routers/routes';
import { useAuthStore } from '../store/useAuthStore';
import '../styles/Sidebar.css';

function SidebarSocio() {
  const { usuario, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate(ROUTES.LOGIN, { replace: true });
  };

  if (!usuario) return null; // solo mostrar si hay socio logueado

  const navClassName = ({ isActive }) =>
    `sidebar-socio-link${isActive ? ' active' : ''}`;

  return (
    <aside className="sidebar sidebar-socio">
      <div className="sidebar-header">
        <h3>Mi espacio</h3>
      </div>
      <nav className="sidebar-links sidebar-socio-links" aria-label="Navegación del socio">
        <div className="sidebar-nav-group">
          <span className="sidebar-section-title">MI CUENTA</span>
          <NavLink to={ROUTES.HOME} end className={navClassName}>
            <i className="fa-solid fa-house" aria-hidden="true"></i>
            <span>Inicio</span>
          </NavLink>
          <NavLink to={ROUTES.MEMBRESIAS} className={navClassName}>
            <i className="fa-solid fa-id-card" aria-hidden="true"></i>
            <span>Mi membresía</span>
          </NavLink>
          <NavLink to={ROUTES.HISTORIALPAGOS} className={navClassName}>
            <i className="fa-solid fa-receipt" aria-hidden="true"></i>
            <span>Pagos</span>
          </NavLink>
          <NavLink to={ROUTES.PERFIL} className={navClassName}>
            <i className="fa-solid fa-user" aria-hidden="true"></i>
            <span>Mi perfil</span>
          </NavLink>
        </div>
        <div className="sidebar-nav-group">
          <span className="sidebar-section-title">ENTRENAMIENTO</span>
          <NavLink to={ROUTES.ACTIVIDADES} className={navClassName}>
            <i className="fa-solid fa-dumbbell" aria-hidden="true"></i>
            <span>Actividades</span>
          </NavLink>
          <NavLink to={ROUTES.RESERVAS} className={navClassName}>
            <i className="fa-solid fa-calendar-check" aria-hidden="true"></i>
            <span>Mis reservas</span>
          </NavLink>
        </div>
        <div className="sidebar-nav-group">
          <span className="sidebar-section-title">SERVICIOS</span>
          <NavLink to={ROUTES.PLANES} className={navClassName}>
            <i className="fa-solid fa-tags" aria-hidden="true"></i>
            <span>Planes disponibles</span>
          </NavLink>
        </div>
      </nav>
      <div className="sidebar-footer">
        <button className="btn-logout" onClick={handleLogout}>
          <i className="fa-solid fa-arrow-right-from-bracket" aria-hidden="true"></i>
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
}

export default SidebarSocio;
