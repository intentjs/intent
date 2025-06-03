import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist/server',
    ssr: 'build/views/entry-server.tsx',
    rollupOptions: {
      input: {
        app: 'resources/views/entry-server.tsx',
      },
    },
  },
  ssr: {
    noExternal: ['react-router-dom'],
  },
});
