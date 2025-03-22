import { HttpStatus } from '../rest/http-server/status-codes.js';
import { Obj } from '../utils/object.js';
import { Str } from '../utils/string.js';

export interface HttpExceptionOptions {
  cause?: string;
  description?: string;
}

export class HttpException extends Error {
  public cause: unknown;

  constructor(
    private readonly response: string | Record<string, any>,
    private readonly status: number | HttpStatus,
    private readonly options?: HttpExceptionOptions,
  ) {
    super();
    this.initMessage();
  }

  public initMessage() {
    if (Str.isString(this.response)) {
      this.message = this.response as string;
    } else if (
      Obj.isObj(this.response) &&
      Str.isString((this.response as Record<string, any>).message)
    ) {
      this.message = (this.response as Record<string, any>).message;
    } else if (this.constructor) {
      this.message =
        this.constructor.name.match(/[A-Z][a-z]+|[0-9]+/g)?.join(' ') ??
        'Error';
    }
  }

  public initCause() {
    this.cause = this.options?.cause ?? '';
    return;
  }

  public initName(): void {
    this.name = this.constructor.name;
  }

  public getResponse(): string | object {
    return this.response;
  }

  public getStatus(): number {
    return this.status;
  }
}
