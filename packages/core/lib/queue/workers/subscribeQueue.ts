import { Obj } from '../../utils/index.js';
import { ListenerOptions } from '../interfaces/index.js';
import { QueueMetadata } from '../metadata.js';
import { QueueService } from '../service.js';
import { SubscribeQueueDriver } from '../strategy/subscribeQueueDriver.js';

export interface PubSubWorkerOptions extends ListenerOptions {
  listenerId?: string;
  meta?: Record<string, any>;
}

export class SubscribeQueueWorker {
  private options: PubSubWorkerOptions;

  constructor(options?: PubSubWorkerOptions) {
    const defaultOptions = QueueMetadata.getDefaultOptions();
    this.options = options || {};
    this.options = {
      ...defaultOptions,
      schedulerInterval: 10000,
      queue: undefined,
      logger: true,
      ...this.options,
    };

    if (!this.options.queue) {
      const data = QueueMetadata.getData();
      this.options['queue'] = data.connections[
        this.options.connection || defaultOptions.connection
      ].queue as string;
    }
  }

  static async init(options: PubSubWorkerOptions): Promise<void> {
    const worker = new SubscribeQueueWorker(options);
    await worker.initListeners();
  }

  async initListeners(): Promise<void> {
    const jobs = QueueMetadata.getAllJobs();
    await this.initBroker(this.options.connection, jobs);
    const { client } = QueueService.makeDriver<SubscribeQueueDriver>(
      this.options.connection,
    );

    await client.startListening(this.processIncomingMessage());

    this.attachDeamonListeners();

    await new Promise(() =>
      setInterval(async () => {}, 20 * 24 * 60 * 60 * 1000),
    );
  }

  attachDeamonListeners() {
    process.on('SIGINT', async () => {
      await this.closeConnections();
    });

    process.on('SIGQUIT', async () => {
      await this.closeConnections();
    });

    process.on('SIGTERM', async () => {
      await this.closeConnections();
    });

    process.on('message', async (msg: any) => {
      if (msg === 'shutdown' || msg.type === 'shutdown') {
        await this.closeConnections();
      }
    });
  }

  processIncomingMessage(): (options: Record<string, any>) => void {
    return async ({ topic, value }: Record<string, any>) => {
      const topicListeners = QueueMetadata.getJob(topic);
      await topicListeners.target(value, { ...(this.options.meta || {}) });
    };
  }

  async initBroker(
    broker: string,
    listeners: Record<string, any>,
  ): Promise<void> {
    const topicNames = Object.keys(listeners);

    const { client } = QueueService.makeDriver<SubscribeQueueDriver>(broker);

    const workerOptions = Obj.pick(this.options, ['listenerId']);
    await client.initListeners({
      topics: topicNames,
      workerOptions: workerOptions,
    });
  }

  async closeConnections() {
    const listeners = QueueMetadata.getAllJobs();
    const brokers = Object.keys(listeners);
    for (const broker of brokers) {
      const { client } = QueueService.makeDriver<SubscribeQueueDriver>(broker);
      await client.disconnect();
    }

    process.exit(0);
  }
}
