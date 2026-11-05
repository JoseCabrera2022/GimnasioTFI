export const API_BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:8000").replace(/\/+$/, "");
export const API_PUBLICA = API_BASE_URL;
export const API_LOCAL = API_BASE_URL;

export const ENDPOINTS = {
  REGISTER: `${API_BASE_URL}/api/register`,
  LOGIN: `${API_BASE_URL}/api/login`,
  FORGOT_PASSWORD: `${API_BASE_URL}/api/forgot-password`,
  RESET_PASSWORD: `${API_BASE_URL}/api/reset-password`,
  MEMBRESIAS: `${API_BASE_URL}/api/membresias`,
  PAGOS: `${API_BASE_URL}/api/pagos/mercadopago`,
  VERIFICAR_PAGO: `${API_BASE_URL}/api/pagos/verificar`,
  HISTORIALPAGOS: `${API_BASE_URL}/api/pagos/historial`,
  CONTACTO: `${API_BASE_URL}/api/contacto`,
  PERFIL: `${API_BASE_URL}/api/perfil`,
  PLANES: `${API_BASE_URL}/api/planes`,
  RESERVAS: `${API_BASE_URL}/api/reservas`,
  ACTIVIDADES: `${API_BASE_URL}/api/actividades`,
  UBICACIONES: `${API_BASE_URL}/api/ubicaciones`,
  USUARIOS: `${API_BASE_URL}/api/usuarios`,
  TURNOS: `${API_BASE_URL}/api/turnos`,
  DURACIONES: `${API_BASE_URL}/api/duraciones`,
  REPORTE_ADMIN: `${API_BASE_URL}/api/reportes/admin`,
  DASHBOARD_ADMIN: `${API_BASE_URL}/api/reportes/dashboard`,
};

export const ENDPOINTS_LOCAL = ENDPOINTS;