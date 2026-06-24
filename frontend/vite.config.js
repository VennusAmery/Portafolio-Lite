import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    headers: {
      'Content-Security-Policy':
        "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:;",
    },
  },
});