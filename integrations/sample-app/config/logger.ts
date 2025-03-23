import { toBoolean } from '@intentjs/core';
import { configNamespace } from '@intentjs/core/config';
import {
  LoggerOptions,
  LogLevel,
  Transports,
  Formats,
} from '@intentjs/core/logger';

export default configNamespace(
  'logger',
  (): LoggerOptions => ({
    /**
     * -----------------------------------------------------
     * Default Logger
     * -----------------------------------------------------
     * Documentation - https://tryintent.com/docs/logging
     *
     * This value is the name of the default logger. This will be
     * used when you use the `Log()` facade.
     */
    default: 'app',

    /**
     * -----------------------------------------------------
     * Disable Global Console Log
     * -----------------------------------------------------
     * Documentation - https://tryintent.com/docs/logging
     *
     * This flag is used to define if the console log being done
     * through these loggers should be disabled globally. You
     * can change this setting in ".env" file
     *
     * This setting doesn't affect the behaviour of the
     * "console.log" statement.
     */
    disableConsole: toBoolean(process.env.DISABLE_CONSOLE_LOG || false),

    /**
     * -----------------------------------------------------
     * Loggers
     * -----------------------------------------------------
     * Documentation - https://tryintent.com/docs/logging
     *
     * You can configure loggers for different purpose in your
     * application. For example, you can make "orders" or "payments"
     * loggers.
     */

    loggers: {
      app: {
        /**
         * -----------------------------------------------------
         * Log Level
         * -----------------------------------------------------
         * Documentation - https://tryintent.com/docs/logging#log-levels
         *
         * This value is used to define the log level for which this
         * logger would run.
         *
         * Log Levels - "error", "warn", "info", "http", "verbose", "debug"
         */
        level: (process.env.LOG_LEVEL as LogLevel) || 'debug',

        /**
         * -----------------------------------------------------
         * Log Transports
         * -----------------------------------------------------
         * Documentation - https://tryintent.com/docs/logging#supported-transports
         *
         * This value is used to determine the destination of where
         * all of the data should be logged.
         *
         * Available Transports - "console", "file", "http", "stream"
         */
        transports: [
          { transport: Transports.Console, format: Formats.Default },
          {
            transport: Transports.File,
            format: Formats.Json,
            options: { filename: 'intent.log' },
          },
        ],
      },
    },
  }),
);
