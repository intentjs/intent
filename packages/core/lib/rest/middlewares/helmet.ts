import helmet from 'helmet';
import { Injectable } from '../../foundation/index.js';
import { ConfigService } from '../../config/service.js';
import { MiddlewareNext, Request, Response } from '@intentjs/hyper-express';
import { HttpMiddleware } from '../foundation/middlewares/middleware.js';

@Injectable()
export class HelmetMiddleware extends HttpMiddleware {
  constructor(private readonly config: ConfigService) {
    super();
  }

  use(req: Request, res: Response, next: MiddlewareNext): void | Promise<void> {
    helmet(this.config.get('app.helmet') as any);
    next();
  }
}
