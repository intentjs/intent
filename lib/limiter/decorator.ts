import { REFILL_INTERVAL, TOKEN_COUNT } from './constants';

export const Limit = (tokens: number, seconds: number) => {
  console.log('first(): factory evaluated');
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    Reflect.defineMetadata(TOKEN_COUNT, tokens, target, propertyKey);
    Reflect.defineMetadata(REFILL_INTERVAL, seconds, target, propertyKey);

    return descriptor;
  };
};
