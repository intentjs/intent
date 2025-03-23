import { QueueOptions } from '@intentjs/core/queue';
import { configNamespace } from '@intentjs/core/config';

export default configNamespace('queue', (): QueueOptions => {
  return {
    /**
     * -----------------------------------------------------
     * Default Queue Driver
     * -----------------------------------------------------
     * Documentation - https://tryintent.com/docs/queues
     *
     * This value is the name of the default queue driver.
     * This will be used to determine the messag queue where
     * the message should be processed.
     */
    default: process.env.DEFAULT_QUEUE || 'sync',

    /**
     * -----------------------------------------------------
     * Queue Drivers
     * -----------------------------------------------------
     * Documentation - https://tryintent.com/docs/queues
     *
     * You can define different queue connections inside the
     * "connections" attribute.
     *
     * Available Queue Drivers - "sync", "sqs", "redis", "db"
     */
    connections: {
      db: {
        driver: 'db',
        listenerType: 'poll',
        table: 'intent_jobs',
        queue: 'default',
      },

      sync: {
        driver: 'sync',
        listenerType: 'poll',
      },

      /**
       * sqs: {
       *   driver: 'sqs',
       *   listenerType: 'poll',
       *   apiVersion: '2012-11-05',
       *   credentials: null,
       *   prefix: process.env.SQS_PREFIX,
       *   queue: process.env.SQS_QUEUE,
       *   suffix: '',
       *   region: process.env.AWS_REGION,
       * },
       */

      redis: {
        driver: 'redis',
        listenerType: 'poll',
        host: process.env.REDIS_HOST,
        port: +process.env.REDIS_PORT,
        queue: process.env.QUEUE_NAME,
        username: process.env.REDIS_USERNAME,
        password: process.env.REDIS_PASSWORD,
        prefix: '',
        database: 0,
      },
    },
  };
});
