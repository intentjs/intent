import { configNamespace } from '@intentjs/core/config';
import { MailerOptions } from '@intentjs/core/mail';

export default configNamespace(
  'mailers',
  (): MailerOptions => ({
    /**
     * The default channel for your mailer.
     */
    default: process.env.DEFAULT_MAILER || 'logger',

    /**
     * -----------------------------------------------------
     * Mailer Channels
     * -----------------------------------------------------
     *
     * Here you can configure all your different mailer channels.
     * A default configuration has been added for your application.
     *
     * Channel Providers: "logger", "smtp", "mailgun", "resend"
     */
    channels: {
      logger: {
        provider: 'logger',
      },

      /**
       * smtp: {
       *   provider: 'smtp',
       *   host: process.env.MAIL_HOST,
       *   port: process.env.MAIL_PORT,
       *   username: process.env.MAIL_USER,
       *   password: process.env.MAIL_PASSWORD,
       *   ignoreTLS: false,
       *   requireTLS: false,
       *   from: process.env.FROM_ADDRESS,
       * },
       */

      /**
       * mailgun: {
       *   provider: 'mailgun',
       *   username: process.env.MAILGUN_USERNAME,
       *   key: process.env.MAILGUN_API_KEY,
       *   domain: process.env.MAILGUN_DOMAIN,
       *   from: process.env.FROM_ADDRESS,
       * },
       */

      resend: {
        provider: 'resend',
        apiKey: process.env.RESEND_API_KEY,
        from: process.env.FROM_ADDRESS,
      },
    },

    template: {
      appName: process.env.APP_NAME,
      footer: {
        title: process.env.APP_NAME,
      },
    },
  }),
);
