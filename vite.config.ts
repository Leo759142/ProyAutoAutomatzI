import { defineConfig } from 'vite';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  // Base pública para GitHub Pages: https://<username>.github.io/<repo>/
  base: '/ProyAutoAutomatzI/',
  
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    sourcemap: false,
    
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html')
      }
    }
  },
  
  // Configuración del servidor de desarrollo
  server: {
    port: 5173,
    open: true,
    cors: true
  },
  
  // Configuración de preview
  preview: {
    port: 4173,
    open: true
  },
  
  // Resolver alias para imports
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  },
  
  // Optimización de dependencias
  optimizeDeps: {
    include: []
  }
});
