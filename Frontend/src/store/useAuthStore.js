import { create } from 'zustand';

export const SESSION_IDLE_TIMEOUT_MS = 30 * 60 * 1000;

export const useAuthStore = create((set) => ({
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

  expireSession: () => {
    set({ usuario: null, token: null, sessionExpired: true, loading: false });
    localStorage.setItem('sessionExpired', 'true');
    localStorage.removeItem('auth');
    localStorage.removeItem('authLastActivityAt');
    localStorage.removeItem('authLastHeartbeatAt');
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
    if (state.token !== token) {
      localStorage.setItem('auth', JSON.stringify({ usuario: state.usuario, token }));
    }
    return { token };
  }),

  updateUsuario: (usuario) => {
    set((state) => {
      const token = state.token;
      localStorage.setItem('auth', JSON.stringify({ usuario, token }));
      return { usuario };
    });
  }
}));
