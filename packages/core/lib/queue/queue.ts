import { PayloadBuilder } from './core/index.js';
import { QueueMetadata } from './metadata.js';
import { QueueService } from './service.js';
import { Message } from './strategy/index.js';
import { PollQueueDriver } from './strategy/pollQueueDriver.js';
import { SubscribeQueueDriver } from './strategy/subscribeQueueDriver.js';

export class Queue {
  static async dispatch(message: Message): Promise<void> {
    const job = QueueMetadata.getJob(message.job);
    const payload = PayloadBuilder.build(message, job?.options ?? {});
    const { config, client } = QueueService.makeDriver(payload['connection']);

    if (config.listenerType === 'subscribe') {
      return (client as SubscribeQueueDriver).publish(
        message.job,
        message.data,
      );
    }

    return (client as PollQueueDriver).push(JSON.stringify(payload), payload);
  }
}

export async function Dispatch(message: Message): Promise<void> {
  const job = QueueMetadata.getJob(message.job);
  const payload = PayloadBuilder.build(message, job?.options || {});
  const { config, client } = QueueService.makeDriver(payload['connection']);

  if (config.listenerType === 'subscribe') {
    return await (client as SubscribeQueueDriver).publish(
      message.job,
      message.data,
    );
  }

  return await (client as PollQueueDriver).push(
    JSON.stringify(payload),
    payload,
  );
}
