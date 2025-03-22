import { Storage } from '../../storage/index.js';
import { Package } from '../../utils/index.js';
import { isEmpty } from '../../utils/helpers.js';
import { Str } from '../../utils/string.js';
import { MailgunOptions } from '../interfaces/options.js';
import {
  BaseProvider,
  BaseProviderSendOptions,
} from '../interfaces/provider.js';

export class MailgunProvider implements BaseProvider {
  protected client: any;

  constructor(private options: MailgunOptions) {
    this.initialiseModules();
  }

  async send(payload: BaseProviderSendOptions): Promise<void> {
    await this.initialiseModules();

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

    console.log(report);

    return;
  }

  getClient<T>(): T {
    return this.client as unknown as T;
  }

  async initialiseModules(): Promise<void> {
    if (this.client) return;
    const formData = await Package.load('form-data');
    const Mailgun = await Package.load('mailgun.js');
    this.client = new Mailgun(formData).client({
      username: this.options.username,
      key: this.options.key,
    });
  }
}
