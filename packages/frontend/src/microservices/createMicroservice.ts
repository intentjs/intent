import type { Api } from '../api/createApi';

export interface ServiceConfig {
  name: string;
  version: string;
  endpoints: string[];
  healthCheck?: string;
  timeout?: number;
  retries?: number;
}

export interface Microservice {
  name: string;
  version: string;
  api: Api;
  health: () => Promise<boolean>;
  discover: () => Promise<string[]>;
  balance: () => string;
}

export interface LoadBalancer {
  strategy: 'round-robin' | 'least-connections' | 'random';
  endpoints: string[];
  currentIndex: number;
  connections: Map<string, number>;
}

export function createMicroservice(config: ServiceConfig, api: Api): Microservice {
  const {
    name,
    version,
    endpoints,
    healthCheck = '/health',
    timeout = 5000,
    retries = 3
  } = config;

  const loadBalancer: LoadBalancer = {
    strategy: 'round-robin',
    endpoints,
    currentIndex: 0,
    connections: new Map()
  };

  const microservice: Microservice = {
    name,
    version,
    api,

    async health(): Promise<boolean> {
      try {
        const response = await api.request({
          method: 'GET',
          url: healthCheck,
          timeout
        });
        return response.status === 200;
      } catch {
        return false;
      }
    },

    async discover(): Promise<string[]> {
      const healthyEndpoints = await Promise.all(
        endpoints.map(async (endpoint) => {
          const isHealthy = await this.health();
          return isHealthy ? endpoint : null;
        })
      );
      return healthyEndpoints.filter((endpoint): endpoint is string => endpoint !== null);
    },

    balance(): string {
      switch (loadBalancer.strategy) {
        case 'round-robin':
          loadBalancer.currentIndex = (loadBalancer.currentIndex + 1) % loadBalancer.endpoints.length;
          return loadBalancer.endpoints[loadBalancer.currentIndex];
        
        case 'least-connections':
          const minConnections = Math.min(...loadBalancer.connections.values());
          const leastLoaded = loadBalancer.endpoints.find(
            endpoint => loadBalancer.connections.get(endpoint) === minConnections
          );
          return leastLoaded || loadBalancer.endpoints[0];
        
        case 'random':
          return loadBalancer.endpoints[Math.floor(Math.random() * loadBalancer.endpoints.length)];
        
        default:
          return loadBalancer.endpoints[0];
      }
    }
  };

  return microservice;
}

export default createMicroservice; 