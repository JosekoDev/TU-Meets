// vite.config.js
import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import tailwindcss from '@tailwindcss/vite'; // Assuming you use Tailwind

export default defineConfig({
    // ✅ REMOVED sveltekit() and kept the correct svelte() plugin
    plugins: [svelte(), tailwindcss()], 
    server: {
        proxy:{
            '/api': {
                // ✅ CHANGED from https to http
                target: 'http://localhost:3000', 
                changeOrigin: true,
            }
        }
    }
});