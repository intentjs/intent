import { Injectable } from '@nestjs/common';
import { InMemoryDriver } from './drivers/inMemory';
import { RedisDriver } from './drivers/redis';
import {
  CacheDriver,
  InMemoryDriverOption,
  RedisDriverOption,
} from './interfaces';

@Injectable()
export class CacheService {
  static driverMap = { redis: RedisDriver, memory: InMemoryDriver };
  static stores: Record<string, CacheDriver>;

  constructor() {}

  static createStore(
    store: string,
    options: RedisDriverOption | InMemoryDriverOption,
  ) {
    if (CacheService.stores[store]) return CacheService.stores[store];
    const { driver: driverName } = options;
    const storeDriver = CacheService.driverMap[driverName];
    CacheService.stores[store] = new storeDriver(options as any);
    return CacheService.stores[store];
  }
}
