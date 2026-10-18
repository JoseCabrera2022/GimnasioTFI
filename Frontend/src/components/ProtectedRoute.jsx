import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

function ProtectedRoute({ children, role }) {
  const { usuario, loading } = useAuthStore();

  if (loading) return <p>Cargando sesión...</p>;
  if (!usuario) return <Navigate to="/login" replace />;
  if (role && usuario.rol !== role) return <Navigate to="/" replace />;

  return children;
}

export default ProtectedRoute;
