import { ConfigService } from '../config';
import { CacheDriver } from './interfaces';
import { CacheService } from './service';
import { genKeyFromObj } from './utils/genKey';

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
