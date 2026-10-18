import { Link } from 'react-router-dom';
import { ROUTES } from '../routers/routes';
import { useAuthStore } from '../store/useAuthStore';
import '../styles/Sidebar.css';

function SidebarAdmin() {
  const { usuario, logout } = useAuthStore();

  if (!usuario) return null; // solo mostrar si hay admin logueado

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h3>Admin</h3>
      </div>
      <nav className="sidebar-links">
        <Link to={ROUTES.ADMIN}>📊 Dashboard</Link>
        <Link to={ROUTES.PLANESADMIN}>📋 Gestionar Planes</Link>
        <Link to={ROUTES.ACTIVIDADESADMIN}>🎯 Gestionar Actividades</Link>
        <Link to={ROUTES.UBICACIONESADMIN}>📍 Gestionar Ubicaciones</Link>
        <Link to={ROUTES.USUARIOS}>👥 Gestionar Usuarios</Link>
        <Link to={ROUTES.MENSAJES}>✉️ Mensajes de Contacto</Link>
      </nav>
      <div className="sidebar-footer">
        <button className="btn-logout" onClick={logout}>🚪 Cerrar sesión</button>
      </div>
    </aside>
  );
}

export default SidebarAdmin;
