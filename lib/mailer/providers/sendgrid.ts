import { Package } from '../../utils';
import { SendgridApiOptions } from '../interfaces';
import { BaseProvider, BaseProviderSendOptions } from '../interfaces/provider';

export class SendgridProvider implements BaseProvider {
  protected client: any;
  constructor(private options: SendgridApiOptions) {
    const sendgrid = Package.load('@sendgrid/mail');
    this.client = sendgrid.setApiKey(options.apiKey);
  }

  send(payload: BaseProviderSendOptions): Promise<void> {
    throw new Error('Method not implemented.');
  }

  getClient<T>(): T {
    throw new Error('Method not implemented.');
  }
}
