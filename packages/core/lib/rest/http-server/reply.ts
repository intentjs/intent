import { Request, Response } from '@intentjs/hyper-express';
import { HttpStatus } from './status-codes.js';
import { isUndefined } from '../../utils/helpers.js';
import { StreamableFile } from './streamable-file.js';
import { Obj } from '../../utils/index.js';
import { instanceToPlain } from 'class-transformer';

export class Reply {
  async handle(req: Request, res: Response, dataFromHandler: any) {
    const { method } = req;

    /**
     * Set the status code of the response
     */
    if (!res.statusCode && method === 'POST') {
      res.status(HttpStatus.CREATED);
    } else if (!res.statusCode) {
      res.status(HttpStatus.OK);
    }

    if (dataFromHandler instanceof StreamableFile) {
      const headers = dataFromHandler.getHeaders();
      if (
        isUndefined(res.getHeader('Content-Type')) &&
        !isUndefined(headers.type)
      ) {
        res.header('Content-Type', headers.type);
      }
      if (
        isUndefined(res.getHeader('Content-Disposition')) &&
        !isUndefined(headers.type)
      ) {
        res.header('Content-Disposition', headers.disposition);
      }

      if (
        isUndefined(res.getHeader('Content-Length')) &&
        !isUndefined(headers.length)
      ) {
        res.header('Content-Length', headers.length + '');
      }

      return res.stream(dataFromHandler.getStream());
    }

    if (!dataFromHandler) return res.send();

    /**
     * Default to JSON
     */
    let plainData = Array.isArray(dataFromHandler)
      ? dataFromHandler.map(r => this.transformToPlain(r))
      : this.transformToPlain(dataFromHandler);

    // console.log(plainData);
    // console.time('time_to_detect_object');
    // console.log(Obj.isObj(dataFromHandler), instanceToPlain(dataFromHandler));
    // console.timeEnd('time_to_detect_object');
    if (typeof plainData != null && typeof plainData === 'object') {
      return res.json(plainData);
    }

    return res.send(String(plainData));
  }

  transformToPlain(plainOrClass: any) {
    if (!plainOrClass) return plainOrClass;
    return instanceToPlain(plainOrClass);
  }
}
