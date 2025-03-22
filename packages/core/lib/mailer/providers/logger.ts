import { Log } from '../../logger/index.js';
import { NodemailerOptions } from '../interfaces/options.js';
import {
  BaseProvider,
  BaseProviderSendOptions,
} from '../interfaces/provider.js';

export class LoggerProvider implements BaseProvider {
  private client: any;

  constructor(private options: NodemailerOptions) {}

  async send(payload: BaseProviderSendOptions): Promise<void> {
    Log().debug(payload);
  }

  getClient<T>(): T {
    return this.client as unknown as T;
  }
}
