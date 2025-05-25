import { DatabaseOptions } from '@intentjs/core/db';
import { configNamespace } from '@intentjs/core/config';
import { knexSnakeCaseMappers } from 'objection';

export default configNamespace(
  'db',
  (): DatabaseOptions => ({
    isGlobal: false,
    default: 'pg',
    connections: {
      pg: {
        client: 'pg',
        debug: !!+process.env.DB_DEBUG,
        connection: {
          host: process.env.DB_HOST,
          port: parseInt(process.env.DB_PORT),
          database: process.env.DB_DATABASE,
          user: process.env.DB_USER,
          password: process.env.DB_PASSWORD,
          charset: 'utf8',
        },
        useNullAsDefault: true,
        migrations: {
          directory: './database/migrations',
        },
        ...knexSnakeCaseMappers(),
      },
    },
  }),
);
