import { JobOptions } from '../queue/strategy/index.js';

export interface QueueableEvent {
  /**
   * The name of the connection on which the event should be sent to.
   * Leave it blank to use the configured queue for the connection.
   */
  connection?: string;

  /**
   * The name of the queue on which the event should be sent to.
   * Leave it blank to use the configured queue for the connection.
   */
  queue?: string;

  /**
   * The delay(in seconds) before the job should be processed.
   */
  delay?: number;

  /**
   *
   */
  shouldBeQueued(): boolean | JobOptions;
}
