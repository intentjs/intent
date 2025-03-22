import { GenericFunction } from '../interfaces/index.js';
import { BaseModel } from './baseModel.js';

export function InjectModel(model: any): GenericFunction {
  if (!(model.prototype instanceof BaseModel)) {
    throw new Error(
      `Instance of ${BaseModel.name} expected, ${typeof model} passed!`,
    );
  }

  return function (target: GenericFunction, key: string | symbol) {
    Object.assign(target, {
      [key]: model,
    });
  };
}
