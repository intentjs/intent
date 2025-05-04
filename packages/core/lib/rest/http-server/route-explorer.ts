import { DiscoveryService, MetadataScanner, ModuleRef } from '@nestjs/core';
import { HttpRoute } from './interfaces.js';
import {
  Request,
  Response as HResponse,
  MiddlewareNext,
} from '@intentjs/hyper-express';
import { HttpExecutionContext } from './contexts/http-execution-context.js';
import { HttpRouteHandler } from './http-handler.js';
import { ExecutionContext } from './contexts/execution-context.js';
import { Type } from '../../interfaces/index.js';
import {
  CONTROLLER_KEY,
  GUARD_KEY,
  METHOD_KEY,
  METHOD_PATH,
  ROUTE_ARGS,
} from './constants.js';
import { RouteArgType } from './param-decorators.js';
import { HttpGuard } from '../foundation/guards/base-guard.js';
import { Reply } from './reply.js';
import { joinRoute } from '../helpers.js';
import { ExceptionHandler } from '../../exceptions/base-exception-handler.js';

export class RouteExplorer {
  globalGuards: Type<HttpGuard>[] = [];

  constructor(
    private discoveryService: DiscoveryService,
    private metadataScanner: MetadataScanner,
    private moduleRef: ModuleRef,
  ) {}

  async exploreFullRoutes(
    exceptionHandler: ExceptionHandler,
  ): Promise<HttpRoute[]> {
    const routes = [];
    const providers = this.discoveryService.getProviders();
    for (const provider of providers) {
      const { instance } = provider;
      // if (
      //   !instance ||
      //   typeof instance === 'string' ||
      //   !Object.getPrototypeOf(instance)
      // ) {
      //   return;
      // }

      const methodNames = this.metadataScanner.getAllMethodNames(instance);
      for (const methodName of methodNames) {
        const route = await this.scanFullRoute(
          instance,
          methodName,
          exceptionHandler,
        );
        route && routes.push(route);
      }
    }

    return routes;
  }

  explorePlainRoutes(
    discoveryService: DiscoveryService,
    metadataScanner: MetadataScanner,
  ): HttpRoute[] {
    const routes = [];
    const providers = discoveryService.getProviders();
    for (const provider of providers) {
      const { instance } = provider;
      //   if (
      //     !instance ||
      //     typeof instance === 'string' ||
      //     !Object.getPrototypeOf(instance)
      //   ) {
      //     return;
      //   }

      const methodNames = metadataScanner.getAllMethodNames(instance);
      for (const methodName of methodNames) {
        const route = this.scanPlainRoute(instance, methodName);
        route && routes.push(route);
      }
    }

    return routes;
  }

  scanPlainRoute(instance: any, key: string): Record<string, any> {
    const controllerKey = Reflect.getMetadata(
      CONTROLLER_KEY,
      instance.constructor,
    );

    if (!controllerKey) return;

    const pathMethod = Reflect.getMetadata(METHOD_KEY, instance, key);
    const methodPath = Reflect.getMetadata(METHOD_PATH, instance, key);

    if (!pathMethod) return;

    const fullHttpPath = joinRoute(controllerKey, methodPath);
    return { method: pathMethod, path: fullHttpPath };
  }

  async scanFullRoute(
    instance: any,
    key: string,
    exceptionHandler: ExceptionHandler,
  ): Promise<HttpRoute> {
    const controllerKey = Reflect.getMetadata(
      CONTROLLER_KEY,
      instance.constructor,
    );
    if (controllerKey === undefined) return;

    const pathMethod = Reflect.getMetadata(METHOD_KEY, instance, key);
    const methodPath = Reflect.getMetadata(METHOD_PATH, instance, key);

    if (!pathMethod) return;
    const controllerGuards = Reflect.getMetadata(
      GUARD_KEY,
      instance.constructor,
    );

    const methodGuards = Reflect.getMetadata(GUARD_KEY, instance, key);

    const composedGuardTypes = [
      ...(controllerGuards || []),
      ...(methodGuards || []),
    ] as Type<HttpGuard>[];

    const composedGuards = [];
    for (const globalGuard of this.globalGuards) {
      composedGuards.push(await this.moduleRef.create(globalGuard));
    }

    for (const guardType of composedGuardTypes) {
      composedGuards.push(await this.moduleRef.create(guardType));
    }

    const routeArgs =
      (Reflect.getMetadata(
        ROUTE_ARGS,
        instance.constructor,
        key,
      ) as RouteArgType[]) || [];

    const handler = new HttpRouteHandler(
      composedGuards,
      instance[key].bind(instance),
      exceptionHandler,
    );

    const replyHandler = new Reply();

    const cb = async (hReq: Request, hRes: HResponse, next: MiddlewareNext) => {
      const httpContext = new HttpExecutionContext(hReq, hRes, next);
      const context = new ExecutionContext(
        httpContext,
        instance.constructor,
        instance[key],
      );

      const args = [];
      for (const index in routeArgs) {
        const routeArg = routeArgs[index];
        args.push(
          routeArg.factory
            ? await routeArg.factory(
                routeArg.data,
                context,
                index as unknown as number,
              )
            : httpContext.getInjectableValueFromArgType(
                routeArg,
                index as unknown as number,
              ),
        );
      }

      await handler.handle(context, args, replyHandler);
    };

    return {
      method: pathMethod,
      path: joinRoute('/', controllerKey, methodPath),
      httpHandler: cb,
    };
  }

  useGlobalGuards(guards: Type<HttpGuard>[]): RouteExplorer {
    this.globalGuards.push(...guards);
    return this;
  }
}
