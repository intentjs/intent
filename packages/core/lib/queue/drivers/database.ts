import { ObjectionService } from '../../database/index.js';
import { DbQueueDriverOptions } from '../interfaces/index.js';
import { DbJob } from '../interfaces/job.js';
import { InternalMessage } from '../strategy/index.js';
import { PollQueueDriver } from '../strategy/pollQueueDriver.js';

export class DatabaseQueueDriver implements PollQueueDriver {
  private client: any;

  constructor(private options: DbQueueDriverOptions) {
    this.client = ObjectionService.connection(options?.connection);
  }

  async init(): Promise<void> {
    return;
  }

  async push(message: string, rawPayload: InternalMessage): Promise<void> {
    await this.client
      .insert({
        id: rawPayload.id,
        queue: rawPayload.queue,
        payload: message,
        scheduledAt: rawPayload.delay,
      })
      .into(this.options.table);
  }

  async pull(options: Record<string, any>): Promise<DbJob[] | null> {
    const messages = await this.client
      .select('*')
      .where('queue', options.queue)
      .where('scheduled_at', '<=', Date.now())
      .from(this.options.table);
    return messages.map(m => new DbJob(m));
  }

  async remove(job: DbJob, options: Record<string, any>): Promise<void> {
    await this.client
      .del()
      .where('id', job.getId())
      .where('queue', options.queue)
      .from(this.options.table);
  }

  async purge(options: Record<string, any>): Promise<void> {
    await this.client
      .del()
      .where('queue', options.queue)
      .from(this.options.table);
  }

  async count(options: Record<string, any>): Promise<number> {
    return await this.client
      .count('1')
      .where('queue', options.queue)
      .from(this.options.table);
  }
}
