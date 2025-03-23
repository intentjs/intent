import { Injectable } from '@intentjs/core';
import { Job } from '@intentjs/core/queue';

@Injectable()
export class QueueJobs {
  @Job('db_job')
  async handleDbJob(data: Record<string, any>) {
    console.log('db job ===> ', data);
  }

  @Job('redis_job', { connection: 'redis' })
  async handleRedisJob(data: Record<string, any>) {
    console.log(data);
  }
}
