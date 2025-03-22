import { EmitsEvent } from '../../events/index.js';
import { Obj } from '../../utils/index.js';
import { logTime } from '../../utils/helpers.js';
import { JobStatusEnum } from '../constants.js';
import { JobFailed, JobProcessed, JobProcessing } from '../events/index.js';
import { JobMaxRetriesExceeed } from '../events/jobMaxRetries.js';
import { ListenerOptions } from '../interfaces/index.js';
import { JobRunner } from '../jobRunners/base.js';
import { QueueMetadata } from '../metadata.js';
import { Dispatch } from '../queue.js';
import { QueueService } from '../service.js';
import { DriverJob, InternalMessage } from '../strategy/index.js';
import { PollQueueDriver } from '../strategy/pollQueueDriver.js';
import { BaseQueueWorker } from './baseWorker.js';

export class PollQueueWorker extends BaseQueueWorker {
  declare protected options: ListenerOptions;
  protected jobInProgress: boolean;
  protected killSigReceived: boolean;

  constructor(options?: ListenerOptions) {
    super();
    const defaultOptions = QueueMetadata.getDefaultOptions();
    this.options = options || {};
    this.options = {
      ...defaultOptions,
      schedulerInterval: 10000,
      queue: undefined,
      logger: true,
      ...this.options,
    };
    this.jobInProgress = false;
    this.killSigReceived = false;
    if (!this.options.queue) {
      const data = QueueMetadata.getData();
      this.options['queue'] = data.connections[
        this.options.connection || defaultOptions.connection
      ].queue as string;
    }

    this.attachDeamonListeners();
  }

  static init(options?: ListenerOptions): PollQueueWorker {
    return new PollQueueWorker(options);
  }

  private async poll(connection: PollQueueDriver): Promise<DriverJob[] | null> {
    return await connection.pull({ queue: this.options.queue });
  }

  /**
   * Listen to the queue
   */
  async listen() {
    this.logInfo('Poll Queue Worker Initialised');
    this.logInfo('Listening for messages...');

    const { client } = QueueService.makeDriver<PollQueueDriver>(
      this.options.connection,
    );

    // perform scheduled task of the driver
    if (client.scheduledTask) this.performScheduledTask(client);

    const runner = new JobRunner(this.options, client);
    // eslint-disable-next-line no-constant-condition
    while (1 && !this.killSigReceived) {
      const jobs = await this.poll(client);
      if (!jobs.length) {
        await new Promise(resolve => setTimeout(resolve, this.options.sleep));
        continue;
      }

      this.jobInProgress = true;
      for (const job of jobs) {
        await this.handleJob(runner, job);
      }
      this.jobInProgress = false;
    }
  }

  async handleJob(runner: JobRunner, job: DriverJob): Promise<void> {
    const now = Date.now();
    const message = this.fetchMessage(job);
    this.logInfo(`[${message.job}] Job Processing...`);
    this.emitEvent(new JobProcessing(message, job));
    const { status, error } = await runner.run(message);
    await this.handleStatus(status, message, job, error, now);
  }

  emitEvent(event: EmitsEvent) {
    event.emit();
  }

  async handleStatus(
    status: JobStatusEnum,
    message: InternalMessage,
    job: DriverJob,
    error: Error,
    startTime: number,
  ): Promise<void> {
    if (status === JobStatusEnum.jobNotFound) {
      this.logWarn(
        `Job [${message.job}] not found. Please ensure that you have a job running for this connection`,
        true,
      );
      return;
    }

    if (status === JobStatusEnum.success) {
      await this.success(message, job);
      this.logSuccess(
        `[${message.job}] Job Processed ... ${logTime(Date.now() - startTime)}`,
        true,
      );
      return;
    }

    if (status === JobStatusEnum.retry) {
      await this.retry(message, job);
      this.logError(
        `[${message.job}] Job Failed... | ${error['message']}`,
        true,
      );
    }
  }

  private async performScheduledTask(connection: PollQueueDriver) {
    if (!connection || !connection.scheduledTask) return;
    setInterval(
      async () =>
        connection.scheduledTask
          ? await connection.scheduledTask(this.options)
          : null,
      this.options.schedulerInterval || 30000,
    );
  }

  async purge(): Promise<void> {
    const { client } = QueueService.makeDriver<PollQueueDriver>(
      this.options.connection,
    );
    await client.purge({ queue: this.options.queue });
  }

  async count(): Promise<number> {
    const { client } = QueueService.makeDriver<PollQueueDriver>(
      this.options.connection,
    );
    return await client.count({ queue: this.options.queue });
  }

  /**
   * Job processed succesfully method
   * @param message
   * @param job
   */
  async success(message: InternalMessage, job: DriverJob): Promise<void> {
    await this.removeJobFromQueue(job);
    this.emitEvent(new JobProcessed(message, job));
  }

  /**
   * Retry job after it has failed
   * @param message
   * @param job
   */
  async retry(message: InternalMessage, job: DriverJob): Promise<void> {
    await this.removeJobFromQueue(job);
    message.attemptCount += 1;
    if (+message.attemptCount === message.tries) {
      this.logError(`[${message.job}] exceeded retries...`);
      this.emitEvent(new JobMaxRetriesExceeed(message, job));
      return;
    }
    await Dispatch(message);
    this.emitEvent(new JobFailed(message, job));
  }

  /**
   * Remove job from the queue method
   * @param job
   */
  async removeJobFromQueue(job: DriverJob): Promise<void> {
    const { client } = QueueService.makeDriver<PollQueueDriver>(
      this.options.connection,
    );
    await client.remove(job, this.options);
  }

  /**
   * Fetch message out of the driver message
   * @param job
   */
  fetchMessage(job: DriverJob): InternalMessage {
    const message = job.getMessage();
    return Obj.isObj(message)
      ? (message as unknown as InternalMessage)
      : JSON.parse(job.getMessage());
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

  async closeConnections() {
    this.killSigReceived = true;
    // Wait for job completion with timeout
    const maxWaitTime = 30000; // 30 seconds timeout
    const startTime = Date.now();

    while (this.jobInProgress) {
      this.logInfo('Waiting for current batch to be completed first...');
      if (Date.now() - startTime > maxWaitTime) {
        break;
      }

      await new Promise(resolve => setImmediate(resolve)); // Check every second
    }

    try {
      console.log(
        `Successfully disconnected broker: ${this.options.connection}`,
      );
    } catch (error) {
      console.error(
        `Error disconnecting broker ${this.options.connection}:`,
        error,
      );
    }

    process.exit(this.jobInProgress ? 1 : 0);
  }
}
