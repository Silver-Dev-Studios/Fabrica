import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Fabrica — a static single-page app. Served as plain static files so the
// built output can be dropped onto any host or GitHub Pages.
export default defineConfig({
  base: './',
  plugins: [react()],
  server: {
    port: 5173,
    host: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
});