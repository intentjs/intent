import { NestFactory } from '@nestjs/core';
import type { IntentApplicationContext, Type } from '../interfaces/index.js';
import { ModuleBuilder } from './module-builder.js';
import { IntentAppContainer } from './app-container.js';

export class ContainerFactory {
  static async createStandalone(
    containerCls: Type<IntentAppContainer>,
  ): Promise<IntentApplicationContext> {
    const container = new containerCls();

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
     * Run the `boot` method of the main application container
     */
    container.boot(app);

    return app;
  }
}
