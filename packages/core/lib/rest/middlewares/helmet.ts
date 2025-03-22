import helmet from 'helmet';
import { Injectable } from '../../foundation/index.js';
import { ConfigService } from '../../config/service.js';
import { MiddlewareNext, Request, Response } from '@intentjs/hyper-express';
import { IntentMiddleware } from '../foundation/index.js';

@Injectable()
export class HelmetMiddleware extends IntentMiddleware {
  constructor(private readonly config: ConfigService) {
    super();
  }

  use(req: Request, res: Response, next: MiddlewareNext): void | Promise<void> {
    helmet(this.config.get('app.helmet') as any);
    next();
  }
}
