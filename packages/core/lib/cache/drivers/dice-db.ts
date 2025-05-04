import { GenericFunction } from '../../interfaces/index.js';
import { Package } from '../../utils/packageLoader.js';
import { CacheDriver, RedisDriverOption } from '../interfaces/index.js';

export class DiceDbDriver implements CacheDriver {
  private client: any;

  constructor(private options: RedisDriverOption) {
    this.initializeModules();
  }

  async get(key: string): Promise<any> {
    await this.initializeModules();
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
    value: string | number | Record<string, any>,
    ttlInSec?: number,
  ): Promise<boolean> {
    await this.initializeModules();
    try {
      const redisKey = this.storeKey(key);
      ttlInSec
        ? await this.client.set(redisKey, JSON.stringify(value), 'EX', ttlInSec)
        : await this.client.set(redisKey, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  }

  async has(key: string): Promise<boolean> {
    await this.initializeModules();
    const num = await this.client.exists(this.storeKey(key));
    return !!num;
  }

  async remember<T = any>(
    key: string,
    cb: GenericFunction,
    ttlInSec: number,
  ): Promise<T> {
    const value = await this.get(key);
    if (value) return value;
    const response = await cb();
    if (response) await this.set(key, response, ttlInSec);

    return response;
  }

  async rememberForever<T = any>(key: string, cb: GenericFunction): Promise<T> {
    const value = await this.get(key);
    if (value) return value;
    const response = await cb();
    if (response) await this.set(key, response);
    return response;
  }

  async forget(key: string): Promise<boolean> {
    await this.initializeModules();
    try {
      await this.client.del(this.storeKey(key));
      return true;
    } catch (e) {
      return false;
    }
  }

  private storeKey(key: string): string {
    return `${this.options.prefix}:::${key}`;
  }

  getClient<T>(): T {
    return this.client as unknown as T;
  }

  async initializeModules(): Promise<void> {
    if (this.client) return;
    const { Redis } = await Package.load('ioredis');
    if (this.options.url) {
      this.client = new Redis(this.options.url, {
        db: this.options.database || 0,
        enableReadyCheck: false,
      });
    } else {
      this.client = new Redis({
        host: this.options.host,
        port: this.options.port,
        username: this.options.username,
        password: this.options.password,
        db: this.options.database,
        enableReadyCheck: false,
      });
    }
  }
}
