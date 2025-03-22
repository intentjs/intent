import { findProjectRoot, HttpConfig, configNamespace } from '@intentjs/core';
import { join } from 'path';

export default configNamespace(
  'http',
  (): HttpConfig => ({
    cors: {
      origin: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
    },

    server: {
      max_body_buffer: 100000000,
      max_body_length: 100000000,
    },

    staticServe: {
      httpPath: 'assets',
      filePath: join(findProjectRoot(), 'public'),
      keep: {
        extensions: ['css', 'js', 'json', 'png', 'jpg', 'jpeg'],
      },
      cache: {
        max_file_count: 1000,
        max_file_size: 4 * 1024 * 1024,
      },
    },
  }),
);
