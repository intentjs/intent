import { ms } from 'humanize-ms';
import { ulid } from 'ulid';
import { QueueMetadata } from '../metadata.js';
import { Message, JobOptions, InternalMessage } from '../strategy/index.js';

type Complete<T> = {
  [P in keyof Required<T>]: Pick<T, P> extends Required<Pick<T, P>>
    ? T[P]
    : T[P] | undefined;
};

const calculateDelay = (delay: number | string | Date): number => {
  const now = Date.now();
  if (delay instanceof Date) {
    const time = delay.getTime();
    return now > time ? now : time;
  }

  const delayInMs = typeof delay === 'string' ? ms(delay) : delay * 1000;
  const calculatedDelay = now + delayInMs;
  if (calculatedDelay < now) return now;
  return calculatedDelay;
};

export class PayloadBuilder {
  static build(
    message: Message,
    jobOptions: JobOptions,
  ): Complete<InternalMessage> {
    const defaultOptions = QueueMetadata.getDefaultOptions();
    const payload = {
      id: ulid(),
      attemptCount: 0,
      ...defaultOptions,
      queue: undefined,
      ...jobOptions,
      ...message,
    } as Complete<InternalMessage>;

    payload.delay = calculateDelay(payload.delay || 0);
    payload.connection = payload.connection || defaultOptions.connection;

    if (!payload.queue) {
      const config = QueueMetadata.getData();
      payload.queue =
        payload.connection != undefined
          ? (config.connections[payload.connection].queue as string)
          : undefined;
    }

    return payload;
  }
}
