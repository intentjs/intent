import { IntentApplicationContext } from '@intentjs/core';
import { TestCacheConsoleCommand } from '#console/cache';
import { GreetingCommand } from '#console/greeting';
import { TestLogConsoleCommand } from '#console/log';
import { TestMailConsoleCommand } from '#console/mailer';
import { TestQueueConsoleCommand } from '#console/queue';
import { TestStorageConsoleCommand } from '#console/storage';
import { ModuleRef, ServiceProvider } from '@intentjs/core';
import { Schedule } from '@intentjs/core/schedule';

export class ConsoleServiceProvider extends ServiceProvider {
  register() {
    this.bind(
      TestCacheConsoleCommand,
      GreetingCommand,
      TestLogConsoleCommand,
      TestQueueConsoleCommand,
      TestMailConsoleCommand,
      TestStorageConsoleCommand,
    );
  }

  /**
   * Bootstrap any application services here.
   */
  boot(app: IntentApplicationContext) {}

  /**
   * Shutdown any application services here.
   */
  shutdown(app: IntentApplicationContext) {}

  /**
   * Register any schedules here.
   */
  async schedules(ref: ModuleRef): Promise<void> {}
}
