import cors, { CorsOptions } from 'cors';
import { ConfigService } from '../../config/service.js';
import { Injectable } from '@nestjs/common';
import { Request, Response } from '@intentjs/hyper-express';
import { IntentMiddleware } from '../foundation/middlewares/middleware.js';

@Injectable()
export class CorsMiddleware extends IntentMiddleware {
  constructor(private readonly config: ConfigService) {
    super();
  }

  async use(req: Request, res: Response): Promise<void> {
    const corsOptions = this.config.get('http.cors') || ({} as CorsOptions);
    const corsMiddleware = cors(corsOptions);
    await new Promise(resolve => {
      corsMiddleware(req, res, () => {
        resolve(1);
      });
    });
  }
}
