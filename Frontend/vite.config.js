import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ['stubbled-attendantly-israel.ngrok-free.dev'],
    fs: {
      allow: ['.']
    }
  }
});
