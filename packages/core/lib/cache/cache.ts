import { ConfigService } from '../config/service.js';
import { CacheDriver } from './interfaces/index.js';
import { CacheService } from './service.js';
import { genKeyFromObj } from './utils/genKey.js';

export class Cache {
  static store = CacheStore;

  static genKey = GenCacheKey;
}

export function GenCacheKey(obj: Record<string, any>): string {
  return genKeyFromObj(obj);
}

export function CacheStore(store?: string): CacheDriver {
  const cacheConfig = ConfigService.get('cache');
  store = store || cacheConfig.default;
  return CacheService.createStore(store, cacheConfig.stores[store]);
}
