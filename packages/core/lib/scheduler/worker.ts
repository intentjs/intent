import { SchedulerRegistry } from './metadata.js';

export class ScheduleWorker {
  static init() {
    return new ScheduleWorker();
  }

  async run(): Promise<void> {
    // const cronPackage = await Package.load('cron');
    const schedules = SchedulerRegistry.getAllSchedules();

    for (const [schedule, options] of Object.entries(schedules)) {
      console.log(schedule, options);
      // const job = CronJob.from({});
    }
    // const job =  CronJob.from({})
  }
}
