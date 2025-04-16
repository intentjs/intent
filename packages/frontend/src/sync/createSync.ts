import { createStore } from '../store/createStore';
import type { Api } from '../api/createApi';

export interface SyncConfig {
  store: ReturnType<typeof createStore>;
  api: Api;
  collections: {
    [key: string]: {
      endpoint: string;
      primaryKey: string;
      syncInterval?: number;
      conflictResolution?: 'server-wins' | 'client-wins' | 'manual';
    };
  };
  offline?: {
    enabled: boolean;
    storage?: Storage;
    maxQueueSize?: number;
  };
}

export interface SyncOperation {
  id: string;
  type: 'create' | 'update' | 'delete';
  collection: string;
  data: any;
  timestamp: number;
}

export interface Sync {
  start: () => Promise<void>;
  stop: () => Promise<void>;
  sync: (collection: string) => Promise<void>;
  queue: SyncOperation[];
  status: 'online' | 'offline' | 'syncing';
}

export function createSync(config: SyncConfig): Sync {
  const {
    store,
    api,
    collections,
    offline = { enabled: false }
  } = config;

  let syncInterval: NodeJS.Timeout | null = null;
  const operationQueue: SyncOperation[] = [];
  let isOnline = navigator.onLine;

  const sync: Sync = {
    queue: operationQueue,
    status: isOnline ? 'online' : 'offline',

    async start() {
      // Start periodic sync for each collection
      Object.entries(collections).forEach(([name, config]) => {
        if (config.syncInterval) {
          setInterval(() => this.sync(name), config.syncInterval);
        }
      });

      // Handle online/offline events
      window.addEventListener('online', () => {
        isOnline = true;
        this.status = 'online';
        this.processQueue();
      });

      window.addEventListener('offline', () => {
        isOnline = false;
        this.status = 'offline';
      });
    },

    async stop() {
      if (syncInterval) {
        clearInterval(syncInterval);
        syncInterval = null;
      }
    },

    async sync(collection: string) {
      if (!isOnline) {
        this.status = 'offline';
        return;
      }

      this.status = 'syncing';
      const collectionConfig = collections[collection];

      try {
        // Fetch server data
        const response = await api.request({
          method: 'GET',
          url: collectionConfig.endpoint
        });

        // Get local data
        const localData = store.getState().state[collection] || [];

        // Merge data based on conflict resolution strategy
        const mergedData = this.mergeData(
          localData,
          response.data,
          collectionConfig.conflictResolution || 'server-wins'
        );

        // Update store
        store.setState({ [collection]: mergedData });

        this.status = 'online';
      } catch (error) {
        console.error(`Sync failed for ${collection}:`, error);
        this.status = 'offline';
      }
    },

    mergeData(local: any[], server: any[], strategy: 'server-wins' | 'client-wins' | 'manual') {
      const merged = new Map();

      // Add all server data
      server.forEach(item => {
        merged.set(item[collections[item.collection].primaryKey], item);
      });

      // Merge local data based on strategy
      local.forEach(item => {
        const key = item[collections[item.collection].primaryKey];
        const serverItem = merged.get(key);

        if (!serverItem) {
          merged.set(key, item);
        } else if (strategy === 'client-wins') {
          merged.set(key, item);
        } else if (strategy === 'manual') {
          // For manual resolution, keep both versions and mark for review
          merged.set(key, {
            ...serverItem,
            _conflict: {
              server: serverItem,
              client: item,
              resolved: false
            }
          });
        }
      });

      return Array.from(merged.values());
    },

    async processQueue() {
      if (!isOnline || operationQueue.length === 0) return;

      for (const operation of operationQueue) {
        try {
          await api.request({
            method: operation.type === 'create' ? 'POST' :
                   operation.type === 'update' ? 'PUT' : 'DELETE',
            url: `${collections[operation.collection].endpoint}${
              operation.type !== 'create' ? `/${operation.data.id}` : ''
            }`,
            data: operation.type !== 'delete' ? operation.data : undefined
          });

          // Remove processed operation
          const index = operationQueue.indexOf(operation);
          if (index > -1) {
            operationQueue.splice(index, 1);
          }
        } catch (error) {
          console.error('Failed to process operation:', error);
          break;
        }
      }
    }
  };

  return sync;
}

export default createSync; 