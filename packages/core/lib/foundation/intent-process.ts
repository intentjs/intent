import { ConsoleLogger } from '../console/logger.js';
import { CommandMeta } from '../console/metadata.js';
import { CommandRunner } from '../console/runner.js';
import { Actuator } from './actuator.js';
import { ContainerFactory } from './container-factory.js';
import yargs from 'yargs-parser';

export class IntentConsoleProcess {
  constructor(private readonly actuator: Actuator) {}

  async handle(args: string[]): Promise<void> {
    const container = await this.actuator.importContainer();
    const app = await ContainerFactory.createStandalone(container);

    const argv = yargs(args);
    const commandName = argv._[0];

    if (typeof commandName != 'string') {
      ConsoleLogger.error(' PLEASE ADD A COMMAND ');
      return process.exit();
    }

    const command = CommandMeta.getCommand(commandName);
    if (!command || !command.target) {
      ConsoleLogger.error(` ${commandName} : command not found `);
      return process.exit();
    }

    return new Promise(async (resolve, reject) => {
      try {
        await CommandRunner.handle(command, argv, app);
      } catch (error) {
        console.error(`Intent Process Error:`, error);
        reject(error);
      }
    });
  }
}
