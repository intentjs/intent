/* eslint-disable @typescript-eslint/no-unused-vars */
import { IntentApplicationContext, ServiceProvider } from '@intentjs/core';
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
  boot(app: IntentApplicationContext) {
    /**
     * Schedule Intent Command to run daily.
     */
    Schedule.command('send:email')
      // .days([Schedule.MONDAY, Schedule.THURSDAY])
      .hourly()
      .timezone('America/Chicago')
      .between('8:00', '17:00')
      .run();

    /**
     * Simple callback, with lifecycle methods `before` and `after`.
     */
    Schedule.call(() => {
      console.log('inside the schedule method');
    })
      .purpose('sample scheduler')
      .before(() => console.log('this will run before the cron'))
      .after((output: any) =>
        console.log('this will run after the cron', output),
      )
      .onSuccess((result) =>
        console.log('this will run on success the cron', result),
      )
      .onFailure((error) =>
        console.log('this will run on failure the cron', error),
      )
      // .pingBefore('https://webhook.site/79dcb789-869b-459d-9ba9-638aae449328')
      .thenPing('https://webhook.site/79dcb789-869b-459d-9ba9-638aae449328')
      .weekends()
      .everyTwoSeconds()
      .when(() => true)

      .run();

    /**
     * Running a job every day at 5AM.
     */
    // Schedule.job({
    //   job: 'process_abandoned_cart',
    //   data: { from: '2024-04-16', to: '2024-04-17' },
    // })
    //   .purpose('cron dispatching job every day at 5AM')
    //   .everyFiveSeconds()
    //   .weekends()
    //   .run();
  }
}
