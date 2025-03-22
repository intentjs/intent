/* eslint-disable @typescript-eslint/no-unused-vars */
import { IntentApplicationContext, ServiceProvider } from '@intentjs/core';
import { OrderPlacedListener } from '#events/listeners/sample-listener';
import { QueueJobs } from '#jobs/job';
import { UserDbRepository } from '#repositories/userDbRepository';
import { UserService } from '#services/index';
import { AuthService } from '#services/auth';

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
  }

  /**
   * Bootstrap any application service here.
   */
  boot(app: IntentApplicationContext) {}
}
