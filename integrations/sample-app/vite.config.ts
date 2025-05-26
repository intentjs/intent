import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    outDir: 'build',
    manifest: true,
    ssrManifest: true,
    rollupOptions: {
      input: './resources/views/client.tsx',
    },
  },
  server: {
    hmr: {
      port: 22222,
    },
  },
});
