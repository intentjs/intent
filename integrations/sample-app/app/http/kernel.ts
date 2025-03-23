import { UserController } from '#http/controllers/app';
import { AuthController } from '#http/controllers/auth';
import { SampleMiddleware } from '#http/middlewares/sample';
import { IntentController } from '#http/controllers/icon';
import { GlobalMiddleware } from '#http/middlewares/global';
import { Server } from '@intentjs/hyper-express';
import { GlobalGuard } from '#http/guards/global';
import {
  CorsMiddleware,
  HttpGuard,
  HttpMethods,
  HttpMiddleware,
  Kernel,
  MiddlewareConfigurator,
} from '@intentjs/core/http';
import { Type } from '@intentjs/core';

export class HttpKernel extends Kernel {
  /**
   * Global registry for all of the controller classes.
   * Read more - https://tryintent.com/docs/controllers
   */
  public controllers(): Type<any>[] {
    return [UserController, AuthController, IntentController];
  }

  /**
   * Register all of your global middlewares here.
   * Middlewares added in the return array will be
   * applied to all routes by default.
   *
   * Read more - https://tryintent.com/docs/middlewares
   */
  public middlewares(): Type<HttpMiddleware>[] {
    return [GlobalMiddleware, CorsMiddleware];
  }

  /**
   * Register all of your route based middlewares here.
   * You can apply middlewares to group of routes, controller classes
   * or exclude them.
   *
   * Read more - https://tryintent.com/docs/middlewares
   */
  public routeMiddlewares(configurator: MiddlewareConfigurator) {
    configurator
      .use(SampleMiddleware)
      .for({ path: '/icon/sample', method: HttpMethods.POST })
      .for(IntentController);
    // .exclude('/icon/:name');

    configurator.use(GlobalMiddleware).exclude('/icon/:name');

    configurator.use(SampleMiddleware).for('/icon/plain');
  }

  /**
   * Register all of your global guards here.
   * Guards added in the return array will be
   * applied to all routes by default.
   *
   * Read more - https://tryintent.com/docs/guards
   */
  public guards(): Type<HttpGuard>[] {
    return [GlobalGuard];
  }

  /**
   * @param server
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async boot(server: Server): Promise<void> {}
}
