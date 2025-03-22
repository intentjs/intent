/* eslint-disable @typescript-eslint/ban-types */
import 'reflect-metadata';
import { ulid } from 'ulid';
import { Obj } from '../utils/object.js';

/**
 * Reflector is a class to easily fetch metadata from a class and request handler method
 * at the runtime.
 */
export class Reflector {
  constructor(
    private cls: any,
    private handler?: Function,
  ) {}

  /**
   * Gets the metadata from the `handler` method and `handler's class`,
   * if the metadata from the handler is not empty, then return the handler data.
   * Otherwise, return the class' metadata.
   *
   * @param keyOrDecorator
   * @returns
   */
  allAndOverride<T = any>(keyOrDecorator: string | Object): T {
    const decoratorKey =
      typeof keyOrDecorator === 'function'
        ? keyOrDecorator['KEY']
        : keyOrDecorator;

    const dataFromHandler = Reflect.getMetadata(decoratorKey, this.handler);
    const dataFromClass = Reflect.getMetadata(decoratorKey, this.cls);
    return dataFromHandler || dataFromClass;
  }

  /**
   * Gets the metadata from the `handler` method and `handler's class`
   * and merges it. It can currently merge the array and objects.
   *
   * @param keyOrDecorator string | Object
   * @returns
   */
  allAndMerge<T = any>(keyOrDecorator: string | Object): T {
    const decoratorKey =
      typeof keyOrDecorator === 'function'
        ? keyOrDecorator['KEY']
        : keyOrDecorator;

    const dataFromHandler = Reflect.getMetadata(decoratorKey, this.handler);
    const dataFromClass = Reflect.getMetadata(decoratorKey, this.cls);

    if (Array.isArray(dataFromHandler) && Array.isArray(dataFromClass)) {
      return dataFromHandler.concat(dataFromClass) as T;
    }

    if (Obj.isObj(dataFromHandler) && Obj.isObj(dataFromClass)) {
      return { ...dataFromClass, ...dataFromHandler } as T;
    }

    return [dataFromClass, dataFromHandler] as T;
  }

  /**
   * Gets the metadata from the `handler's class` and returns it.
   * @param keyOrDecorator
   * @param defaultValue
   * @returns
   */
  getFromClass<T = any>(keyOrDecorator: string | Object, defaultValue?: T): T {
    const key =
      typeof keyOrDecorator === 'function'
        ? keyOrDecorator['KEY']
        : keyOrDecorator;

    const data = Reflect.getMetadata(key, this.cls);
    return data || defaultValue;
  }

  /**
   * Gets the metadata from the `handler` method and returns it.
   * @param keyOrDecorator string
   * @param defaultValue T
   * @returns
   */
  getFromMethod<T = any>(keyOrDecorator: string | Object, defaultValue?: T): T {
    const key =
      typeof keyOrDecorator === 'object'
        ? keyOrDecorator['KEY']
        : keyOrDecorator;

    const data = Reflect.getMetadata(key, this.handler);
    return data || defaultValue;
  }

  /**
   * A shorthand to create a decorator for quickly setting metadata
   * on controllers and methods.
   * @param decoratorKey string
   * @returns
   */
  public static createDecorator<TParam>(decoratorKey?: string) {
    const metadataKey = decoratorKey || ulid();
    const decoratorFn =
      (metadataValue: TParam) =>
      (target: object | Function, key?: string | symbol, descriptor?: any) => {
        if (descriptor) {
          Reflect.defineMetadata(metadataKey, metadataValue, descriptor.value);
          return descriptor;
        }

        Reflect.defineMetadata(metadataKey, metadataValue, target);
        return target;
      };

    decoratorFn.KEY = metadataKey;
    return decoratorFn;
  }
}
