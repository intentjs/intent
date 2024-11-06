export interface MailMessageMetaPayload {
  title?: string;
  preview?: string;
  isDarkThemed?: boolean;
}

export interface MailMessagePayload {
  meta?: MailMessageMetaPayload;
  genericFields?: GenericTemplateField[];
}

export interface MailData {
  subject?: string;
  html: string;
  attachments: Record<string, any>[];
}

export interface BaseProviderConfigOptions {
  from: string | { name?: string; email: string };
  replyTo?: string | string[];
  preview?: string;
}

export interface SendgridApiOptions extends BaseProviderConfigOptions {
  provider: 'sendgrid';
  apiKey: string;
  from: string;
}

export interface MailgunOptions extends BaseProviderConfigOptions {
  provider: 'mailgun';
  username: string;
  key: string;
  domain: string;
  from: string;
}

export interface NodemailerOptions extends BaseProviderConfigOptions {
  provider: 'smtp';
  host: string;
  port: string;
  username: string;
  password: string;
  ignoreTLS?: boolean;
  requireTLS?: boolean;
}

export interface MailLoggerProviderOptions {
  provider: 'logger';
}

export interface ResendOptions extends BaseProviderConfigOptions {
  provider: 'resend';
  apiKey: string;
  from: string;
}

export type ChannelProviderOptions =
  | NodemailerOptions
  | MailgunOptions
  | ResendOptions
  | MailLoggerProviderOptions;

export interface MailerOptions {
  default: string;
  template: { appName?: string; footer?: { title?: string } };
  channels: { [key: string]: ChannelProviderOptions };
}

export interface GenericTemplateField {
  type: string;
  value: Record<string, any>;
  className?: string;
}

export type MailType = 'RAW' | 'VIEW_BASED' | 'GENERIC';
