import { Injectable } from '@nestjs/common';
import { applyDecorators } from '../../reflections/apply-decorators.js';
import { Type } from '../../interfaces/index.js';
import {
  CONTROLLER_KEY,
  CONTROLLER_OPTIONS,
  GUARD_KEY,
  METHOD_KEY,
  METHOD_PATH,
} from './constants.js';
import { HttpMethods } from './interfaces.js';
import { HttpGuard } from '../foundation/index.js';

export type ControllerOptions = {
  host?: string;
};

export function Controller(path?: string, options?: ControllerOptions) {
  return applyDecorators(Injectable(), ControllerMetadata(path, options));
}

export function ControllerMetadata(path?: string, options?: ControllerOptions) {
  return function (target: Function) {
    Reflect.defineMetadata(CONTROLLER_KEY, path || '', target);
    Reflect.defineMetadata(CONTROLLER_OPTIONS, options, target);
  };
}

function createRouteDecorators(
  method: HttpMethods,
  path?: string,
  options?: ControllerOptions,
): MethodDecorator {
  return function (target: object, key?: string | symbol, descriptor?: any) {
    Reflect.defineMetadata(METHOD_KEY, method, target, key);
    Reflect.defineMetadata(METHOD_PATH, path || '', target, key);
    return descriptor;
  };
}

export type RouteDecoratorType = (
  path?: string,
  options?: ControllerOptions,
) => MethodDecorator;

export const Get: RouteDecoratorType = (path, options) =>
  createRouteDecorators(HttpMethods.GET, path, options);

export const Post: RouteDecoratorType = (
  path: string,
  options?: ControllerOptions,
) => createRouteDecorators(HttpMethods.POST, path, options);

export const Put: RouteDecoratorType = (
  path: string,
  options?: ControllerOptions,
) => createRouteDecorators(HttpMethods.PUT, path, options);

export const Patch: RouteDecoratorType = (
  path: string,
  options?: ControllerOptions,
) => createRouteDecorators(HttpMethods.PATCH, path, options);

export const Delete: RouteDecoratorType = (
  path: string,
  options?: ControllerOptions,
) => createRouteDecorators(HttpMethods.DELETE, path, options);

export const Options: RouteDecoratorType = (
  path: string,
  options?: ControllerOptions,
) => createRouteDecorators(HttpMethods.OPTIONS, path, options);

export const Head: RouteDecoratorType = (
  path: string,
  options?: ControllerOptions,
) => createRouteDecorators(HttpMethods.HEAD, path, options);

export const ANY: RouteDecoratorType = (
  path: string,
  options?: ControllerOptions,
) => createRouteDecorators(HttpMethods.ANY, path, options);

export const UseGuards = (...guards: Type<HttpGuard>[]) => {
  return function (target: object, key?: string | symbol, descriptor?: any) {
    if (key) {
      const existingGuards = Reflect.getMetadata(GUARD_KEY, target, key);
      const composeGuards = [...(existingGuards || []), ...guards];
      Reflect.defineMetadata(GUARD_KEY, composeGuards, target, key);
      return;
    }
    const existingGuards = Reflect.getMetadata(GUARD_KEY, target);
    const composeGuards = [...(existingGuards || []), ...guards];
    Reflect.defineMetadata(GUARD_KEY, composeGuards, target);
    return;
  };
};
