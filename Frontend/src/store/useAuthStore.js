import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  usuario: null,
  token: null,
  sessionExpired: false,
  loading: true, // 🔹 nuevo flag

  login: (usuario, token) => {
    set({ usuario, token, sessionExpired: false, loading: false });
    localStorage.setItem('auth', JSON.stringify({ usuario, token }));
    localStorage.removeItem('sessionExpired');
  },

  logout: () => {
    set({ usuario: null, token: null, sessionExpired: false, loading: false });
    localStorage.removeItem('auth');
    localStorage.removeItem('sessionExpired');
  },

  expireSession: () => {
    set({ usuario: null, token: null, sessionExpired: true, loading: false });
    localStorage.setItem('sessionExpired', 'true');
    localStorage.removeItem('auth');
  },

  loadUser: () => {
    const saved = localStorage.getItem('auth');
    const expired = localStorage.getItem('sessionExpired') === 'true';
    if (saved) {
      const parsed = JSON.parse(saved);
      set({ usuario: parsed.usuario, token: parsed.token, sessionExpired: expired, loading: false });
    } else {
      set({ sessionExpired: expired, loading: false });
    }
  },

  updateUsuario: (usuario) => {
    set((state) => {
      const token = state.token;
      localStorage.setItem('auth', JSON.stringify({ usuario, token }));
      return { usuario };
    });
  }
}));
