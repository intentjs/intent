import { CorsOptions, CorsOptionsDelegate } from 'cors';
import { ServerConstructorOptions } from '@intentjs/hyper-express';
import { GenericClass } from './utils.js';

export interface SentryConfig {
  dsn: string;
  tracesSampleRate: number;
  profilesSampleRate: number;
  integrateNodeProfile: boolean;
}
export interface AppConfig {
  name: string;
  env: string;
  debug: boolean;
  url: string;
  hostname?: string;
  port: number;
  error?: {
    validationErrorSerializer?: GenericClass;
  };
  sentry?: SentryConfig;
}

export type RequestParsers =
  | 'json'
  | 'urlencoded'
  | 'formdata'
  | 'plain'
  | 'html'
  | 'binary';

export interface HttpConfig {
  cors?: CorsOptions | CorsOptionsDelegate<any>;
  server?: ServerConstructorOptions;
  staticServe?: {
    httpPath?: string;
    filePath?: string;
    keep?: {
      extensions?: string[];
    };
    cache?: {
      max_file_count?: number;
      max_file_size?: number;
    };
  };
}
