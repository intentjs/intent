import { createElement, Suspense, lazy } from 'react';
import { renderToPipeableStream } from 'react-dom/server';
import { createCache, createResource } from '@intentjs/core';

export interface RenderConfig {
  streaming?: boolean;
  hydration?: 'full' | 'partial' | 'progressive' | 'none';
  cache?: {
    enabled: boolean;
    ttl: number;
    revalidate?: 'background' | 'stale-while-revalidate';
  };
  prefetch?: {
    enabled: boolean;
    strategy: 'eager' | 'lazy' | 'viewport';
  };
  compression?: {
    enabled: boolean;
    level: number;
  };
}

export interface IslandConfig {
  id: string;
  load: () => Promise<any>;
  fallback?: React.ReactNode;
  boundary?: 'suspense' | 'error' | 'both';
  hydrationPriority?: 'high' | 'low' | 'idle';
}

export interface RenderResult {
  html: string;
  chunks: string[];
  styles: string[];
  scripts: string[];
  hydrationData: Record<string, any>;
  timing: {
    ttfb: number;
    tti: number;
    ttr: number;
  };
}

export function createRenderer(config: RenderConfig = {}) {
  const {
    streaming = true,
    hydration = 'progressive',
    cache = { enabled: true, ttl: 3600000 },
    prefetch = { enabled: true, strategy: 'viewport' },
    compression = { enabled: true, level: 6 }
  } = config;

  const pageCache = createCache({ ttl: cache.ttl });
  const chunkCache = new Map<string, string>();
  const islandRegistry = new Map<string, IslandConfig>();

  return {
    async render(
      component: React.ComponentType,
      props: Record<string, any> = {},
      context: Record<string, any> = {}
    ): Promise<RenderResult> {
      const cacheKey = JSON.stringify({ component: component.name, props, context });
      
      if (cache.enabled) {
        const cached = pageCache.get(cacheKey);
        if (cached) return cached;
      }

      const chunks: string[] = [];
      const styles: string[] = [];
      const scripts: string[] = [];
      const hydrationData: Record<string, any> = {};
      const timing = { ttfb: 0, tti: 0, ttr: 0 };

      const startTime = performance.now();

      // Create resource boundaries for data fetching
      const resources = createResource(context);
      
      // Create island components with lazy loading
      const islands = Array.from(islandRegistry.values()).map(island => ({
        ...island,
        Component: lazy(island.load),
        Wrapper: ({ children }) => (
          <div
            data-island={island.id}
            data-hydration={island.hydrationPriority}
          >
            <Suspense fallback={island.fallback}>
              {children}
            </Suspense>
          </div>
        )
      }));

      // Create the stream
      const { pipe, abort } = renderToPipeableStream(
        createElement(component, { ...props, resources, islands }),
        {
          onShellReady() {
            timing.ttfb = performance.now() - startTime;
          },
          onAllReady() {
            timing.ttr = performance.now() - startTime;
          },
          onError(error) {
            console.error('Rendering error:', error);
            abort();
          }
        }
      );

      // Collect chunks and generate hydration data
      const result: RenderResult = {
        html: '',
        chunks,
        styles,
        scripts: [
          ...scripts,
          generateHydrationScript(hydration, islands),
          generatePrefetchScript(prefetch)
        ],
        hydrationData,
        timing
      };

      if (cache.enabled) {
        pageCache.set(cacheKey, result);
      }

      return result;
    },

    registerIsland(config: IslandConfig) {
      islandRegistry.set(config.id, config);
    },

    preloadChunk(chunkId: string, content: string) {
      chunkCache.set(chunkId, content);
    },

    clearCache() {
      pageCache.clear();
      chunkCache.clear();
    }
  };
}

function generateHydrationScript(
  strategy: RenderConfig['hydration'],
  islands: Array<IslandConfig & { Component: any; Wrapper: any }>
): string {
  return `
    <script type="module">
      const hydrationQueue = new Set();
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const island = entry.target;
            const id = island.dataset.island;
            const priority = island.dataset.hydration;
            
            hydrationQueue.add({ id, priority });
            observer.unobserve(island);
          }
        });
        
        processHydrationQueue();
      });

      document.querySelectorAll('[data-island]').forEach(island => {
        observer.observe(island);
      });

      async function processHydrationQueue() {
        const sorted = Array.from(hydrationQueue)
          .sort((a, b) => getPriorityScore(a.priority) - getPriorityScore(b.priority));

        for (const { id } of sorted) {
          await import(\`/chunks/\${id}.js\`);
          hydrationQueue.delete(id);
        }
      }

      function getPriorityScore(priority) {
        return { high: 0, low: 1, idle: 2 }[priority] ?? 1;
      }
    </script>
  `;
}

function generatePrefetchScript(config: RenderConfig['prefetch']): string {
  if (!config?.enabled) return '';

  return `
    <script type="module">
      const prefetchObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const link = entry.target;
            const href = link.getAttribute('href');
            
            if (href && !prefetched.has(href)) {
              prefetch(href);
            }
          }
        });
      });

      const prefetched = new Set();

      function prefetch(url) {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = url;
        document.head.appendChild(link);
        prefetched.add(url);
      }

      if ('${config.strategy}' === 'eager') {
        document.querySelectorAll('a[href^="/"]').forEach(link => prefetch(link.href));
      } else if ('${config.strategy}' === 'viewport') {
        document.querySelectorAll('a[href^="/"]').forEach(link => {
          prefetchObserver.observe(link);
        });
      }
    </script>
  `;
} 