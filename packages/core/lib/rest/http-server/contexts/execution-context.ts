import { GenericClass } from '../../../interfaces/index.js';
import { Reflector } from '../../../reflections/reflector.js';
import { HttpExecutionContext } from './http-execution-context.js';

export class ExecutionContext {
  private reflectorClass: Reflector;

  constructor(
    private protocolContext: HttpExecutionContext,
    private readonly handlerClass: GenericClass,
    private readonly handlerMethod: Function,
  ) {
    this.reflectorClass = new Reflector(this.handlerClass, this.handlerMethod);
  }

  getClass(): GenericClass {
    return this.handlerClass;
  }

  getHandler(): Function {
    return this.handlerMethod;
  }

  switchToHttp(): HttpExecutionContext {
    return this.protocolContext;
  }

  getReflector(): Reflector {
    return this.reflectorClass;
  }
}
