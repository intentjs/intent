import { Storage } from '../../storage';
import { Package } from '../../utils';
import { isEmpty } from '../../utils/helpers';
import { Str } from '../../utils/string';
import { MailgunOptions } from '../interfaces';
import { BaseProvider, BaseProviderSendOptions } from '../interfaces/provider';

export class MailgunProvider implements BaseProvider {
  protected client: any;

  constructor(private options: MailgunOptions) {
    const formData = Package.load('form-data');
    const Mailgun = Package.load('mailgun.js');
    const mailgun = new Mailgun(formData);
    this.client = mailgun.client({
      username: this.options.username,
      key: this.options.key,
    });
  }

  async send(payload: BaseProviderSendOptions): Promise<void> {
    const { attachments } = payload;
    if (!isEmpty(attachments)) {
      for (const attachment of attachments) {
        if (Str.isUrl(attachment.url)) {
          attachment['content'] = await Storage.download(attachment.url);
          delete attachment.url;
        }
      }
    }

    const report = await this.client.messages.create(this.options.domain, {
      from: payload.from,
      to: payload.to,
      cc: payload.cc,
      bcc: payload.bcc,
      subject: payload.subject,
      html: payload.html,
      attachment: attachments.map(a => ({
        filename: a.filename,
        data: a.content,
      })),
    });

    return;
  }

  getClient<T>(): T {
    return this.client as unknown as T;
  }
}
