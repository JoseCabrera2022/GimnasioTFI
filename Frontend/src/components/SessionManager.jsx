import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ENDPOINTS_LOCAL } from '../api/endpoints';
import { ROUTES } from '../routers/routes';
import { SESSION_IDLE_TIMEOUT_MS, useAuthStore } from '../store/useAuthStore';

const HEARTBEAT_INTERVAL_MS = 5 * 60 * 1000;
const ACTIVITY_STORAGE_KEY = 'authLastActivityAt';
const HEARTBEAT_STORAGE_KEY = 'authLastHeartbeatAt';

function SessionManager() {
  const token = useAuthStore((state) => state.token);
  const hasSession = Boolean(token);
  const sessionExpired = useAuthStore((state) => state.sessionExpired);
  const navigate = useNavigate();

  useEffect(() => {
    if (!hasSession) {
      if (sessionExpired) navigate(ROUTES.LOGIN, { replace: true });
      return undefined;
    }

    let lastActivityAt = Number(localStorage.getItem(ACTIVITY_STORAGE_KEY)) || Date.now();
    let lastHeartbeatAt = Number(localStorage.getItem(HEARTBEAT_STORAGE_KEY)) || 0;
    let lastHandledEventAt = 0;
    let idleTimer;
    let heartbeatInFlight = false;

    const closeExpiredSession = () => {
      if (useAuthStore.getState().expireSession(token)) {
        navigate(ROUTES.LOGIN, { replace: true });
      }
    };

    const scheduleIdleTimeout = () => {
      window.clearTimeout(idleTimer);
      const remaining = SESSION_IDLE_TIMEOUT_MS - (Date.now() - lastActivityAt);
      if (remaining <= 0) {
        closeExpiredSession();
        return;
      }
      idleTimer = window.setTimeout(scheduleIdleTimeout, remaining);
    };

    if (Date.now() - lastActivityAt >= SESSION_IDLE_TIMEOUT_MS) {
      closeExpiredSession();
      return undefined;
    }

    if (!localStorage.getItem(ACTIVITY_STORAGE_KEY)) {
      localStorage.setItem(ACTIVITY_STORAGE_KEY, String(lastActivityAt));
    }

    const handleActivity = () => {
      const now = Date.now();
      if (now - lastHandledEventAt < 1000) return;
      lastHandledEventAt = now;

      if (now - lastActivityAt >= SESSION_IDLE_TIMEOUT_MS) {
        closeExpiredSession();
        return;
      }

      lastActivityAt = now;
      localStorage.setItem(ACTIVITY_STORAGE_KEY, String(now));
      scheduleIdleTimeout();

      if (now - lastHeartbeatAt < HEARTBEAT_INTERVAL_MS || heartbeatInFlight) return;
      const token = useAuthStore.getState().token;
      if (!token) return;

      lastHeartbeatAt = now;
      localStorage.setItem(HEARTBEAT_STORAGE_KEY, String(now));
      heartbeatInFlight = true;
      axios.post(ENDPOINTS_LOCAL.SESSION_REFRESH, null, {
        headers: { Authorization: `Bearer ${token}` },
      }).catch((error) => {
        if (!error.response) {
          console.error('No se pudo renovar la sesión activa:', error);
        }
      }).finally(() => {
        heartbeatInFlight = false;
      });
    };

    const handleStorage = (event) => {
      if (event.key === ACTIVITY_STORAGE_KEY && Number(event.newValue) > lastActivityAt) {
        lastActivityAt = Number(event.newValue);
        scheduleIdleTimeout();
      }

      if (event.key === HEARTBEAT_STORAGE_KEY) {
        lastHeartbeatAt = Number(event.newValue) || 0;
      }

      if (
        event.key === 'auth'
        && !event.newValue
        && !localStorage.getItem('auth')
        && useAuthStore.getState().token
      ) {
        useAuthStore.getState().logout();
        navigate(ROUTES.LOGIN, { replace: true });
      } else if (event.key === 'auth' && event.newValue) {
        try {
          const auth = JSON.parse(event.newValue);
          const currentAuth = useAuthStore.getState();
          if (auth.usuario && auth.token && auth.token !== currentAuth.token) {
            currentAuth.login(auth.usuario, auth.token);
          }
        } catch (error) {
          console.error('No se pudo sincronizar la sesión entre pestañas:', error);
        }
      }

      if (
        event.key === 'sessionExpired'
        && event.newValue === 'true'
        && !localStorage.getItem('auth')
        && useAuthStore.getState().token
      ) {
        useAuthStore.getState().logout();
        navigate(ROUTES.LOGIN, { replace: true });
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') handleActivity();
    };

    scheduleIdleTimeout();
    ['pointerdown', 'pointermove', 'keydown', 'touchstart', 'scroll', 'wheel'].forEach((eventName) => {
      window.addEventListener(eventName, handleActivity, { passive: true });
    });
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('storage', handleStorage);

    return () => {
      window.clearTimeout(idleTimer);
      ['pointerdown', 'pointermove', 'keydown', 'touchstart', 'scroll', 'wheel'].forEach((eventName) => {
        window.removeEventListener(eventName, handleActivity);
      });
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('storage', handleStorage);
    };
  }, [hasSession, navigate, sessionExpired, token]);

  return null;
}

export default SessionManager;
