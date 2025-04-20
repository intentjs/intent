import { ConsoleIO } from '../../console/consoleIO.js';
import { Command } from '../../console/decorators.js';
import { SchedulerRegistry } from '../metadata.js';

@Command('schedule:work', { desc: 'Command to start the schedule worker' })
export class ScheduleWorkerCommand {
  async handle(_cli: ConsoleIO): Promise<boolean> {
    const schedules = SchedulerRegistry.getAllSchedules();
    _cli.info('Found ' + Object.keys(schedules).length + ' schedules');
    if (Object.keys(schedules).length === 0) {
      _cli.error('No schedules found, exiting...');
      return true;
    }

    for (const schedule of Object.values(schedules)) {
      schedule.start();
    }

    return false;
  }
}
