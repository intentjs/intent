import { MailMessage } from './message.js';
import { MailerService } from './service.js';

export class Mail {
  private receipents: string | string[];
  private ccReceipents: string | string[];
  private bccReceipents: string | string[];
  private fromAddress: string;
  private _replyTo: string | string[];
  private _inReplyTo: string;
  private provider: string;

  private constructor(provider?: string) {
    this.fromAddress = '';
    this._replyTo = '';
    this._inReplyTo = '';
    this.receipents = '';
    this.ccReceipents = '';
    this.bccReceipents = '';
    this.provider = provider;
  }

  /**
   * Returns new instance
   */
  static init(provider?: string) {
    return new Mail(provider);
  }

  /**
   * `FROM` in email address.
   * Use this method to override the `from` address provided in configuration.
   * @param sender
   */
  from(fromAddress: string): this {
    this.fromAddress = fromAddress;
    return this;
  }

  /**
   * `REPLY_TO` in email address.
   * Use this method to override the `reply_to` address provided in configuration or to add one.
   * @param replyToEmail
   */
  replyTo(replyTo: string | string[]): this {
    this._replyTo = replyTo;
    return this;
  }

  /**
   * `IN_REPLY_TO` in email address.
   * Use this method to provide the `in_reply_to` header.
   * @param replyToEmail
   */
  inReplyTo(messageId: string): this {
    this._inReplyTo = messageId;
    return this;
  }

  /**
   * `TO` in email address
   * @param receipents
   */
  to(receipents: string | string[]): this {
    this.receipents = receipents;
    return this;
  }

  /**
   * `CC` in email addres
   * @param ccreceipents
   */
  cc(ccReceipents: string | string[]): this {
    this.ccReceipents = ccReceipents;
    return this;
  }

  /**
   * `BCC` in email address
   * @param bccReceipents
   */
  bcc(bccReceipents: string | string[]): this {
    this.bccReceipents = bccReceipents;
    return this;
  }

  /**
   * Send mail
   * @param mail
   */
  send(mail: MailMessage) {
    return MailerService.send(
      {
        mail,
        cc: this.ccReceipents,
        bcc: this.bccReceipents,
        sender: this.fromAddress,
        replyTo: this._replyTo,
        inReplyTo: this._inReplyTo,
        to: this.receipents,
      },
      this.provider,
    );
  }
}
