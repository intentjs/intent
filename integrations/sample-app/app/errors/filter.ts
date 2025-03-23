import { Type } from '@intentjs/core';
import { ConfigService } from '@intentjs/core/config';
import { ExceptionHandler, HttpException } from '@intentjs/core/errors';
import { ExecutionContext } from '@intentjs/core/http';

export class ApplicationExceptionHandler extends ExceptionHandler {
  constructor(private config: ConfigService) {
    super();
  }

  doNotReport(): Array<Type<HttpException>> {
    return [];
  }

  report(): Array<Type<HttpException>> | string {
    return '*';
  }

  handleHttp(context: ExecutionContext, exception: any) {
    return super.handleHttp(context, exception);
  }
}
