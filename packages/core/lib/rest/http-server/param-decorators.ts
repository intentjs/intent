import { plainToInstance } from 'class-transformer';
import { ROUTE_ARGS } from './constants.js';
import { ExecutionContext } from './contexts/execution-context.js';

export enum RouteParamtypes {
  REQUEST = 0,
  RESPONSE = 1,
  NEXT = 2,
  BODY = 3,
  QUERY = 4,
  PARAM = 5,
  HEADERS = 6,
  SESSION = 7,
  FILE = 8,
  HOST = 9,
  IP = 10,
  USER_AGENT = 11,
  ACCEPTS = 12,
  BUFFER = 13,
  DTO = 14,
}

export type RouteArgType = {
  type: RouteParamtypes;
  data: object | string | number;
  factory: CustomRouteParamDecoratorFactory;
};

function createRouteParamDecorator(paramType: RouteParamtypes) {
  return (data?: object | string | number): ParameterDecorator =>
    (target, key, index) => {
      const args =
        Reflect.getMetadata(ROUTE_ARGS, target.constructor, key) || [];
      args[index] = {
        type: paramType,
        data: data,
      };

      Reflect.defineMetadata(ROUTE_ARGS, args, target.constructor, key);
    };
}

type CustomRouteParamDecoratorFactory<T = string | object | number | any> = (
  data: T,
  context: ExecutionContext,
  argIndex?: number,
) => any;

export function createParamDecorator<T = string | object | number | any>(
  factory: CustomRouteParamDecoratorFactory<T>,
  enhancers?: ParameterDecorator[],
): (data?: T) => ParameterDecorator {
  return (data?: T): ParameterDecorator =>
    (target, key, index) => {
      const args =
        Reflect.getMetadata(ROUTE_ARGS, target.constructor, key) || [];
      args[index] = { data: data, factory };
      Reflect.defineMetadata(ROUTE_ARGS, args, target.constructor, key);

      if (Array.isArray(enhancers)) {
        for (const enhancer of enhancers) enhancer(target, key, index);
      }
    };
}

export const Req: () => ParameterDecorator = createRouteParamDecorator(
  RouteParamtypes.REQUEST,
);

export const Res: () => ParameterDecorator = createRouteParamDecorator(
  RouteParamtypes.RESPONSE,
);

// export const Dto: () => ParameterDecorator = createRouteParamDecorator(
//   RouteParamtypes.DTO,
// );

export const BufferBody: () => ParameterDecorator = createRouteParamDecorator(
  RouteParamtypes.BUFFER,
);

export const Query: (key?: string) => ParameterDecorator =
  createRouteParamDecorator(RouteParamtypes.QUERY);

export const Param: (key?: string) => ParameterDecorator =
  createRouteParamDecorator(RouteParamtypes.PARAM);

export const Body: (key?: string) => ParameterDecorator =
  createRouteParamDecorator(RouteParamtypes.BODY);

export const Header: (key?: string) => ParameterDecorator =
  createRouteParamDecorator(RouteParamtypes.HEADERS);

export const IP: () => ParameterDecorator = createRouteParamDecorator(
  RouteParamtypes.IP,
);

export const UserAgent: () => ParameterDecorator = createRouteParamDecorator(
  RouteParamtypes.USER_AGENT,
);

export const Host: () => ParameterDecorator = createRouteParamDecorator(
  RouteParamtypes.HOST,
);

export const Accepts: () => ParameterDecorator = createRouteParamDecorator(
  RouteParamtypes.ACCEPTS,
);

export const File: (key?: string) => ParameterDecorator =
  createRouteParamDecorator(RouteParamtypes.FILE);

export const Dto = createParamDecorator(
  async (data: any, ctx: ExecutionContext, argIndex: number) => {
    const req = ctx.switchToHttp().getRequest();
    if (req.dto()) return req.dto();

    const types = Reflect.getMetadata(
      'design:paramtypes',
      ctx.getClass().prototype,
      ctx.getHandler().name,
    );

    const paramType = types[argIndex];
    const typeParamType = typeof paramType;

    if (typeParamType === 'function') {
      const dto = await plainToInstance(paramType, req.all());
      req.setDto(dto);
      return dto;
    }

    return req.all();
  },
);
