import { CacheOptions } from '@intentjs/core/cache';
import { configNamespace } from '@intentjs/core/config';

export default configNamespace(
  'cache',
  (): CacheOptions => ({
    /**
     * -----------------------------------------------------
     * Default Cache
     * -----------------------------------------------------
     * Documentation - https://tryintent.com/docs/cache
     *
     * This value is the name of the default cache store. This
     * will be used when you use the `Cache` facade to access
     * your cache.
     */
    default: process.env.DEFAULT_CACHE || 'memory',

    /**
     * -----------------------------------------------------
     * Cache Stores
     * -----------------------------------------------------
     * Documentation - https://tryintent.com/docs/cache
     *
     * Inside "stores" you can configure all of your different
     * cache stores that you would want to use in your application.
     *
     * Drivers - "memory", "redis"
     */
    stores: {
      memory: {
        driver: 'memory',
        prefix: '',
      },

      redis: {
        driver: 'redis',
        host: process.env.REDIS_HOST || '127.0.0.1',
        password: process.env.REDIS_PASSWORD || undefined,
        port: +process.env.REDIS_PORT || 6379,
        database: +process.env.REDIS_DB || 0,
        prefix: 'intentjs',
      },

      dicedb: {
        driver: 'dicedb',
        host: process.env.DICEDB_HOST || '127.0.0.1',
        password: process.env.DICEDB_PASSWORD || undefined,
        port: +process.env.DICEDB_PORT || 6379,
        database: +process.env.DICEDB_DB || 0,
        prefix: 'intentjs',
      },
    },
  }),
);
