import { Injectable } from '@nestjs/common';
import { Job } from '../queue/decorators.js';
import { IntentEventConstants } from './constants.js';
import { EventListenerRunner } from './runner.js';

@Injectable()
export class EventQueueWorker {
  @Job(IntentEventConstants.eventJobName)
  async handle(data: Record<string, any>): Promise<void> {
    const { eventName, eventData } = data;
    const runner = new EventListenerRunner();
    await runner.handle(eventName, eventData);
  }
}
