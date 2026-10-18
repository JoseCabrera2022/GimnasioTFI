import { useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../routers/routes';
import '../styles/AdminDashboard.css';

function AdminDashboard() {
  const { usuario, logout } = useAuthStore();
  const navigate = useNavigate();

  return (
    <div className="admin-dashboard">
      <h1>Panel de Administración</h1>
      <p>Bienvenido {usuario.nombre}, rol: {usuario.rol}</p>

      <div className="admin-actions">
        <button onClick={() => navigate(ROUTES.PLANESADMIN)}>Gestionar Planes</button>
        <button onClick={() => navigate(ROUTES.ACTIVIDADESADMIN)}>Gestionar Actividades</button>
        <button onClick={() => navigate(ROUTES.UBICACIONESADMIN)}>Gestionar Ubicaciones</button>
        <button onClick={() => navigate(ROUTES.MENSAJES)}>Ver Mensajes de Contacto</button>
        <button onClick={logout}>Cerrar sesión</button>
      </div>
    </div>
  );
}

export default AdminDashboard;
