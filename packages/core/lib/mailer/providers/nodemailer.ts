import { Package } from '../../utils/index.js';
import { NodemailerOptions } from '../interfaces/options.js';
import {
  BaseProvider,
  BaseProviderSendOptions,
} from '../interfaces/provider.js';

export class NodemailerProvider implements BaseProvider {
  private client: any;

  constructor(private options: NodemailerOptions) {
    this.initialiseModules();
  }

  async send(payload: BaseProviderSendOptions): Promise<void> {
    await this.initialiseModules();
    return this.client.sendMail({
      from: payload.from,
      to: payload.to,
      attachments: payload.attachments?.map(a => ({
        filename: a.filename,
        content: a.content,
        path: a.url,
      })),
      subject: payload.subject,
      html: payload.html,
      replyTo: payload.replyTo,
      inReplyTo: payload.inReplyTo,
      bcc: payload.bcc,
      cc: payload.bcc,
    });
  }

  getClient<T>(): T {
    return this.client as unknown as T;
  }

  async initialiseModules(): Promise<void> {
    if (this.client) return;
    const nodemailer = await Package.load('nodemailer');
    this.client = nodemailer.createTransport({
      host: this.options.host,
      port: this.options.port,
      secure: this.options.port === '465',
      ignoreTLS: this.options.ignoreTLS,
      requireTLS: this.options.requireTLS,
      auth: {
        user: this.options.username,
        pass: this.options.password,
      },
    });
  }
}
