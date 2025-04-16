import type { SSRConfig } from '../types';

export interface SSR {
  enabled: boolean;
  cache: Map<string, { data: any; timestamp: number }>;
  render: (component: any, props?: any) => Promise<string>;
  clearCache: () => void;
  start: () => Promise<void>;
  stop: () => Promise<void>;
}

export function createSSR(config: SSRConfig = { enabled: false }): SSR {
  const { enabled = false, cache = { enabled: false, ttl: 3600000 }, streaming = false } = config;
  const cacheMap = new Map<string, { data: any; timestamp: number }>();

  const ssr: SSR = {
    enabled,
    cache: cacheMap,

    async render(component: any, props: any = {}) {
      if (!enabled) {
        return '';
      }

      const cacheKey = JSON.stringify({ component: component.name, props });
      
      // Check cache if enabled
      if (cache.enabled) {
        const cached = cacheMap.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < cache.ttl) {
          return cached.data;
        }
      }

      // Render component
      let html = '';
      if (streaming) {
        // Implement streaming SSR
        html = await new Promise((resolve) => {
          const stream = component(props);
          let result = '';
          stream.on('data', (chunk: string) => {
            result += chunk;
          });
          stream.on('end', () => {
            resolve(result);
          });
        });
      } else {
        // Regular SSR
        html = await component(props);
      }

      // Cache result if enabled
      if (cache.enabled) {
        cacheMap.set(cacheKey, {
          data: html,
          timestamp: Date.now(),
        });
      }

      return html;
    },

    clearCache() {
      cacheMap.clear();
    },

    async start() {
      if (enabled) {
        // Initialize SSR server
        console.log('SSR server started');
      }
    },

    async stop() {
      if (enabled) {
        // Cleanup SSR server
        console.log('SSR server stopped');
      }
    },
  };

  return ssr;
}

export default createSSR; 