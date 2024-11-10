import { DiscoveryModule } from '@nestjs/core';
import { CacheService } from './cache';
import { CodegenCommand } from './codegen/command';
import { CodegenService } from './codegen/service';
import { ViewConfigCommand } from './config/command';
import { ListCommands } from './console';
import { ObjectionService } from './database';
import { DbOperationsCommand } from './database/commands/migrations';
import { EventQueueWorker } from './events/jobListener';
import { IntentExplorer } from './explorer';
import { ServiceProvider } from './foundation';
import { Type } from './interfaces';
import { LocalizationService } from './localization';
import { LoggerService } from './logger';
import { MailerService } from './mailer';
import { QueueService } from './queue';
import { QueueConsoleCommands } from './queue/console';
import { QueueMetadata } from './queue/metadata';
import { StorageService } from './storage/service';
import { Limiter } from './limiter';
import { BuildProjectCommand } from './dev-server/build';
import { DevServerCommand } from './dev-server/serve';
import { CONFIG_FACTORY, ConfigBuilder, ConfigService } from './config';

export const IntentProvidersFactory = (
  config: any[],
): Type<ServiceProvider> => {
  return class extends ServiceProvider {
    register() {
      this.import(DiscoveryModule);
      this.bind(
        IntentExplorer,
        ListCommands,
        DbOperationsCommand,
        ObjectionService,
        StorageService,
        CacheService,
        QueueService,
        QueueConsoleCommands,
        QueueMetadata,
        CodegenCommand,
        CodegenService,
        ViewConfigCommand,
        MailerService,
        LocalizationService,
        EventQueueWorker,
        LoggerService,
        Limiter,
        BuildProjectCommand,
        DevServerCommand,
        ConfigService,
      );
      this.bindWithFactory(CONFIG_FACTORY, async () => {
        return ConfigBuilder.build(config);
      }, []);
    }

    /**
     * Add your application boot logic here.
     */
    boot() {}
  };
};
