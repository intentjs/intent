import { Inject, Injectable } from '../../foundation/decorators.js';
import {
  HttpMiddleware,
  MiddlewareNext,
  Request,
  Response,
} from '../../rest/index.js';
import { MultiCompiler } from '@rspack/core';

@Injectable()
export class RspackHotMiddleware extends HttpMiddleware {
  constructor(@Inject('RSPACK') private compiler: MultiCompiler) {
    super();
  }

  use(req: Request, res: Response, next: MiddlewareNext): void | Promise<void> {
    throw new Error('Method not implemented.');
  }
}
