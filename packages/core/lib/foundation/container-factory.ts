import { NestFactory } from '@nestjs/core';
import type { IntentApplicationContext, Type } from '../interfaces/index.js';
import { ModuleBuilder } from './module-builder.js';
import { IntentAppContainer } from './app-container.js';
import { ServiceProvider } from './service-provider.js';

export class ContainerFactory {
  static async createStandalone(
    containerCls: Type<IntentAppContainer>,
    extraServiceProviders: Type<ServiceProvider>[] = [],
  ): Promise<IntentApplicationContext> {
    const container = new containerCls();

    if (extraServiceProviders.length > 0) {
      container.add(...extraServiceProviders);
    }

    container.build();

    /**
     * Build a module for NestJS DI Container
     */
    const module = ModuleBuilder.build(container);

    /**
     * Build NestJS DI Container
     */
    const app = await NestFactory.createApplicationContext(module, {
      logger: ['error'],
    });

    /**
     * Run the `boot` & `schedules` method of the main application container
     */
    await container.boot(app);

    return app;
  }
}
