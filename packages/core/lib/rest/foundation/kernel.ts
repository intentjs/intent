import { Server } from '@intentjs/hyper-express';
import { Type } from '../../interfaces/index.js';
import { IntentGuard } from './guards/base-guard.js';
import { MiddlewareConfigurator } from './middlewares/configurator.js';
import { IntentMiddleware } from './middlewares/middleware.js';

export abstract class Kernel {
  public controllers(): Type<any>[] {
    return [];
  }

  public middlewares(): Type<IntentMiddleware>[] {
    return [];
  }

  public routeMiddlewares(configurator: MiddlewareConfigurator) {}

  public guards(): Type<IntentGuard>[] {
    return [];
  }

  public abstract boot(app: Server): Promise<void>;
}
