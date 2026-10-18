import { useAuthStore } from '../store/useAuthStore';
import { useNavigate } from 'react-router-dom';
import '../styles/SessionBanner.css';
import { ROUTES } from '../routers/routes';

function SessionBanner() {
  const { usuario, sessionExpired } = useAuthStore();
  const navigate = useNavigate();

  if (!usuario || sessionExpired) {
    return (
      <div className="session-banner warning">
        🔒 No has iniciado sesión o tu sesión ha caducado.
        <button onClick={() => navigate(ROUTES.LOGIN)}>Ir al login</button>
      </div>
    );
  }

  return null;
}

export default SessionBanner;