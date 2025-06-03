import { createServer } from 'vite';

export async function initViteDevServer() {
  const vite = await createServer({
    server: { middlewareMode: true },
    appType: 'custom',
  });
  return vite;
}
