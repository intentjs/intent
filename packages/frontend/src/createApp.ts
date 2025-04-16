import { createStore } from './store/createStore';
import { createApi } from './api/createApi';
import { createSSR } from './ssr/createSSR';
import type { AppConfig } from './types';

export interface CreateAppOptions {
  config: AppConfig;
  plugins?: any[];
}

export function createApp(options: CreateAppOptions) {
  const { config, plugins = [] } = options;

  // Initialize core services
  const store = createStore(config.store);
  const api = createApi(config.api);
  const ssr = createSSR(config.ssr);

  // Initialize plugins
  const initializedPlugins = plugins.map(plugin => plugin({ store, api, ssr }));

  return {
    store,
    api,
    ssr,
    plugins: initializedPlugins,
    
    // Utility methods
    async start() {
      await api.connect();
      await ssr.start();
    },
    
    async stop() {
      await api.disconnect();
      await ssr.stop();
    }
  };
}

export default createApp; 