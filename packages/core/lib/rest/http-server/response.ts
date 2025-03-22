import {
  Response as HResponse,
  Request as HRequest,
} from '@intentjs/hyper-express';
import { StreamableFile } from './streamable-file.js';
import { HttpStatus } from './status-codes.js';
import {
  EXTENSTION_TO_MIME,
  SupportedExtentions,
} from '../../utils/extension-to-mime.js';
import { isUndefined, Obj } from '../../utils/index.js';

export class Response {
  private statusCode: HttpStatus;
  private bodyData: any | StreamableFile;
  private responseHeaders: Map<string, any>;

  constructor() {
    this.responseHeaders = new Map<string, any>();
    this.statusCode = HttpStatus.OK;
  }

  status(statusCode: HttpStatus): Response {
    this.statusCode = statusCode;
    return this;
  }

  header(key: string, value: string): Response {
    this.responseHeaders.set(key, value);
    return this;
  }

  type(type: SupportedExtentions): Response {
    this.header('Content-Type', EXTENSTION_TO_MIME[type]);
    return this;
  }

  body(body: any): Response {
    if (Obj.isObj(body) || Array.isArray(body)) {
      this.type('json');
      this.bodyData = JSON.stringify(body);
    } else {
      this.bodyData = body;
    }
    return this;
  }

  text(text: string): Response {
    this.type('text');
    this.bodyData = text;
    return this;
  }

  stream(stream: StreamableFile): Response {
    this.bodyData = stream;
    return this;
  }

  json(json: Record<string, any> | Record<string, any>[]): Response {
    this.type('json');
    this.bodyData = JSON.stringify(json);
    return this;
  }

  html(html: string): Response {
    this.type('html');
    this.responseHeaders.set('Content-Type', 'text/html');
    this.bodyData = html;
    return this;
  }

  notFound(): Response {
    this.statusCode = HttpStatus.NOT_FOUND;
    return this;
  }

  redirect(url: string): Response {
    this.statusCode = HttpStatus.FOUND;
    this.responseHeaders.set('location', url);
    return this;
  }

  reply(req: HRequest, res: HResponse) {
    const { method } = req;

    /**
     * Set the status code of the response
     */
    if (!this.statusCode && method === 'POST') {
      res.status(HttpStatus.CREATED);
    } else if (this.statusCode) {
      res.status(this.statusCode);
    } else {
      res.status(HttpStatus.OK);
    }

    /**
     * Set the headers
     */
    for (const key of this.responseHeaders.keys()) {
      res.setHeader(key, this.responseHeaders.get(key));
    }

    if (this.bodyData instanceof StreamableFile) {
      const headers = this.bodyData.getHeaders();
      if (
        isUndefined(res.getHeader('Content-Type')) &&
        !isUndefined(headers.type)
      ) {
        res.setHeader('Content-Type', headers.type);
      }
      if (
        isUndefined(res.getHeader('Content-Disposition')) &&
        !isUndefined(headers.type)
      ) {
        res.setHeader('Content-Disposition', headers.disposition);
      }

      if (
        isUndefined(res.getHeader('Content-Length')) &&
        !isUndefined(headers.length)
      ) {
        res.setHeader('Content-Length', headers.length + '');
      }

      return res.stream(this.bodyData.getStream());
    }

    return res.send(this.bodyData);
  }
}
