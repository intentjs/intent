import 'reflect-metadata';
import { Dispatch } from '../queue/queue.js';
import { JobOptions } from '../queue/strategy/index.js';
import { isBoolean } from '../utils/helpers.js';
import { IntentEventConstants } from './constants.js';
import { difference } from './helpers.js';
import { EventListenerRunner } from './runner.js';

export class EmitsEvent {
  private reservedKeyNames = [
    'fetchPayload',
    'emit',
    'reservedKeyNames',
    'dispatch',
  ];

  /**
   * Only emit an event if the condition is met
   */
  async emitIf(condition: boolean): Promise<void> {
    condition && (await this.emit());
  }

  /**
   * Only emit an event if the condition is not met
   */
  async emitUnless(condition: boolean): Promise<void> {
    !condition && (await this.emit());
  }

  /**
   * Emit function
   * @returns Promise<void>
   */
  async emit(): Promise<void> {
    const eventName = Reflect.getMetadata(
      IntentEventConstants.eventEmitterName,
      this.constructor,
    );

    const overrideJobOptions =
      this['shouldBeQueued'] && this['shouldBeQueued']();

    if (!overrideJobOptions) {
      const runner = new EventListenerRunner();
      await runner.handle(eventName, this.fetchPayload());
      return;
    }

    await this.dispatch(
      eventName,
      !isBoolean(overrideJobOptions) && overrideJobOptions,
    );
  }

  fetchPayload(): Record<string, any> {
    type ObjectKey = keyof typeof this;

    const payloadKeys = difference(
      Object.getOwnPropertyNames(this),
      this.reservedKeyNames,
    ) as ObjectKey[];

    const payload = {} as Record<string, any>;
    for (const key of payloadKeys) {
      payload[key as string] = this[key];
    }

    return payload;
  }

  /**
   * Dispatches the job to queue
   * @param eventName
   * @param queueConnection
   *
   * @returns Promise<void>
   */
  async dispatch(
    eventName: string,
    overrideJobOptions: JobOptions,
  ): Promise<void> {
    const connection =
      overrideJobOptions && overrideJobOptions['connection']
        ? overrideJobOptions['connection']
        : this['connection'];
    const queue =
      overrideJobOptions && overrideJobOptions['queue']
        ? overrideJobOptions['queue']
        : this['queue'];

    const delay =
      overrideJobOptions && overrideJobOptions['delay']
        ? +overrideJobOptions['delay']
        : this['delay'];

    const tries =
      overrideJobOptions && overrideJobOptions['tries']
        ? +overrideJobOptions['tries']
        : this['tries'];

    const jobOptions = {};
    if (connection) jobOptions['connection'] = connection;
    if (queue) jobOptions['queue'] = queue;
    if (delay) jobOptions['delay'] = delay;
    if (tries) jobOptions['tries'] = tries;

    const eventData = this.fetchPayload();
    await Dispatch({
      job: IntentEventConstants.eventJobName,
      data: {
        eventName,
        eventData,
        discriminator: 'intentjs/events/queueable_event',
      },
      ...jobOptions,
    });
  }
}
