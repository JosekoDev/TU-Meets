import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte'

export default defineConfig({
	plugins: [tailwindcss(), sveltekit(), svelte()],
	server: {
		proxy:{
			'/api': {
				target: 'https://localhost:3000',
				changeOrigin: true,
			}
		}
	}
});
