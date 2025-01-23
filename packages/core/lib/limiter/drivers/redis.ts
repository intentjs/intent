import { RedisDriverOption } from '../../cache';
import { Package } from '../../utils';
import { LimiterDriver } from '../interfaces/limiterDriver';

export class RedisDriver implements LimiterDriver {
  private client: any;

  constructor(private options: RedisDriverOption) {
    const IORedis = Package.load('ioredis');
    if (options.url) {
      this.client = new IORedis(options.url, { db: options.database || 0 });
    } else {
      this.client = new IORedis({
        host: options.host,
        port: options.port,
        username: options.username,
        password: options.password,
        db: options.database,
      });
    }
  }

  async setCounter(
    key: string,
    value: number,
    ttlInSec?: number,
  ): Promise<void> {
    await this.set(key, value, ttlInSec);
  }

  async incrementCounter(key: string): Promise<void> {
    await this.client.incr(this.storeKey(key));
  }

  async decrementCounter(key: string): Promise<boolean> {
    if ([undefined, 0].includes(+(await this.get(key)))) {
      return false;
    }
    await this.client.decr(this.storeKey(key));
    return true;
  }

  async delScoresLessThan(key: string, val: number): Promise<any> {
    let ele = await this.client.lindex(this.storeKey(key), 0);
    if (!ele) return;
    while (ele && ele < val) {
      await this.client.lpop(this.storeKey(key), 0);
      ele = await this.client.lindex(this.storeKey(key), 0);
    }
  }

  async addNewScore(key: string, val: number) {
    await this.client.ladd(this.storeKey(key), val);
  }

  async getScoresCount(key: string): Promise<number> {
    return await this.client.llen(this.storeKey(key));
  }

  async getCount(key: string): Promise<number> {
    return +(await this.client.get(key));
  }

  private async get(key: string): Promise<any> {
    const value = await this.client.get(this.storeKey(key));
    if (!value) return null;
    try {
      return JSON.parse(value);
    } catch (e) {
      return value;
    }
  }

  private async set(
    key: string,
    value: string | number | Record<string, any>,
    ttlInSec?: number,
  ): Promise<boolean> {
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

  private storeKey(key: string): string {
    return `${this.options.prefix}:::${key}`;
  }
}
