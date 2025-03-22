import { DriverJob } from './driverJob.js';
import { Message } from './message.js';
import { BaseQueueDriver } from './subscribeQueueDriver.js';

export interface PollQueueDriver extends BaseQueueDriver {
  push(message: string, rawMessage: Message): Promise<void>;

  pull(options: Record<string, any>): Promise<DriverJob[] | null>;

  remove(job: DriverJob, options: Record<string, any>): Promise<void>;

  purge(options: Record<string, any>): Promise<void>;

  count(options: Record<string, any>): Promise<number>;

  scheduledTask?(options: Record<string, any>): Promise<void>;
}
