import { MailMessage } from '../message.js';

export interface AttachmentOptions {
  filename: string;
  url?: string;
  content?: Buffer;
}
export interface BaseProviderSendOptions {
  sender: string;
  to: string | string[];
  cc: string | string[];
  bcc: string | string[];
  from?: string;
  html?: string;
  subject?: string;
  attachments?: AttachmentOptions[];
  inReplyTo?: string;
  replyTo?: string | string[];
  mail: MailMessage;
}

export interface BaseProvider {
  send(payload: BaseProviderSendOptions): Promise<void>;
  getClient<T>(): T;
}
