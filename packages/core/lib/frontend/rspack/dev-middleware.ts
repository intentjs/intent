import { MultiCompiler } from '@rspack/core';
import { Inject, Injectable } from '../../foundation/decorators.js';
import {
  HttpMiddleware,
  MiddlewareNext,
  Request,
  Response,
} from '../../rest/index.js';

@Injectable()
export class RspackDevMiddleware extends HttpMiddleware {
  constructor(@Inject('RSPACK') private compiler: MultiCompiler) {
    super();
  }

  use(req: Request, res: Response, next: MiddlewareNext): void | Promise<void> {
    return new Promise((resolve, reject) => {});
  }
}
