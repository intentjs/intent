import { Request, Response } from '@intentjs/hyper-express';
import { HttpMiddleware, MiddlewareNext } from '@intentjs/core/http';

export class SampleMiddleware extends HttpMiddleware {
  use(req: Request, res: Response, next: MiddlewareNext): void | Promise<void> {
    // console.log(req.isHttp(), req.httpHost(), req.all(), req.bearerToken());
    next();
  }
}
