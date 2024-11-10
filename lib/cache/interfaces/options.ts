import { ModuleMetadata, Type } from '@nestjs/common';

export interface RedisDriverOption {
  driver?: 'redis';
  host?: string;
  port?: number;
  url?: string;
  username?: string;
  password?: string;
  database?: number;
  prefix?: string;
}

export interface InMemoryDriverOption {
  driver: 'memory';
  prefix: string;
}

export interface CacheOptions {
  isGlobal?: boolean;
  default: string;
  stores: {
    [key: string]: RedisDriverOption | InMemoryDriverOption;
  };
}

export interface CacheAsyncOptionsFactory {
  createCacheOptions(): Promise<CacheOptions> | CacheOptions;
}

export interface CacheAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  name?: string;
  isGlobal: boolean;
  useExisting?: Type<CacheOptions>;
  useClass?: Type<CacheAsyncOptionsFactory>;
  useFactory?: (...args: any[]) => Promise<CacheOptions> | CacheOptions;
  inject?: any[];
}
