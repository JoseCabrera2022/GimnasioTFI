import { create } from 'zustand';

export const SESSION_IDLE_TIMEOUT_MS = 30 * 60 * 1000;

const obtenerClaimsToken = (token) => {
  if (typeof token !== 'string') return null;
  const segmento = token.split('.')[1];
  if (!segmento) return null;

  try {
    const base64 = segmento.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')));
  } catch {
    return null;
  }
};

const tokenPersistidoEsMasNuevo = (persistido, candidato) => {
  if (!persistido || persistido === candidato) return false;
  if (!candidato) return true;

  const claimsPersistidos = obtenerClaimsToken(persistido);
  const claimsCandidato = obtenerClaimsToken(candidato);
  if (!claimsPersistidos) return false;
  if (!claimsCandidato) return true;

  const expiracionPersistida = Number(claimsPersistidos.exp) || 0;
  const expiracionCandidata = Number(claimsCandidato.exp) || 0;
  const emitidoPersistido = Number(claimsPersistidos.iat) || 0;
  const emitidoCandidato = Number(claimsCandidato.iat) || 0;

  return expiracionPersistida > expiracionCandidata
    || (expiracionPersistida === expiracionCandidata && emitidoPersistido >= emitidoCandidato);
};

const leerAuthPersistida = () => {
  const saved = localStorage.getItem('auth');
  if (!saved) return null;
  try {
    return JSON.parse(saved);
  } catch (error) {
    console.error('No se pudo leer la sesión persistida:', error);
    return null;
  }
};

export const useAuthStore = create((set, get) => ({
  usuario: null,
  token: null,
  sessionExpired: false,
  loading: true, // 🔹 nuevo flag

  login: (usuario, token) => {
    set({ usuario, token, sessionExpired: false, loading: false });
    localStorage.setItem('auth', JSON.stringify({ usuario, token }));
    localStorage.setItem('authLastActivityAt', String(Date.now()));
    localStorage.setItem('authLastHeartbeatAt', String(Date.now()));
    localStorage.removeItem('sessionExpired');
  },

  logout: () => {
    set({ usuario: null, token: null, sessionExpired: false, loading: false });
    localStorage.removeItem('auth');
    localStorage.removeItem('sessionExpired');
    localStorage.removeItem('authLastActivityAt');
    localStorage.removeItem('authLastHeartbeatAt');
  },

  expireSession: (expectedToken) => {
    if (expectedToken) {
      if (get().token !== expectedToken) return false;

      const saved = localStorage.getItem('auth');
      if (!saved) return false;

      try {
        const savedToken = JSON.parse(saved)?.token;
        if (savedToken !== expectedToken) return false;
      } catch (error) {
        console.error('No se pudo verificar la sesión antes de expirar:', error);
        return false;
      }
    }

    set({ usuario: null, token: null, sessionExpired: true, loading: false });
    localStorage.setItem('sessionExpired', 'true');
    localStorage.removeItem('auth');
    localStorage.removeItem('authLastActivityAt');
    localStorage.removeItem('authLastHeartbeatAt');
    return true;
  },

  loadUser: () => {
    const saved = localStorage.getItem('auth');
    const expired = localStorage.getItem('sessionExpired') === 'true';
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const lastActivityAt = Number(localStorage.getItem('authLastActivityAt'));
        const inactiveTooLong = lastActivityAt
          && Date.now() - lastActivityAt >= SESSION_IDLE_TIMEOUT_MS;

        if (expired || inactiveTooLong || !parsed.usuario || !parsed.token) {
          localStorage.removeItem('auth');
          set({ usuario: null, token: null, sessionExpired: true, loading: false });
          return;
        }

        if (!lastActivityAt) {
          localStorage.setItem('authLastActivityAt', String(Date.now()));
        }
        set({ usuario: parsed.usuario, token: parsed.token, sessionExpired: false, loading: false });
      } catch (error) {
        console.error('No se pudo recuperar la sesión guardada:', error);
        localStorage.removeItem('auth');
        set({ usuario: null, token: null, sessionExpired: true, loading: false });
      }
    } else {
      set({ sessionExpired: expired, loading: false });
    }
  },

  updateToken: (token) => set((state) => {
    if (!state.usuario || !token) return state;
    const tokenPersistido = leerAuthPersistida()?.token;
    if (tokenPersistidoEsMasNuevo(tokenPersistido, token)) return state;
    if (state.token !== token) {
      localStorage.setItem('auth', JSON.stringify({ usuario: state.usuario, token }));
    }
    return { token };
  }),

  updateUsuario: (usuario, expectedToken) => {
    set((state) => {
      if (!state.usuario || !state.token || state.token !== expectedToken) return state;
      const authPersistida = leerAuthPersistida();
      if (tokenPersistidoEsMasNuevo(authPersistida?.token, state.token)) return state;
      const token = state.token;
      localStorage.setItem('auth', JSON.stringify({ usuario, token }));
      return { usuario };
    });
  }
}));
