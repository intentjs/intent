import { HandlerType, ScheduleOptions } from './options/interface.js';
import { Schedule } from './schedule.js';

type ScheduleStore = Record<string, Schedule>;

export class SchedulerRegistry {
  private static schedules = {} as ScheduleStore;

  static addSchedule(
    cronExpression: string,
    handler: any,
    options?: ScheduleOptions,
  ): void {
    const schedule = new Schedule({
      type: HandlerType.FUNCTION,
      value: handler,
    });

    options?.name && schedule.name(options.name);
    schedule.cron(cronExpression);
  }

  static register(name: string, schedule: Schedule): void {
    this.schedules[name] = schedule;
  }

  static getAllSchedules(): ScheduleStore {
    return this.schedules;
  }
}
