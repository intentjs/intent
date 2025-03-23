import { CorsOptions, CorsOptionsDelegate } from 'cors';
import { ServerConstructorOptions } from '@intentjs/hyper-express';
import { GenericClass } from '../interfaces/utils.js';
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
