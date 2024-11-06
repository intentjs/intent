import { PayloadBuilder } from './core';
import { QueueMetadata } from './metadata';
import { QueueService } from './service';
import { Message } from './strategy';
import { PollQueueDriver } from './strategy/pollQueueDriver';
import { SubscribeQueueDriver } from './strategy/subscribeQueueDriver';

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
