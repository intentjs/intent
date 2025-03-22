import { RouteArgType, RouteParamtypes } from '../param-decorators.js';
import { MiddlewareNext, Request, Response } from '@intentjs/hyper-express';

export class HttpExecutionContext {
  constructor(
    private readonly request: Request,
    private readonly response: Response,
    private readonly next?: MiddlewareNext,
  ) {}

  getRequest(): Request {
    return this.request;
  }

  getResponse(): Response {
    return this.response;
  }

  getNext(): MiddlewareNext {
    return this.next;
  }

  getInjectableValueFromArgType(routeArg: RouteArgType, index: number): any {
    const { type, data } = routeArg;
    switch (type) {
      case RouteParamtypes.REQUEST:
        return this.getRequest();

      case RouteParamtypes.RESPONSE:
        return this.getResponse();

      case RouteParamtypes.QUERY:
        if (data) {
          return this.request.query_parameters[data as string];
        }
        return { ...this.request.query_parameters };

      case RouteParamtypes.ACCEPTS:
        return this.request.headers['accept'];

      case RouteParamtypes.NEXT:
        return this.getNext();

      case RouteParamtypes.BODY:
        const body = this.request.body();
        if (data) {
          return body[data as string];
        }
        return { ...body };

      case RouteParamtypes.PARAM:
        if (data) {
          return this.request.params[data as string];
        }

        return { ...this.request.params };

      case RouteParamtypes.DTO:
        return this.request.dto();

      case RouteParamtypes.IP:
        return this.request.ip;

      case RouteParamtypes.USER_AGENT:
        return this.request.headers['user-agent'];

      case RouteParamtypes.HOST:
        return this.request.hostname;

      case RouteParamtypes.BUFFER:
        return this.request.buffer();

      case RouteParamtypes.FILE:
        if (data) {
          return this.request.file(data as string);
        }

      case RouteParamtypes.HEADERS:
        if (data) {
          return this.request.headers[data as string];
        }

        return { ...(this.request.headers || {}) };
    }
  }
}
