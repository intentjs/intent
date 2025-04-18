import { DiscoveryModule } from '@nestjs/core';
import { CacheService } from './cache/service.js';
import { ViewConfigCommand } from './config/command.js';
import { ListCommands } from './console/index.js';
import { ObjectionService } from './database/service.js';
import { DbOperationsCommand } from './database/commands/migrations.js';
import { EventQueueWorker } from './events/jobListener.js';
import { IntentExplorer } from './explorer.js';
import { ServiceProvider } from './foundation/service-provider.js';
import { Type } from './interfaces/index.js';
import { LocalizationService } from './localization/service.js';
import { LoggerService } from './logger/service.js';
import { MailerService } from './mailer/service.js';
import { QueueService } from './queue/service.js';
import { QueueConsoleCommands } from './queue/console/commands.js';
import { QueueMetadata } from './queue/metadata.js';
import { StorageService } from './storage/service.js';
import { BuildProjectCommand } from './dev-server/build.js';
import { DevServerCommand } from './dev-server/serve.js';
import {
  CONFIG_FACTORY,
  ConfigBuilder,
  ConfigService,
} from './config/index.js';
import { ReplConsole } from './repl/terminal.js';
import { ListScheduledTaskCommands } from './scheduler/console/list.js';

export const IntentProvidersFactory = (
  config: any[],
): Type<ServiceProvider> => {
  return class extends ServiceProvider {
    register() {
      this.import(DiscoveryModule);

      this.bindWithFactory(CONFIG_FACTORY, async () => {
        return await ConfigBuilder.build(config);
      });

      this.bind(
        ReplConsole,
        ConfigService,
        IntentExplorer,
        ListCommands,
        DbOperationsCommand,
        ObjectionService,
        StorageService,
        CacheService,
        QueueService,
        QueueConsoleCommands,
        QueueMetadata,
        // CodegenCommand,
        // CodegenService,
        ViewConfigCommand,
        MailerService,
        LocalizationService,
        EventQueueWorker,
        LoggerService,
        BuildProjectCommand,
        DevServerCommand,
        ListScheduledTaskCommands,
      );
    }

    /**
     * Add your application boot logic here.
     */
    boot() {}
  };
};
