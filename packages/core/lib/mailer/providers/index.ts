import { LoggerProvider } from './logger.js';
import { MailgunProvider } from './mailgun.js';
import { NodemailerProvider } from './nodemailer.js';
import { ResendMailProvider } from './resend.js';
// import { SendgridProvider } from '#mailer/providers/sendgrid';

export const MAIL_PROVIDER_MAP = {
  smtp: NodemailerProvider,
  mailgun: MailgunProvider,
  resend: ResendMailProvider,
  logger: LoggerProvider,
  // sendgrid: SendgridProvider,
};
