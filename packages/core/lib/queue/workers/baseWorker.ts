import pc from 'picocolors';
import { getTimestampForLog } from '../../utils/helpers.js';
import { ListenerOptions } from '../interfaces/index.js';
import { QueueDrivers } from '../strategy/index.js';

export class BaseQueueWorker {
  protected silent: boolean;
  protected options: ListenerOptions;
  protected connection: QueueDrivers;

  logInfo(msg: string, silentLabel = false): void {
    if (!silentLabel) {
      const level = pc.bgCyan(pc.black('[INFO]'));
      console.log(`${level} ${getTimestampForLog()} ${this.shallowLog()}`);
    }

    console.log(pc.cyan(msg));
  }

  logSuccess(msg: string, silentLabel = false): void {
    if (!silentLabel) {
      const level = pc.bgCyan(pc.black('[INFO]'));
      console.log(`${level} ${getTimestampForLog()} ${this.shallowLog()}`);
    }

    console.log(pc.green(msg));
  }

  logError(msg: string, silentLabel = false): void {
    if (!silentLabel) {
      const level = pc.bgCyan(pc.black('[INFO]'));
      console.log(`${level} ${getTimestampForLog()} ${this.shallowLog()}`);
    }
    console.log(pc.red(msg));
  }

  logWarn(msg: string, silentLabel = false): void {
    if (!silentLabel) {
      const level = pc.bgYellow(pc.black('[WARN]'));
      console.log(`${level} ${getTimestampForLog()} ${this.shallowLog()}`);
    }
    console.log(pc.yellow(msg));
  }

  private shallowLog(): string {
    return `${pc.dim('Connection: ' + this.options.connection)} ${pc.dim(
      'Queue: ' + this.options.queue,
    )}`;
  }
}
