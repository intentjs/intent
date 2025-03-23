import { Response } from '@intentjs/hyper-express';
import { ExecutionContext } from './contexts/execution-context.js';
import { Reply } from './reply.js';
import { HttpGuard } from '../foundation/guards/base-guard.js';
import { ExceptionHandler } from '../../exceptions/base-exception-handler.js';

export class HttpRouteHandler {
  constructor(
    protected readonly guards: HttpGuard[],
    protected readonly handler: Function,
    protected readonly exceptionHandler: ExceptionHandler,
  ) {}

  async handle(
    context: ExecutionContext,
    args: any[],
    replyHandler: Reply,
  ): Promise<Response> {
    try {
      /**
       * Handle the Guards
       */
      for (const guard of this.guards) {
        await guard.handle(context);
      }

      /**
       * Handle the request
       */
      const responseFromHandler = await this.handler(...args);

      if (responseFromHandler instanceof Response) {
        return responseFromHandler;
      }

      const request = context.switchToHttp().getRequest();
      const response = context.switchToHttp().getResponse();
      replyHandler.handle(request, response, responseFromHandler);
    } catch (e) {
      const res = this.exceptionHandler.catch(context, e);
      return res;
    }
  }
}
