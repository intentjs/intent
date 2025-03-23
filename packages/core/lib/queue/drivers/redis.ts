import { ulid } from 'ulid';
import { Package } from '../../utils/index.js';
import { validateOptions } from '../../utils/helpers.js';
import { RedisJob } from '../interfaces/job.js';
import { RedisQueueOptionsDto } from '../schema/index.js';
import { InternalMessage } from '../strategy/index.js';
import { PollQueueDriver } from '../strategy/pollQueueDriver.js';

const FIND_DELAYED_JOB = `
local source_key = KEYS[1]
local destination_key = KEYS[2]
local score_limit = tonumber(ARGV[1])
local max_members = 20

-- Get the member with the lowest score
local results = redis.call('ZRANGEBYSCORE', source_key, '-inf', score_limit, 'WITHSCORES', 'LIMIT', 0, max_members)

local processed = {}
for i = 1, #results, 2 do
    local member = results[i]
    local score = results[i+1]
    
    -- Remove the member from the sorted set
    redis.call('ZREM', source_key, member)
    
    -- Push the member to the destination list
    redis.call('RPUSH', destination_key, member)
    
    table.insert(processed, {member, score})
end

return processed
`;

export class RedisQueueDriver implements PollQueueDriver {
  private client: any;
  private queuePrefix: string;
  private IORedis: any;
  constructor(private options: Record<string, any>) {
    validateOptions(this.options, RedisQueueOptionsDto, {
      cls: 'RedisQueueDriver',
    });
    this.queuePrefix = this.options.prefix || 'intent_queue';
    this.initializeModules();
  }

  async init(): Promise<void> {}

  async push(message: string, rawPayload: InternalMessage): Promise<void> {
    await this.initializeModules();
    if (rawPayload.delay > Date.now()) {
      await this.pushToDelayedQueue(message, rawPayload);
      return;
    }

    await this.client.rpush(
      this.getQueue(`${rawPayload.queue}`),
      this.getProcessedMessage(message),
    );
  }

  async pull(options: Record<string, any>): Promise<RedisJob[]> {
    await this.initializeModules();
    const data = await this.client.lpop(this.getQueue(options.queue));
    return data ? [new RedisJob({ message: data })] : [];
  }

  async remove(): Promise<void> {
    return;
  }

  async purge(options: Record<string, any>): Promise<void> {
    await this.client.del(this.getQueue(options.queue));
    await this.client.del(this.getDelayedQueue(options.queue));
  }

  async count(options: Record<string, any>): Promise<number> {
    return await this.client.llen(this.getQueue(options.queue));
  }

  async pushToDelayedQueue(
    message: string,
    rawPayload: InternalMessage,
  ): Promise<void> {
    await this.initializeModules();
    await this.client.zadd(
      this.getDelayedQueue(`${rawPayload.queue}`),
      rawPayload.delay,
      this.getProcessedMessage(message),
    );
  }

  getProcessedMessage(message: string): string {
    const data = JSON.parse(message);
    data.id = ulid();
    return JSON.stringify(data);
  }

  async scheduledTask(options: Record<string, any>): Promise<void> {
    await (this.client as any).findDelayedJob(
      this.getDelayedQueue(options.queue),
      this.getQueue(options.queue),
      Date.now(),
    );
  }

  getDelayedQueue(queue: string): string {
    return `${this.queuePrefix}::${queue}::delayed`;
  }

  getQueue(queue: string): string {
    return `${this.queuePrefix}::${queue}`;
  }

  async initializeModules(): Promise<void> {
    if (this.IORedis && this.client) return Promise.resolve();
    const { Redis } = await Package.load('ioredis');
    this.IORedis = Redis;
    this.client = new this.IORedis(this.options);
    this.client.defineCommand('findDelayedJob', {
      numberOfKeys: 2,
      lua: FIND_DELAYED_JOB,
    });
  }
}
