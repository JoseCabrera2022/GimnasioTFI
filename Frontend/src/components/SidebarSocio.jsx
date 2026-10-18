import { Link } from 'react-router-dom';
import { ROUTES } from '../routers/routes';
import { useAuthStore } from '../store/useAuthStore';
import '../styles/Sidebar.css';

function SidebarSocio() {
  const { usuario, logout } = useAuthStore();

  if (!usuario) return null; // solo mostrar si hay socio logueado

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h3>Socio</h3>
      </div>
      <nav className="sidebar-links">
        <Link to={ROUTES.MEMBRESIAS}>📋 Mis Membresías</Link>
        <Link to={ROUTES.HISTORIALPAGOS}>💳 Historial de Pagos</Link>
        <Link to={ROUTES.RESERVAS}>📅 Mis Reservas</Link>
        <Link to={ROUTES.ACTIVIDADES}>🎯 Actividades</Link>
        <Link to={ROUTES.CALENDARIO}>🗓️ Calendario</Link>
        <Link to={ROUTES.PERFIL}>⚙️ Mi Perfil</Link>
      </nav>
      <div className="sidebar-footer">
        <button className="btn-logout" onClick={logout}>🚪 Cerrar sesión</button>
      </div>
    </aside>
  );
}

export default SidebarSocio;
