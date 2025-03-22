import { Type } from '@nestjs/common';
import { QueueDrivers } from '../strategy/index.js';

export interface QueueDriverOptions {
  listenerType: 'poll' | 'subscribe';
  driver: Type<QueueDrivers>;
  [key: string]: string | number | Record<string, any>;
}

export interface SyncQueueDriverOptions {
  listenerType: 'poll';
  driver: 'sync';
  queue?: string;
}

export interface SqsQueueDriverOptions {
  listenerType: 'poll';
  driver: 'sqs';
  region: string;
  apiVersion: string;
  prefix: string;
  queue: string;
  suffix?: string;
  credentials: Record<string, any>;
  profile?: string;
  accessKey?: string;
  accessSecret?: string;
}

export interface RedisQueueDriverOptions {
  listenerType: 'poll';
  driver: 'redis';
  host?: string;
  port?: number;
  url?: string;
  username?: string;
  password?: string;
  database: number;
  queue: string;
  prefix: string;
}

export interface DbQueueDriverOptions {
  listenerType: 'poll';
  driver: 'db';
  connection?: string;
  table: string;
  queue: string;
}

export interface QueueOptions {
  isGlobal?: boolean;
  default: string;
  connections: {
    [key: string]:
      | SyncQueueDriverOptions
      | SqsQueueDriverOptions
      | RedisQueueDriverOptions
      | QueueDriverOptions
      | DbQueueDriverOptions;
  };
}

export interface ListenerOptions {
  sleep?: number;
  connection?: string;
  queue?: string;
  schedulerInterval?: number;
  logger?: boolean;
}
