import { Injectable } from '@nestjs/common';
import { ConfigService } from '../config/service.js';
import { GenericFunction } from '../interfaces/index.js';
import { QueueOptions } from './interfaces/index.js';
import { JobOptions } from './strategy/index.js';

interface JobTarget {
  options: JobOptions;
  target: GenericFunction;
}

@Injectable()
export class QueueMetadata {
  private static data: QueueOptions;
  private static defaultOptions: Record<
    string,
    string | number | boolean | undefined
  >;
  private static store: Record<string, any> = { jobs: {} };

  constructor(private config: ConfigService) {
    const data = this.config.get('queue') as QueueOptions;
    QueueMetadata.data = data;
    QueueMetadata.defaultOptions = {
      connection: data.default,
      queue: data.connections[data.default].queue as string,
      delay: 10,
      tries: 5,
      timeout: 30,
      sleep: 10000,
    };
  }

  static getDefaultOptions(): Record<string, any> {
    return QueueMetadata.defaultOptions;
  }

  static getData(): QueueOptions {
    return QueueMetadata.data;
  }

  static addJob(jobName: string, target: JobTarget): void {
    QueueMetadata.store.jobs[jobName] = target;
  }

  static getJob(jobName: string): JobTarget {
    return QueueMetadata.store.jobs[jobName];
  }

  static getAllJobs(): Record<string, any> {
    return QueueMetadata.store.jobs;
  }
}
