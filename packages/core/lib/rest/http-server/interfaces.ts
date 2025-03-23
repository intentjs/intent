import { ServerConstructorOptions } from '@intentjs/hyper-express';
import { CorsOptionsDelegate } from 'cors';

import { CorsOptions } from 'cors';

export type HttpRoute = {
  method: string;
  path: string;
  httpHandler?: any;
  middlewares?: any[];
};

export enum HttpMethods {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  PATCH = 'PATCH',
  OPTIONS = 'OPTIONS',
  HEAD = 'HEAD',
  DELETE = 'DELETE',
  ANY = 'ANY',
}

export interface HttpConfig {
  cors?: CorsOptions | CorsOptionsDelegate<any>;
  server?: ServerConstructorOptions;
  staticServe?: {
    httpPath?: string;
    filePath?: string;
    keep?: { extensions?: string[] };
    cache?: { max_file_count?: number; max_file_size?: number };
  };
}
