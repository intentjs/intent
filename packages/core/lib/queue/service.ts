import { Injectable, Type } from '@nestjs/common';
import {
  DbQueueDriverOptions,
  QueueDriverOptions,
  QueueOptions,
  RedisQueueDriverOptions,
  SqsQueueDriverOptions,
  SyncQueueDriverOptions,
} from './interfaces/index.js';
import {
  DatabaseQueueDriver,
  RedisQueueDriver,
  SqsQueueDriver,
  SyncQueueDriver,
} from './drivers/index.js';
import { QueueDrivers } from './strategy/index.js';
import { ConfigService } from '../config/service.js';
import { isEmpty, Str } from '../utils/index.js';

@Injectable()
export class QueueService {
  private static queueDriverMap = {
    sync: SyncQueueDriver,
    sqs: SqsQueueDriver,
    redis: RedisQueueDriver,
    db: DatabaseQueueDriver,
  };

  private static drivers: Map<
    string,
    { config: Record<string, any>; client: QueueDrivers }
  >;

  constructor(private config: ConfigService) {
    QueueService.drivers = new Map<
      string,
      { config: Record<string, any>; client: QueueDrivers }
    >();
  }

  static makeDriver<T = QueueDrivers>(
    connection: string,
    options?:
      | SyncQueueDriverOptions
      | SqsQueueDriverOptions
      | RedisQueueDriverOptions
      | QueueDriverOptions
      | DbQueueDriverOptions,
  ): { config: QueueDriverOptions; client: T } {
    if (this.drivers.has(connection)) {
      return this.drivers.get(connection) as {
        config: QueueDriverOptions;
        client: T;
      };
    }

    const config = ConfigService.get('queue') as QueueOptions;
    options = options ?? config.connections[connection];
    if (isEmpty(options)) {
      throw new Error(
        `Invalid options passed while trying to make a new driver [${connection}] for Queue`,
      );
    }

    const driverName: string | Type<QueueDrivers> = options.driver;
    const driver: Type<QueueDrivers> = Str.isString(driverName)
      ? QueueService.queueDriverMap[driverName as unknown as string]
      : driverName;

    this.drivers.set(connection, {
      config: options,
      client: new driver(options),
    });

    return this.drivers.get(connection) as {
      config: QueueDriverOptions;
      client: T;
    };
  }
}
