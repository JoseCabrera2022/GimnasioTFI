import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';
import { API_LOCAL } from '../api/endpoints';

const http = axios.create({
  baseURL: API_LOCAL,
});

http.interceptors.response.use(
  (res) => res,
  (error) => {
    const { token } = useAuthStore.getState();

    if (error.response?.status === 401 || error.response?.status === 403) {
      if (token) {
        useAuthStore.getState().expireSession(); // sesión caducada
      } else {
        useAuthStore.getState().logout(); // no logueado
      }
    }
    return Promise.reject(error);
  }
);

export default http;
