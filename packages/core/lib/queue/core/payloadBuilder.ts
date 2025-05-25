import { ms } from 'humanize-ms';
import { ulid } from 'ulid';
import { QueueMetadata } from '../metadata.js';
import { Message, JobOptions, InternalMessage } from '../strategy/index.js';

type Complete<T> = {
  [P in keyof Required<T>]: Pick<T, P> extends Required<Pick<T, P>>
    ? T[P]
    : T[P] | undefined;
};

const calculateDelay = (delay: number | string | Date): [number, number] => {
  const now = Date.now();
  if (delay instanceof Date) {
    const time = delay.getTime();
    const netDelayInSeconds = (time - now) / 1000;
    return now > time ? [now, 0] : [time, netDelayInSeconds];
  }

  const delayInMs = typeof delay === 'string' ? ms(delay) : delay * 1000;
  const calculatedDelay = now + delayInMs;
  if (calculatedDelay < now) return [now, 0];
  return [calculatedDelay, (calculatedDelay - now) / 1000];
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

    const [delay, netDelayInSeconds] = calculateDelay(payload.delay || 0);
    payload.delay = delay;
    payload.netDelayInSeconds = netDelayInSeconds;
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
