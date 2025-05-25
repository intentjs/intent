import { Provider } from '@nestjs/common';
import { IntentApplicationContext, Type } from '../interfaces/index.js';
import { ImportType, ServiceProvider } from './service-provider.js';
import { ModuleRef } from '@nestjs/core';
import { SchedulerRegistry } from '../scheduler/metadata.js';

export abstract class IntentAppContainer {
  static serviceProviders: ServiceProvider[] = [];

  add(...serviceProviders: Type<ServiceProvider>[]) {
    for (const sp of serviceProviders) {
      const instance = new sp();
      instance.register();
      IntentAppContainer.serviceProviders.push(instance);
    }
  }

  scanImports(): ImportType[] {
    const imports: ImportType[] = [];
    for (const serviceProvider of IntentAppContainer.serviceProviders) {
      imports.push(...serviceProvider.getAllImports());
    }
    return imports;
  }

  scanProviders(): Provider[] {
    const providers: Provider[] = [];

    for (const serviceProvider of IntentAppContainer.serviceProviders) {
      providers.push(...serviceProvider.getAllProviders());
    }

    return providers;
  }

  async boot(app: IntentApplicationContext): Promise<void> {
    for (const serviceProvider of IntentAppContainer.serviceProviders) {
      await serviceProvider.boot(app);
      await serviceProvider.schedules(app.get(ModuleRef));
    }
  }

  async shutdown(app: IntentApplicationContext): Promise<void> {
    for (const serviceProvider of IntentAppContainer.serviceProviders) {
      await serviceProvider.shutdown(app);
    }
  }

  abstract build();
}
