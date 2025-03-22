import 'reflect-metadata';
import { GenericClass } from '../interfaces/index.js';
import { IntentEventConstants } from './constants.js';

export function Event(name?: string) {
  return function (target: GenericClass) {
    Reflect.defineMetadata(
      IntentEventConstants.eventEmitterName,
      name || target['name'],
      target,
    );
  };
}

export function ListensTo(event: string | GenericClass) {
  const eventName = typeof event === 'string' ? event : event['name'];
  return function (target: Record<string, any>, propertyKey: string) {
    Reflect.defineMetadata(
      IntentEventConstants.eventName,
      eventName,
      target,
      propertyKey,
    );
  };
}
