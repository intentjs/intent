import { MiddlewareNext, Request, Response } from '@intentjs/hyper-express';
import { HttpMiddleware } from '../../rest/foundation/middlewares/middleware.js';
import { Inject, Injectable } from '@nestjs/common';
import { ViteDevServer } from 'vite';
import { IncomingMessage, ServerResponse } from 'http';

@Injectable()
export class ViteDevMiddleware extends HttpMiddleware {
  constructor(
    @Inject('VITE')
    private readonly vite: ViteDevServer,
  ) {
    super();
  }

  async use(req: Request, res: Response, next: MiddlewareNext): Promise<void> {
    console.log('vite dev middleware222');

    this.vite.middlewares(
      req as unknown as IncomingMessage,
      res as unknown as ServerResponse,
      next,
    );
  }
}
