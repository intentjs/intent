import { TASK_SCHEDULE, TASK_SCHEDULE_OPTIONS } from './constants.js';
import { ScheduleOptions } from './options/interface.js';

export function ScheduleOn(schedule: string, options: ScheduleOptions) {
  return function (...args: string[] | any[]) {
    switch (args.length) {
      case 1:
        Reflect.defineMetadata(TASK_SCHEDULE, schedule, args[0]);
        Reflect.defineMetadata(TASK_SCHEDULE_OPTIONS, options, args[0]);
        break;

      case 3:
        Reflect.defineMetadata(TASK_SCHEDULE, schedule, args[0], args[1]);
        Reflect.defineMetadata(
          TASK_SCHEDULE_OPTIONS,
          options,
          args[0],
          args[1],
        );
        break;
    }
  };
}
