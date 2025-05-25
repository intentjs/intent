import {
  DynamicModule,
  ForwardReference,
  InjectionToken,
  OptionalFactoryDependency,
  Provider,
} from '@nestjs/common';
import type { IntentApplicationContext, Type } from '../interfaces/index.js';
import { ModuleRef } from '@nestjs/core';

export type ImportType =
  | Type<any>
  | DynamicModule
  | Promise<DynamicModule>
  | ForwardReference;

/**
 * Abstract base class for service providers.
 * Service providers are used to register dependencies, configure the application,
 * and define lifecycle hooks within the IntentJS framework.
 */
export abstract class ServiceProvider {
  /**
   * Stores providers registered by this service provider.
   */
  private providers: Provider[] = [];
  /**
   * Stores modules imported by this service provider.
   */
  private imports: ImportType[] = [];

  /**
   * Retrieves all modules imported by this service provider.
   * @returns An array of imported modules.
   */
  getAllImports(): ImportType[] {
    return this.imports;
  }

  /**
   * Retrieves all providers registered by this service provider.
   * @returns An array of registered providers.
   */
  getAllProviders(): Provider[] {
    return this.providers;
  }

  /**
   * Adds modules to be imported.
   * @param imports - The modules to import.
   * @returns The current ServiceProvider instance.
   */
  import(...imports: ImportType[]): this {
    this.imports.push(...imports);
    return this;
  }

  /**
   * Registers one or more providers.
   * @param cls - The provider(s) to register.
   * @returns The current ServiceProvider instance.
   */
  bind(...cls: Provider[]): this {
    this.providers.push(...cls);
    return this;
  }

  /**
   * Binds a token to a specific value.
   * @param token - The injection token.
   * @param valueFn - The value to bind.
   * @returns The current ServiceProvider instance.
   */
  bindWithValue(token: string | symbol | Type<any>, valueFn: any): this {
    this.providers.push({ provide: token, useValue: valueFn });
    return this;
  }

  /**
   * Binds a token to a specific class.
   * @param token - The injection token.
   * @param cls - The class to bind.
   * @returns The current ServiceProvider instance.
   */
  bindWithClass(token: string | symbol | Type<any>, cls: Type<any>): this {
    this.providers.push({
      provide: token,
      useClass: cls,
    });
    return this;
  }

  /**
   * Binds a token to an existing instance identified by another token (alias).
   * @param token - The injection token (alias).
   * @param cls - The token of the existing instance.
   * @returns The current ServiceProvider instance.
   */
  bindWithExisting(token: string, cls: Type<any>): this {
    this.providers.push({ provide: token, useExisting: cls });
    return this;
  }

  /**
   * Binds a token to a factory function.
   * @param token - The injection token.
   * @param factory - The factory function.
   * @param inject - Optional dependencies to inject into the factory function.
   * @returns The current ServiceProvider instance.
   */
  bindWithFactory<T>(
    token: string | symbol | Type<any>,
    factory: (...args: any[]) => T | Promise<T>,
    inject?: Array<InjectionToken | OptionalFactoryDependency>,
  ) {
    this.providers.push({ provide: token, useFactory: factory, inject });
  }

  /**
   * Abstract method to be implemented by subclasses.
   * Use this method to register providers and imports using the `bind*` and `import` methods.
   */
  abstract register();

  /**
   * Abstract lifecycle hook executed during application bootstrapping.
   * @param app - The Intent application context.
   */
  abstract boot(app: IntentApplicationContext);

  /**
   * Abstract lifecycle hook executed during application shutdown.
   * @param app - The Intent application context.
   */
  abstract shutdown(app: IntentApplicationContext);

  /**
   * Abstract method for registering scheduled tasks or jobs.
   * @param ref - The ModuleRef instance for resolving dependencies.
   */
  abstract schedules(ref: ModuleRef): Promise<void>;
}
