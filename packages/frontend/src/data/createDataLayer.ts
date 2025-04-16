import { createStore } from '../store/createStore';
import { createApi } from '../api/createApi';
import { createGraphQL } from '../graphql/createGraphQL';

export interface DataLayerConfig {
  api: ReturnType<typeof createApi>;
  store: ReturnType<typeof createStore>;
  graphql?: ReturnType<typeof createGraphQL>;
  optimistic?: boolean;
  offline?: {
    enabled: boolean;
    storage?: Storage;
    conflictResolution?: 'client-wins' | 'server-wins' | 'manual';
  };
  realtime?: {
    enabled: boolean;
    subscriptions?: boolean;
    debounce?: number;
  };
  cache?: {
    enabled: boolean;
    ttl: number;
    strategy?: 'memory' | 'persistent' | 'hybrid';
  };
}

export interface QueryOptions {
  key: string;
  variables?: Record<string, any>;
  transform?: (data: any) => any;
  refetchInterval?: number;
  staleTime?: number;
  cacheTime?: number;
  retry?: number | boolean;
  retryDelay?: number;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
  onSettled?: (data: any, error: any) => void;
}

export interface MutationOptions {
  optimistic?: boolean;
  rollbackOnError?: boolean;
  retry?: number | boolean;
  onMutate?: (variables: any) => Promise<any>;
  onSuccess?: (data: any, variables: any, context: any) => void;
  onError?: (error: any, variables: any, context: any) => void;
  onSettled?: (data: any, error: any, variables: any, context: any) => void;
}

export function createDataLayer(config: DataLayerConfig) {
  const {
    api,
    store,
    graphql,
    optimistic = true,
    offline = { enabled: true },
    realtime = { enabled: true },
    cache = { enabled: true, ttl: 300000 }
  } = config;

  const queryCache = new Map();
  const subscriptionCache = new Map();
  const pendingMutations = new Set();

  return {
    async query<T = any>(
      queryFn: () => Promise<T>,
      options: QueryOptions
    ): Promise<T> {
      const cacheKey = JSON.stringify({ key: options.key, variables: options.variables });

      // Check cache
      if (cache.enabled) {
        const cached = queryCache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < options.staleTime) {
          return cached.data;
        }
      }

      try {
        // Execute query
        const data = await queryFn();
        
        // Transform data if needed
        const transformedData = options.transform ? options.transform(data) : data;

        // Cache result
        if (cache.enabled) {
          queryCache.set(cacheKey, {
            data: transformedData,
            timestamp: Date.now()
          });
        }

        // Setup real-time updates if enabled
        if (realtime.enabled && graphql) {
          this.setupRealtimeUpdates(options.key, transformedData);
        }

        options.onSuccess?.(transformedData);
        options.onSettled?.(transformedData, null);

        return transformedData;
      } catch (error) {
        options.onError?.(error);
        options.onSettled?.(null, error);
        throw error;
      }
    },

    async mutate<T = any>(
      mutationFn: () => Promise<T>,
      options: MutationOptions
    ): Promise<T> {
      let optimisticData;
      let rollbackData;

      try {
        // Handle optimistic updates
        if (optimistic && options.optimistic) {
          rollbackData = store.getState();
          optimisticData = await options.onMutate?.({});
          if (optimisticData) {
            store.setState(optimisticData);
          }
        }

        // Execute mutation
        const data = await mutationFn();

        // Update cache and subscriptions
        this.invalidateQueries(options.key);
        
        options.onSuccess?.(data, {}, optimisticData);
        options.onSettled?.(data, null, {}, optimisticData);

        return data;
      } catch (error) {
        // Rollback optimistic update
        if (rollbackData && options.rollbackOnError) {
          store.setState(rollbackData);
        }

        options.onError?.(error, {}, optimisticData);
        options.onSettled?.(null, error, {}, optimisticData);
        throw error;
      }
    },

    setupRealtimeUpdates(key: string, initialData: any) {
      if (!graphql || subscriptionCache.has(key)) return;

      const subscription = graphql.subscribe(
        `subscription OnUpdate($key: String!) {
          onUpdate(key: $key) {
            data
          }
        }`,
        { key },
        (data) => {
          // Update cache and store
          queryCache.set(key, {
            data: data.onUpdate.data,
            timestamp: Date.now()
          });
          store.setState({ [key]: data.onUpdate.data });
        }
      );

      subscriptionCache.set(key, subscription);
    },

    invalidateQueries(key?: string) {
      if (key) {
        // Invalidate specific query
        for (const [cacheKey, value] of queryCache.entries()) {
          if (cacheKey.includes(key)) {
            queryCache.delete(cacheKey);
          }
        }
      } else {
        // Invalidate all queries
        queryCache.clear();
      }
    },

    clearCache() {
      queryCache.clear();
      subscriptionCache.forEach(subscription => subscription());
      subscriptionCache.clear();
    }
  };
} 