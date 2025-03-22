import {
  DynamicModule,
  ForwardReference,
  InjectionToken,
  OptionalFactoryDependency,
  Provider,
} from '@nestjs/common';
import type { IntentApplicationContext, Type } from '../interfaces/index.js';

export type ImportType =
  | Type<any>
  | DynamicModule
  | Promise<DynamicModule>
  | ForwardReference;

export abstract class ServiceProvider {
  private providers: Provider[] = [];
  private imports: ImportType[] = [];

  getAllImports(): ImportType[] {
    return this.imports;
  }

  getAllProviders(): Provider[] {
    return this.providers;
  }

  import(...imports: ImportType[]): this {
    this.imports.push(...imports);
    return this;
  }

  bind(...cls: Provider[]): this {
    this.providers.push(...cls);
    return this;
  }

  bindWithValue(token: string | symbol | Type<any>, valueFn: any): this {
    this.providers.push({ provide: token, useValue: valueFn });
    return this;
  }

  bindWithClass(token: string | symbol | Type<any>, cls: Type<any>): this {
    this.providers.push({
      provide: token,
      useClass: cls,
    });
    return this;
  }

  bindWithExisting(token: string, cls: Type<any>): this {
    this.providers.push({ provide: token, useExisting: cls });
    return this;
  }

  bindWithFactory<T>(
    token: string | symbol | Type<any>,
    factory: (...args: any[]) => T | Promise<T>,
    inject?: Array<InjectionToken | OptionalFactoryDependency>,
  ) {
    this.providers.push({ provide: token, useFactory: factory, inject });
  }

  /**
   * Use this method to register any provider.
   */
  abstract register();

  /**
   * Use this method to run
   */
  abstract boot(app: IntentApplicationContext);
}
