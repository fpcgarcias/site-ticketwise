import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    host: true, // Para permitir acesso externo se necessário
  },
  preview: {
    port: 5174, // Para o comando preview também usar a mesma porta
    host: true,
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
