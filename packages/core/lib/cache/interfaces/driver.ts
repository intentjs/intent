import { GenericFunction } from '../../interfaces/index.js';

export interface CacheDriver {
  /**
   * Return the value stored corresponding to the key
   * @param key
   */
  get<T = any>(key: string): Promise<T>;

  /**
   * Store the value with the passed key
   * @param key
   * @param value
   * @param ttlInSec
   */
  set(
    key: string,
    value: Record<string, any> | string,
    ttlInSec?: number,
  ): Promise<boolean>;

  /**
   * Check for existence of a particular key
   * @param key
   */
  has(key: string): Promise<boolean>;

  remember<T = any>(
    key: string,
    cb: GenericFunction,
    ttlInSec: number,
  ): Promise<T>;

  rememberForever<T = any>(key: string, cb: GenericFunction): Promise<T>;

  forget(key: string): Promise<boolean>;

  getClient<T>(): T;
}
