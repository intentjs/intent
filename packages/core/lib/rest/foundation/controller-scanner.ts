import { Type } from '../../interfaces/index.js';
import {
  CONTROLLER_KEY,
  METHOD_KEY,
  METHOD_PATH,
} from '../http-server/constants.js';
import { HttpRoute } from '../http-server/interfaces.js';
import { joinRoute } from '../helpers.js';

export class ControllerScanner {
  handle(cls: Type<any>): HttpRoute[] {
    const controllerKey = Reflect.getMetadata(CONTROLLER_KEY, cls);

    const methodNames = Object.getOwnPropertyNames(cls['prototype']);

    if (!controllerKey) return;

    const routes = [];
    for (const key of methodNames) {
      const pathMethod = Reflect.getMetadata(METHOD_KEY, cls['prototype'], key);
      const methodPath = Reflect.getMetadata(
        METHOD_PATH,
        cls['prototype'],
        key,
      );

      if (!pathMethod) continue;

      const fullHttpPath = joinRoute(controllerKey, methodPath);
      routes.push({ method: pathMethod, path: fullHttpPath });
    }

    return routes;
  }
}
