import { Package } from '../../utils';
import { ErrorSendingMail } from '../exceptions/error-sending-mail';
import { ResendOptions } from '../interfaces';
import { BaseProvider, BaseProviderSendOptions } from '../interfaces/provider';

export class ResendMailProvider implements BaseProvider {
  private client: any;

  constructor(private options: ResendOptions) {
    const { Resend } = Package.load('resend');
    this.client = new Resend(this.options.apiKey);
  }

  async send(payload: BaseProviderSendOptions): Promise<void> {
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
}
