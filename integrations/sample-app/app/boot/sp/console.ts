import {
  Dispatch,
  IntentApplicationContext,
  ServiceProvider,
} from '@intentjs/core';
import { TestCacheConsoleCommand } from '#console/cache';
import { GreetingCommand } from '#console/greeting';
import { TestLogConsoleCommand } from '#console/log';
import { TestMailConsoleCommand } from '#console/mailer';
import { TestQueueConsoleCommand } from '#console/queue';
import { TestStorageConsoleCommand } from '#console/storage';

export class ConsoleServiceProvider extends ServiceProvider {
  /**
   * Register any application services here.
   */
  register() {
    this.bind(GreetingCommand, TestCacheConsoleCommand);
    this.bind(TestStorageConsoleCommand);
    this.bind(TestLogConsoleCommand);
    this.bind(TestQueueConsoleCommand);
    this.bind(TestMailConsoleCommand);
  }

  /**
   * Bootstrap any application service here.
   *
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  boot(app: IntentApplicationContext) {
    let i = 0;
    setInterval(async () => {
      await Dispatch({
        job: 'redis_job',
        data: { count: i++ },
      });
    }, 1000);
  }
}
