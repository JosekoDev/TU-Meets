// vite.config.js
import { defineConfig } from 'vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { injectSocketIO } from './src/lib/server/socker-server';

export default defineConfig({
  plugins: [sveltekit(),

    {
      name: 'sveltekit-socket.io',
      configureServer(server) {
        if (server.httpServer) {
          // server.httpServer can be different Node server types (http/https/http2); cast to any to satisfy Socket.IO types
          injectSocketIO(/** @type {any} */ (server.httpServer));
        }
      }
    }

  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      }
    }
  }
});