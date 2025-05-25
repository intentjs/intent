/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  IntentApplicationContext,
  ModuleRef,
  ServiceProvider,
} from '@intentjs/core';
import { OrderPlacedListener } from '#events/listeners/sample-listener';
import { QueueJobs } from '#jobs/job';
import { UserDbRepository } from '#repositories/userDbRepository';
import { UserService } from '#services/index';
import { AuthService } from '#services/auth';
import { ScheduleServiceTest } from '#services/schedule';
import { Schedule } from '@intentjs/core/schedule';

export class AppServiceProvider extends ServiceProvider {
  /**
   * Register any application services here.
   */
  register() {
    /**
     * Binding the UserService with the application.
     *
     * Read more - https://tryintent.com/docs/providers
     */
    this.bind(UserService);

    this.bind(AuthService);
    /**
     * Binding the UserDbRepository with a non-class based token 'USER_DB_REPO'.
     *
     * Read more - https://tryintent.com/docs/providers#class-based-providers
     */
    this.bindWithClass('USER_DB_REPO', UserDbRepository);

    this.bind(QueueJobs);

    this.bind(OrderPlacedListener);

    this.bind(ScheduleServiceTest);
  }

  /**
   * Bootstrap any application service here.
   */
  boot(app: IntentApplicationContext) {}

  /**
   * Shutdown any application service here.
   */
  shutdown(app: IntentApplicationContext) {}

  /**
   * Register any schedules here.
   */
  async schedules(ref: ModuleRef): Promise<void> {}
}
