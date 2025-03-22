// eslint-disable-next-line import/no-named-as-default
import { ConfigService } from '../config/service.js';
import { GENERIC_MAIL, RAW_MAIL, VIEW_BASED_MAIL } from './constants.js';
import {
  MailData,
  MailMessageMetaPayload,
  MailType,
  MailMessagePayload,
} from './interfaces/index.js';
import { AttachmentOptions } from './interfaces/provider.js';
import { Package } from '../utils/index.js';
import IntentMailComponent from '../../resources/mail/emails/index.js';

export class MailMessage {
  private mailSubject?: string;
  private viewFile?: (payload: Record<string, any>) => Element;
  private templateString?: string;
  private payload: MailMessagePayload = {};
  private mailType: MailType;
  private compiledHtml: string;
  private attachments: Record<string, any>[];

  constructor() {
    this.attachments = [];
    this.compiledHtml = '';
    this.mailType = GENERIC_MAIL;
    this.payload = {
      genericFields: [],
      meta: { isDarkThemed: false, preview: undefined },
    };
  }

  /**
   * static method to create new instance of the MailMessage class
   */
  static init(): MailMessage {
    return new MailMessage();
  }

  /**
   * Define preview text of the mail
   * @param preview
   */
  preview(text: string): this {
    this.payload.meta = { ...this.payload.meta, preview: text };
    return this;
  }

  /**
   * Define subject of the mail
   * @param subject
   */
  subject(subject: string): this {
    this.mailSubject = subject;
    return this;
  }

  /**
   * Define the view to be used for the mail
   * @param viewFile
   * @param payload
   */
  view(
    component: (payload: Record<string, any>) => Element,
    payload?: Record<string, any>,
  ): this {
    this.mailType = VIEW_BASED_MAIL;
    this.viewFile = component;
    this.payload = payload || {};
    return this;
  }

  /**
   * Add attachment to the mail
   * @param greeting
   */
  attach(filename: string, content: Omit<AttachmentOptions, 'filename'>): this {
    this.attachments.push({ filename, ...content });
    return this;
  }

  image(url: string, options?: Record<string, any>): this {
    this.payload.genericFields.push({ type: 'image', value: { url, options } });
    return this;
  }

  markdown(content: string, options?: Record<string, any>): this {
    this.payload.genericFields.push({
      type: 'markdown',
      value: { content, options },
    });
    return this;
  }

  code(content: string, options?: Record<string, any>): this {
    this.payload.genericFields.push({
      type: 'code',
      value: { content, options },
    });
    return this;
  }

  link(title: string, href: string): this {
    this.payload.genericFields.push({
      type: 'link',
      value: { href, title },
    });
    return this;
  }

  inlineCode(code: string): this {
    this.payload.genericFields.push({
      type: 'code-inline',
      value: { content: code },
    });
    return this;
  }

  /**
   * ==> Generic Template Method <==
   * Use this method for adding the greeting to the generic mail
   * @param greeting
   */

  greeting(greeting: string): this {
    this.payload?.genericFields.push({
      type: 'greeting',
      value: { text: greeting },
    });
    return this;
  }

  /**
   * ==> Generic Template Method <==
   * Use this method for adding a text line to the generic mail
   * @param line
   */
  line(text: string, options?: Record<string, any>): this {
    this.payload?.genericFields.push({
      type: 'text',
      value: { text, options },
    });
    return this;
  }

  html(html: string): this {
    if (this.payload.genericFields) {
      this.payload?.genericFields.push({ type: 'html', value: { text: html } });
    }
    return this;
  }

  /**
   * ==> Generic Template Method <==
   * Use this method for adding a url action to the generic mail
   * @param text
   * @param link
   */
  button(text: string, link: string): this {
    this.payload.genericFields.push({
      type: 'button',
      value: { text, link },
    });
    return this;
  }

  /**
   * ==> Generic Template Method <==
   * Use this method for adding a table to the generic mail
   * @param data
   */
  table(data: string[][], header = true): this {
    if (this.payload.genericFields) {
      this.payload.genericFields.push({
        type: 'table',
        value: { rows: data, header },
      });
    }

    return this;
  }

  raw(html: string): this {
    this.mailType = RAW_MAIL;
    this.templateString = html;
    return this;
  }

  dark(dark = true): this {
    this.payload.meta = { ...this.payload.meta, isDarkThemed: dark };
    return this;
  }

  meta(payload: MailMessageMetaPayload): this {
    this.payload.meta = payload;
    return this;
  }

  /**
   * Method to compile templates
   */
  private async _compileTemplate(): Promise<string> {
    if (this.compiledHtml) return this.compiledHtml;

    if (this.mailType === GENERIC_MAIL) {
      const templateConfig = ConfigService.get('mailers.template');
      const { render } = await Package.load('@react-email/render');
      const html = await render(
        IntentMailComponent({
          header: { value: { title: templateConfig.appName } },
          footer: {
            value: {
              appName: templateConfig.appName,
              title: templateConfig?.footer?.title,
            },
          },
          preview: this.payload.meta.preview,
          components: this.payload.genericFields,
          theme: { isDarkThemed: this.payload.meta.isDarkThemed },
        }),
      );
      this.compiledHtml = html;
      return this.compiledHtml;
    }

    if (this.mailType === VIEW_BASED_MAIL && this.viewFile) {
      const component = this.viewFile;
      const { render } = await Package.load('@react-email/render');
      const html = await render(component(this.payload));

      this.compiledHtml = html;
      return this.compiledHtml;
    }

    if (this.mailType === RAW_MAIL && this.templateString) {
      return this.templateString;
    }

    return this.compiledHtml;
  }

  /**
   * Returns the maildata payload
   */
  async getMailData(): Promise<MailData> {
    if (typeof (this as any).handle === 'function') {
      (this as any)['handle']();
    }

    return {
      subject: this.mailSubject,
      html: await this._compileTemplate(),
      attachments: this.attachments,
    };
  }

  /**
   * Render the email template.
   * Returns the complete html of the mail.
   */
  async render(): Promise<string> {
    return await this._compileTemplate();
  }
}
