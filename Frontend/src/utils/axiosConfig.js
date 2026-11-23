import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';
import { API_BASE_URL } from '../api/endpoints';

const obtenerTokenDeSolicitud = (config) => {
  const headers = config?.headers;
  const authorization = headers?.get?.('Authorization')
    || headers?.Authorization
    || headers?.authorization;
  return typeof authorization === 'string'
    ? authorization.replace(/^Bearer\s+/i, '')
    : null;
};

const obtenerTokenPersistido = () => {
  const authGuardado = localStorage.getItem('auth');
  if (authGuardado) {
    try {
      const tokenGuardado = JSON.parse(authGuardado)?.token;
      if (typeof tokenGuardado === 'string' && tokenGuardado) return tokenGuardado;
    } catch (error) {
      console.error('No se pudo leer el token guardado para la petición:', error);
    }
  }
  return null;
};

const obtenerTokenActual = () => {
  const tokenEnStore = useAuthStore.getState().token;
  const tokenPersistido = obtenerTokenPersistido();
  const token = tokenPersistido || tokenEnStore;

  if (token && tokenEnStore !== token) {
    useAuthStore.getState().updateToken(token);
  }

  return token;
};

const aplicarTokenActual = (config) => {
  const token = obtenerTokenActual();
  const headers = config.headers;

  if (token) {
    if (typeof headers?.set === 'function') {
      headers.set('Authorization', `Bearer ${token}`);
    } else {
      config.headers = { ...headers, Authorization: `Bearer ${token}` };
    }
  } else if (typeof headers?.delete === 'function') {
    headers.delete('Authorization');
  } else if (headers) {
    delete headers.Authorization;
    delete headers.authorization;
  }

  return config;
};

const actualizarTokenRenovado = (response) => {
  const token = response.headers?.['x-auth-token'];
  const tokenDeSolicitud = obtenerTokenDeSolicitud(response.config);
  const tokenActual = useAuthStore.getState().token;
  if (token && tokenDeSolicitud === tokenActual) {
    useAuthStore.getState().updateToken(token);
  }
  return response;
};

const manejarErrorDeAutenticacion = (error) => {
  const code = error.response?.data?.code;
  const tokenDeSolicitud = obtenerTokenDeSolicitud(error.config);
  const tokenActual = useAuthStore.getState().token;
  if (
    ['TOKEN_INVALID', 'TOKEN_EXPIRED', 'ACCOUNT_UNAVAILABLE'].includes(code)
    && tokenDeSolicitud
    && tokenDeSolicitud === tokenActual
  ) {
    useAuthStore.getState().expireSession(tokenDeSolicitud);
  }
  return Promise.reject(error);
};

const http = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'ngrok-skip-browser-warning': 'true',
  },
});

http.interceptors.request.use(aplicarTokenActual);
axios.interceptors.response.use(actualizarTokenRenovado, manejarErrorDeAutenticacion);
http.interceptors.response.use(actualizarTokenRenovado, manejarErrorDeAutenticacion);

export default http;
