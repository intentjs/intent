import { Command, ConsoleIO } from '@intentjs/core/console';
import { Dispatch } from '@intentjs/core/queue';

@Command('test:queue', { desc: 'Command to test the queue drivers' })
export class TestQueueConsoleCommand {
  async handle(_cli: ConsoleIO): Promise<boolean> {
    const drivers = ['db', 'redis'];
    for (const driver of drivers) {
      console.log(driver);
      await Dispatch({
        job: `${driver}_job`,
        connection: driver,
        delay: 0,
        data: { msg: `Hello from the ${driver} queue driver` },
      });
    }

    return true;
  }
}
