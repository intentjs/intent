import { QueueMetadata } from '../metadata.js';
import { InternalMessage, DriverJob } from '../strategy/index.js';
import { PollQueueDriver } from '../strategy/pollQueueDriver.js';

export class SyncQueueDriver implements PollQueueDriver {
  constructor() {}

  async init(): Promise<void> {}

  async push(message: string, rawPayload: InternalMessage): Promise<void> {
    const job = QueueMetadata.getJob(rawPayload.job);
    job.target(rawPayload.data);
    return;
  }

  async pull(options: Record<string, any>): Promise<DriverJob[]> {
    return [];
  }

  async remove(job: DriverJob, options: Record<string, any>): Promise<void> {
    return;
  }

  async purge(options: Record<string, any>): Promise<void> {
    return;
  }

  async count(options: Record<string, any>): Promise<number> {
    return 0;
  }
}
