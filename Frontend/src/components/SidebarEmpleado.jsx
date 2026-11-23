import { NavLink, useNavigate } from 'react-router-dom';
import { ROUTES } from '../routers/routes';
import { useAuthStore } from '../store/useAuthStore';
import '../styles/Sidebar.css';

function SidebarEmpleado() {
  const { usuario, logout } = useAuthStore();
  const navigate = useNavigate();
  const navClassName = ({ isActive }) =>
    `sidebar-admin-link${isActive ? ' active' : ''}`;

  if (!usuario) return null;

  const cerrarSesion = () => {
    logout();
    navigate(ROUTES.LOGIN, { replace: true });
  };

  return (
    <aside className="sidebar sidebar-admin sidebar-empleado">
      <div className="sidebar-header">
        <h3>Mi espacio</h3>
      </div>
      <nav className="sidebar-links sidebar-admin-links" aria-label="Navegación del empleado">
        <div className="sidebar-nav-group">
          <span className="sidebar-section-title">OPERACIÓN</span>
          <NavLink to={ROUTES.EMPLEADO} end className={navClassName}>
            <i className="fa-solid fa-calendar-day" aria-hidden="true"></i>
            Turnos de hoy
          </NavLink>
        </div>
        <div className="sidebar-nav-group">
          <span className="sidebar-section-title">CUENTA</span>
          <NavLink to={ROUTES.PERFIL} className={navClassName}>
            <i className="fa-solid fa-user" aria-hidden="true"></i>
            Mi perfil
          </NavLink>
        </div>
      </nav>
      <div className="sidebar-footer">
        <button
          type="button"
          className="btn-logout"
          onClick={cerrarSesion}
          aria-label="Cerrar sesión"
          title="Cerrar sesión"
        >
          <i className="fa-solid fa-arrow-right-from-bracket" aria-hidden="true"></i>
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
}

export default SidebarEmpleado;
