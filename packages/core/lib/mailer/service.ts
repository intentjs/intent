import { Injectable } from '@nestjs/common';
import { ConfigService } from '../config/service.js';
import { ChannelProviderOptions, MailData } from './interfaces/index.js';
import {
  BaseProvider,
  BaseProviderSendOptions,
} from './interfaces/provider.js';
import { MAIL_PROVIDER_MAP } from './providers/index.js';
import { InvalidMailProviderException } from './exceptions/invalid-mail-provider.js';
import { isEmpty } from '../utils/helpers.js';

@Injectable()
export class MailerService {
  private static channels = new Map<string, BaseProvider>();

  static createDriver(
    channel: string,
    options: ChannelProviderOptions,
  ): BaseProvider {
    if (MailerService.channels.has(channel)) {
      return MailerService.channels.get(channel);
    }

    const driver = MAIL_PROVIDER_MAP[options.provider];
    if (isEmpty(driver)) {
      throw new InvalidMailProviderException(
        `Channel ${channel} does not have a valid provider ${options.provider}.`,
      );
    }

    MailerService.channels.set(channel, new driver(options as any));
    return MailerService.channels.get(channel);
  }

  static async send(options: BaseProviderSendOptions, providerName?: string) {
    const config = ConfigService.get('mailers');

    providerName = providerName ?? config.default;
    const providerConfig = config.channels[providerName];
    const mailData = (await options.mail.getMailData()) as MailData;
    const mail = {
      to: options.to,
      cc: options.cc,
      bcc: options.bcc,
      from: options.sender || providerConfig['from'],
      html: mailData.html,
      subject: mailData.subject,
      attachments: mailData.attachments,
    } as BaseProviderSendOptions;

    if (options.replyTo || providerConfig['replyTo']) {
      mail.replyTo = options.replyTo || providerConfig['replyTo'];
    }

    if (options.inReplyTo) mail.inReplyTo = options.inReplyTo;

    const provider = this.createDriver(providerName, providerConfig);
    await provider.send(mail);
  }
}
