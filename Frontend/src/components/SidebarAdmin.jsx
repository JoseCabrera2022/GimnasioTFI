import { NavLink } from 'react-router-dom';
import { ROUTES } from '../routers/routes';
import { useAuthStore } from '../store/useAuthStore';
import '../styles/Sidebar.css';

function SidebarAdmin() {
  const { usuario } = useAuthStore();

  if (!usuario) return null;

  const navClassName = ({ isActive }) =>
    `sidebar-admin-link${isActive ? ' active' : ''}`;

  return (
    <aside className="sidebar sidebar-admin">
      <div className="sidebar-header">
        <h3>Administración</h3>
      </div>
      <nav className="sidebar-links sidebar-admin-links" aria-label="Navegación administrativa">
        <div className="sidebar-nav-group">
          <span className="sidebar-section-title">RESUMEN</span>
          <NavLink to={ROUTES.ADMIN} end className={navClassName}>📊 Dashboard</NavLink>
        </div>
        <div className="sidebar-nav-group">
          <span className="sidebar-section-title">GESTIÓN DEL GIMNASIO</span>
          <NavLink to={ROUTES.USUARIOS} className={navClassName}>👥 Usuarios</NavLink>
          <NavLink to={ROUTES.PLANESADMIN} className={navClassName}>📋 Planes</NavLink>
          <NavLink to={ROUTES.ACTIVIDADESADMIN} className={navClassName}>🎯 Actividades</NavLink>
          <NavLink to={ROUTES.UBICACIONESADMIN} className={navClassName}>📍 Ubicaciones</NavLink>
        </div>
        <div className="sidebar-nav-group">
          <span className="sidebar-section-title">ATENCIÓN</span>
          <NavLink to={ROUTES.MENSAJES} className={navClassName}>✉️ Mensajes de contacto</NavLink>
        </div>
      </nav>
    </aside>
  );
}

export default SidebarAdmin;
