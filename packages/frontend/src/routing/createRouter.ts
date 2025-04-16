import { createElement, Suspense } from 'react';
import { createBrowserHistory, History } from 'history';
import { matchPath } from 'react-router-dom';

export interface RouteConfig {
  path: string;
  component: React.ComponentType<any>;
  layout?: React.ComponentType<any>;
  parallel?: {
    [key: string]: {
      component: React.ComponentType<any>;
      fallback?: React.ReactNode;
    };
  };
  loader?: () => Promise<any>;
  action?: (params: any) => Promise<any>;
  errorBoundary?: React.ComponentType<any>;
  meta?: {
    auth?: boolean;
    roles?: string[];
    prefetch?: boolean;
    transition?: {
      enter?: string;
      exit?: string;
      duration?: number;
    };
  };
}

export interface RouterConfig {
  routes: RouteConfig[];
  history?: History;
  fallback?: React.ReactNode;
  transitions?: boolean;
  prefetch?: boolean;
  caching?: {
    enabled: boolean;
    maxSize: number;
  };
}

export interface RouterResult {
  component: React.ReactElement;
  layout?: React.ReactElement;
  parallel?: Record<string, React.ReactElement>;
  data?: any;
  error?: any;
}

export function createRouter(config: RouterConfig) {
  const {
    routes,
    history = createBrowserHistory(),
    fallback,
    transitions = true,
    prefetch = true,
    caching = { enabled: true, maxSize: 50 }
  } = config;

  const cache = new Map<string, any>();
  const routeCache = new Map<string, RouteConfig>();
  const componentCache = new Map<string, React.ComponentType>();

  // Build route cache
  routes.forEach(route => {
    routeCache.set(route.path, route);
  });

  return {
    async resolve(pathname: string): Promise<RouterResult> {
      // Find matching route
      const matchedRoute = routes.find(route => matchPath(pathname, route.path));
      
      if (!matchedRoute) {
        throw new Error(`No route found for path: ${pathname}`);
      }

      try {
        // Load data
        let data;
        if (matchedRoute.loader) {
          const cacheKey = `${pathname}-data`;
          if (caching.enabled && cache.has(cacheKey)) {
            data = cache.get(cacheKey);
          } else {
            data = await matchedRoute.loader();
            if (caching.enabled) {
              cache.set(cacheKey, data);
            }
          }
        }

        // Create main component
        const component = createElement(
          matchedRoute.component,
          { data },
          createElement(Suspense, { fallback })
        );

        // Create layout if exists
        const layout = matchedRoute.layout
          ? createElement(
              matchedRoute.layout,
              null,
              createElement(Suspense, { fallback }, component)
            )
          : undefined;

        // Create parallel routes
        const parallel: Record<string, React.ReactElement> = {};
        if (matchedRoute.parallel) {
          for (const [key, config] of Object.entries(matchedRoute.parallel)) {
            parallel[key] = createElement(
              config.component,
              { data },
              createElement(Suspense, { fallback: config.fallback })
            );
          }
        }

        // Setup transitions
        if (transitions && matchedRoute.meta?.transition) {
          this.setupTransitions(component, matchedRoute.meta.transition);
        }

        // Setup prefetching
        if (prefetch && matchedRoute.meta?.prefetch) {
          this.prefetchRoutes(pathname);
        }

        return { component, layout, parallel, data };
      } catch (error) {
        if (matchedRoute.errorBoundary) {
          return {
            component: createElement(matchedRoute.errorBoundary, { error }),
            error
          };
        }
        throw error;
      }
    },

    setupTransitions(component: React.ReactElement, config: RouteConfig['meta']['transition']) {
      if (!config) return component;

      return createElement('div', {
        style: {
          animation: `${config.enter} ${config.duration || 300}ms ease-in-out`
        },
        children: component
      });
    },

    async prefetchRoutes(currentPath: string) {
      const adjacentRoutes = routes.filter(route => {
        const match = matchPath(currentPath, route.path);
        return match && route.path !== currentPath;
      });

      for (const route of adjacentRoutes) {
        if (route.loader && !cache.has(`${route.path}-data`)) {
          try {
            const data = await route.loader();
            if (caching.enabled) {
              cache.set(`${route.path}-data`, data);
            }
          } catch (error) {
            console.warn(`Failed to prefetch data for route: ${route.path}`, error);
          }
        }
      }
    },

    navigate(to: string, options: { replace?: boolean; state?: any } = {}) {
      if (options.replace) {
        history.replace(to, options.state);
      } else {
        history.push(to, options.state);
      }
    },

    subscribe(listener: (location: Location) => void) {
      return history.listen(({ location }) => listener(location));
    },

    clearCache() {
      cache.clear();
      componentCache.clear();
    }
  };
} 