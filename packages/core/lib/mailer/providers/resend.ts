import { Package } from '../../utils/index.js';
import { ErrorSendingMail } from '../exceptions/errorSendingMail.js';
import { ResendOptions } from '../interfaces/options.js';
import {
  BaseProvider,
  BaseProviderSendOptions,
} from '../interfaces/provider.js';

export class ResendMailProvider implements BaseProvider {
  private client: any;

  constructor(private options: ResendOptions) {
    this.initialiseModules();
  }

  async send(payload: BaseProviderSendOptions): Promise<void> {
    await this.initialiseModules();
    const report = await this.client.emails.send({
      from: payload.from,
      to: payload.to,
      bcc: payload.bcc,
      cc: payload.cc,
      attachments: payload.attachments?.map(a => ({
        filename: a.filename,
        content: a.content,
        path: a.url,
      })),
      subject: payload.subject ?? '',
      html: payload.html,
      reply_to: payload.replyTo,
    });

    if (report.error) {
      throw new ErrorSendingMail(report.error.message);
    }
  }

  getClient<T>(): T {
    return this.client as unknown as T;
  }

  async initialiseModules(): Promise<void> {
    if (this.client) return;
    const { Resend } = await Package.load('resend');
    this.client = new Resend(this.options.apiKey);
  }
}
