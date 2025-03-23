import { Command, ConsoleIO } from '@intentjs/core/console';
import { disposeLogger, log } from '@intentjs/core/logger';

@Command('test:log', { desc: 'Command to test the log' })
export class TestLogConsoleCommand {
  async handle(_cli: ConsoleIO) {
    _cli.info('Testing the log');
    log('Hello world!!');
    return true;
  }
}
