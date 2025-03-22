import { Module } from '@nestjs/common';
import { Kernel } from '../rest/foundation/kernel.js';
import { IntentAppContainer } from './app-container.js';

export class ModuleBuilder {
  static build(container: IntentAppContainer, kernel?: Kernel) {
    const providers = container.scanProviders();
    const controllers = kernel?.controllers() || [];

    @Module({
      imports: container.scanImports(),
      providers: [...providers, ...controllers],
    })
    class AppModule {}

    return AppModule;
  }
}
