import {
  ConfigService,
  ExecutionContext,
  HttpException,
  IntentExceptionHandler,
  Type,
} from '@intentjs/core';

export class ApplicationExceptionHandler extends IntentExceptionHandler {
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
