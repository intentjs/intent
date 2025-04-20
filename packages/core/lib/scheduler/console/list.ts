import { ConsoleIO } from '../../console/consoleIO.js';
import { Command } from '../../console/decorators.js';
import { SchedulerRegistry } from '../metadata.js';
import pc from 'picocolors';

@Command('schedule:list', {
  desc: 'Command to list all of the scheduled tasks',
})
export class ListScheduledTaskCommands {
  async handle(_cli: ConsoleIO): Promise<boolean> {
    const schedules = SchedulerRegistry.getAllSchedules();
    const rows = [];

    for (const [name, schedule] of Object.entries(schedules)) {
      rows.push([
        pc.yellow(schedule.getCronExp()),
        schedule.getName(),
        schedule.getPurpose(),
      ]);
    }

    _cli.table(['Schedule', 'Name', 'Purpose'], rows);
    return true;
  }
}
