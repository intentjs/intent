import { GenericFunction } from '../../interfaces/index.js';
import { Package } from '../../utils/packageLoader.js';
import { CacheDriver, InMemoryDriverOption } from '../interfaces/index.js';

export class InMemoryDriver implements CacheDriver {
  private client: any;

  constructor(private options: InMemoryDriverOption) {
    this.initialiseModules();
  }

  async get<T>(key: string): Promise<T> {
    await this.initialiseModules();
    const value = await this.client.get(this.storeKey(key));
    if (!value) return null;
    try {
      return JSON.parse(value);
    } catch (e) {
      return value;
    }
  }

  async set(
    key: string,
    value: string | Record<string, any>,
    ttlInSec?: number | undefined,
  ): Promise<boolean> {
    await this.initialiseModules();
    const cacheKey = this.storeKey(key);

    if (ttlInSec) {
      return this.client.set(cacheKey, value, ttlInSec);
    }

    return this.client.set(cacheKey, value);
  }

  async has(key: string): Promise<boolean> {
    await this.initialiseModules();
    const cacheKey = this.storeKey(key);
    return this.client.has(cacheKey);
  }

  async remember<T = any>(
    key: string,
    cb: GenericFunction,
    ttlInSec: number,
  ): Promise<T> {
    await this.initialiseModules();
    const exists = await this.has(key);
    if (exists) return this.get(key);

    try {
      const response = await cb();
      await this.set(key, response, ttlInSec);
      return response;
    } catch (e) {
      throw e;
    }
  }

  async rememberForever<T = any>(key: string, cb: GenericFunction): Promise<T> {
    const exists = await this.has(key);
    if (exists) return this.get(key);

    try {
      const response = await cb();
      await this.set(key, response);
      return response;
    } catch (e) {
      throw e;
    }
  }

  async forget(key: string): Promise<boolean> {
    await this.initialiseModules();
    try {
      const cacheKey = this.storeKey(key);
      await this.client.del(cacheKey);
      return true;
    } catch {
      return false;
    }
  }

  private storeKey(key: string): string {
    return `${this.options.prefix}:::${key}`;
  }

  getClient<T>(): T {
    return this.client as unknown as T;
  }

  async initialiseModules(): Promise<void> {
    if (this.client) return;
    const { default: NodeCache } = await Package.load('node-cache');
    this.client = new NodeCache({ stdTTL: 100, checkperiod: 120 });
  }
}
