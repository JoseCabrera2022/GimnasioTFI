import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../routers/routes';
import { useAuthStore } from '../store/useAuthStore';
import { descargarReporteAdministrativo } from '../utils/reporteAdminPdf';
import '../styles/Sidebar.css';

function SidebarAdmin() {
  const { usuario, token, logout } = useAuthStore();
  const [generandoReporte, setGenerandoReporte] = useState(false);
  const [errorReporte, setErrorReporte] = useState('');

  if (!usuario) return null; // solo mostrar si hay admin logueado

  const handleDescargarReporte = async () => {
    setGenerandoReporte(true);
    setErrorReporte('');
    try {
      await descargarReporteAdministrativo(token);
    } catch (error) {
      setErrorReporte(error.response?.data?.error || 'No se pudo generar el reporte.');
    } finally {
      setGenerandoReporte(false);
    }
  };

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
        <button type="button" onClick={handleDescargarReporte} disabled={generandoReporte}>
          {generandoReporte ? 'Generando reporte...' : '📄 Reporte'}
        </button>
        {errorReporte && <p className="sidebar-report-error" role="alert">{errorReporte}</p>}
      </nav>
      <div className="sidebar-footer">
        <button className="btn-logout" onClick={logout}>🚪 Cerrar sesión</button>
      </div>
    </aside>
  );
}

export default SidebarAdmin;
