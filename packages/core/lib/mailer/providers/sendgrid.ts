import { Package } from '../../utils/index.js';
import { SendgridApiOptions } from '../interfaces/options.js';
import {
  BaseProvider,
  BaseProviderSendOptions,
} from '../interfaces/provider.js';

export class SendgridProvider implements BaseProvider {
  protected client: any;
  constructor(private options: SendgridApiOptions) {
    this.initialiseModules();
  }

  async send(payload: BaseProviderSendOptions): Promise<void> {
    await this.initialiseModules();
    console.log(payload);
    throw new Error('Method not implemented.');
  }

  getClient<T>(): T {
    throw new Error('Method not implemented.');
  }

  async initialiseModules(): Promise<void> {
    if (this.client) return;
    const sendgrid = await Package.load('@sendgrid/mail');
    this.client = sendgrid.setApiKey(this.options.apiKey);
  }
}
