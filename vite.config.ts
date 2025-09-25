import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    host: true, // Para permitir acesso externo se necess�rio
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  preview: {
    port: 5174, // Para o comando preview também usar a mesma porta
    host: true,
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
