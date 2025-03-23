import { Server } from '@intentjs/hyper-express';
import { Type } from '../../interfaces/index.js';
import { MiddlewareConfigurator } from './middlewares/configurator.js';
import { HttpMiddleware } from './middlewares/middleware.js';
import { HttpGuard } from './guards/base-guard.js';
export abstract class Kernel {
  public controllers(): Type<any>[] {
    return [];
  }

  public middlewares(): Type<HttpMiddleware>[] {
    return [];
  }

  public routeMiddlewares(configurator: MiddlewareConfigurator) {}

  public guards(): Type<HttpGuard>[] {
    return [];
  }

  public abstract boot(app: Server): Promise<void>;
}
