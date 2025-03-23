import { ConfigService } from '@intentjs/core/config';
import { Injectable } from '@intentjs/core';
import { HttpMiddleware } from '@intentjs/core/http';
import { MiddlewareNext, Request, Response } from '@intentjs/hyper-express';

@Injectable()
export class GlobalMiddleware extends HttpMiddleware {
  constructor(private readonly config: ConfigService) {
    super();
  }

  use(req: Request, res: Response, next: MiddlewareNext): void {
    next();
  }
}
