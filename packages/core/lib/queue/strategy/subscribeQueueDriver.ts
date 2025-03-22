import { GenericFunction } from '../../interfaces/index.js';
import { DriverJob } from './driverJob.js';

export interface BaseQueueDriver {
  init(): Promise<void>;
}

export interface SubscribeQueueDriver extends BaseQueueDriver {
  initListeners(initOptions: Record<string, any>): Promise<void>;
  initPublisher(): Promise<void>;
  publish(topic: string, payload: any): Promise<any>;
  startListening(callback: GenericFunction): Promise<void>;
  remove(job: DriverJob, options: Record<string, any>): Promise<void>;
  disconnect(): Promise<void>;
}
