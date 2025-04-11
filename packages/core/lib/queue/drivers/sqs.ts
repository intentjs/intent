import { Package } from '../../utils/index.js';
import { joinUrl, validateOptions } from '../../utils/helpers.js';
import { SqsJob } from '../interfaces/job.js';
import { SqsQueueOptionsDto } from '../schema/index.js';
import { InternalMessage } from '../strategy/index.js';
import { PollQueueDriver } from '../strategy/pollQueueDriver.js';

export class SqsQueueDriver implements PollQueueDriver {
  private client: any;
  private AWS: any;

  constructor(private options: Record<string, any>) {
    validateOptions(options, SqsQueueOptionsDto, { cls: SqsQueueDriver.name });
    this.initializeModules();
  }

  async init(): Promise<void> {}

  async push(message: string, rawPayload: InternalMessage): Promise<void> {
    await this.initializeModules();
    const params = {
      DelaySeconds: rawPayload.netDelayInSeconds,
      MessageBody: message,
      QueueUrl: joinUrl(this.options.prefix, rawPayload.queue),
    };

    await this.client.sendMessage(params);
    return;
  }

  async pull(options: Record<string, any>): Promise<SqsJob[] | null> {
    await this.initializeModules();
    const params = {
      MaxNumberOfMessages: 10,
      MessageAttributeNames: ['All'],
      QueueUrl: joinUrl(this.options.prefix, options.queue),
      VisibilityTimeout: 30,
      WaitTimeSeconds: 20,
    };

    const response = await this.client.receiveMessage(params);
    const messages = response.Messages ?? [];
    return messages.map(m => new SqsJob(m));
  }

  async remove(job: SqsJob, options: Record<string, any>): Promise<void> {
    await this.initializeModules();
    const params = {
      QueueUrl: joinUrl(this.options.prefix, options.queue),
      ReceiptHandle: job.data.ReceiptHandle,
    };

    await this.client.deleteMessage(params);

    return;
  }

  async purge(options: Record<string, any>): Promise<void> {
    await this.initializeModules();
    const params = {
      QueueUrl: joinUrl(this.options.prefix, options.queue),
    };

    await this.client.purgeQueue(params).promise();

    return;
  }

  async count(options: Record<string, any>): Promise<number> {
    await this.initializeModules();
    const params = {
      QueueUrl: joinUrl(this.options.prefix, options.queue),
      AttributeNames: ['ApproximateNumberOfMessages'],
    };
    const response: Record<string, any> =
      await this.client.getQueueAttributes(params);
    return +response.Attributes.ApproximateNumberOfMessages;
  }

  async initializeModules(): Promise<void> {
    if (this.AWS && this.client) return Promise.resolve();
    this.AWS = await Package.load('@aws-sdk/client-sqs');
    this.client = new this.AWS.SQS({
      region: this.options.region,
      apiVersion: this.options.apiVersion,
      credentials: this.options.credentials || {
        accessKeyId: this.options.accessKey,
        secretAccessKey: this.options.secretKey,
      },
    });
  }
}
