import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';
import { API_BASE_URL } from '../api/endpoints';

const actualizarTokenRenovado = (response) => {
  const token = response.headers?.['x-auth-token'];
  if (token) useAuthStore.getState().updateToken(token);
  return response;
};

const manejarErrorDeAutenticacion = (error) => {
  const code = error.response?.data?.code;
  if (['TOKEN_INVALID', 'TOKEN_EXPIRED', 'ACCOUNT_UNAVAILABLE'].includes(code)) {
    useAuthStore.getState().expireSession();
  }
  return Promise.reject(error);
};

const http = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'ngrok-skip-browser-warning': 'true',
  },
});

axios.interceptors.response.use(actualizarTokenRenovado, manejarErrorDeAutenticacion);
http.interceptors.response.use(actualizarTokenRenovado, manejarErrorDeAutenticacion);

export default http;
