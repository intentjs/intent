import { MemoryDriver, RedisDriver } from '../drivers';

export interface LimiterOptions {
  isGlobal?: boolean;
  driver: LimiterDriverType;
  defaultTokensCount?: number;
  defaultRefillIntervalInSeconds?: number;
  connection?: RedisConnection;
}

export interface RedisConnection {
  host: string;
  port: number;
  database: number;
  password: string;
}

export enum LimiterDriverType {
  REDIS = 'redis',
  IN_MEMORY = 'in-memory',
}

export const defaultOptions = {
  isGlobal: true,
  driver: LimiterDriverType.IN_MEMORY,
  defaultTokensCount: 40,
  defaultRefillIntervalInSeconds: 10,
};

export const DriversMap = {
  [LimiterDriverType.REDIS]: RedisDriver,
  [LimiterDriverType.IN_MEMORY]: MemoryDriver,
};
