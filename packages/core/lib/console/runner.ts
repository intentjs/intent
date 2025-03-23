import pc from 'picocolors';
import yargsParser from 'yargs-parser';
import { columnify } from '../utils/columnify.js';
import { isEmpty } from '../utils/helpers.js';
import { ConsoleIO } from './consoleIO.js';
import { CommandObject } from './interfaces.js';
import { ConsoleLogger } from './logger.js';
import { CommandMeta } from './metadata.js';
import { IntentApplicationContext } from '../interfaces/utils.js';

export class CommandRunner {
  static async run(cmd: string, options?: { silent: boolean }): Promise<void> {
    const argv = yargsParser(cmd);
    const command = CommandMeta.getCommand(argv._[0] as string);
    await CommandRunner.handle(command, { ...argv, silent: options?.silent });
  }

  static async handle(
    command: CommandObject | null,
    args: Record<string, any>,
    app?: IntentApplicationContext,
  ): Promise<void> {
    if (command == null) {
      ConsoleLogger.error('No command found');
      return;
    }

    if (args.silent) console.log = () => {};

    if (args.help) {
      CommandRunner.printOptions(command);
      return;
    }

    const _cli = this.buildConsoleIO(command, args, app);

    if (args.debug) {
      console.log(_cli);
    }

    const returnFromCommand = await command.target(_cli, app);

    process.nextTick(() => {
      returnFromCommand && process.exit(0);
    });

    return;
  }

  static buildConsoleIO(
    command: CommandObject,
    args: Record<string, any>,
    app?: IntentApplicationContext,
  ): ConsoleIO {
    const _cli = ConsoleIO.from(command.expression, args);
    if (_cli.hasErrors && _cli.missingArguments.length > 0) {
      _cli.error(` Missing Arguments: ${_cli.missingArguments.join(', ')} `);
      return;
    }

    return _cli;
  }

  static printOptions(command: CommandObject) {
    console.log(pc.yellow('Command: ') + command.name);
    if (command.meta.desc) {
      console.log(pc.yellow('Description: ') + command.meta.desc);
    }

    if (command.arguments.length) {
      console.log();
      console.log(pc.yellow('Arguments:'));
      const rows = [];
      for (const option of command.arguments) {
        let key = option.name;
        key = option.defaultValue ? `${key}[=${option.defaultValue}]` : key;
        let desc = option.description || 'No description passed';
        desc = option.isArray
          ? `${desc} ${pc.yellow('[multiple values allowed]')}`
          : desc;

        rows.push({ key, description: desc });
      }
      const printRows = [];
      const formattedRows = columnify(rows, { padStart: 2 });
      for (const row of formattedRows) {
        printRows.push([pc.green(row[0]), row[1]].join(''));
      }

      console.log(printRows.join('\n'));
    }

    if (command.options.length) {
      console.log();
      console.log(pc.yellow('Options:'));
      const rows = [];
      for (const option of command.options) {
        let key = option.alias?.length ? `-${option.alias.join('|')}, ` : ``;
        key = `${key}--${option.name}`;
        key = isEmpty(option.defaultValue)
          ? `${key}[=${option.defaultValue}]`
          : key;
        let desc = option.description || 'No description passed';
        desc = option.isArray
          ? `${desc} ${pc.yellow('[multiple values allowed]')}`
          : desc;

        rows.push({ key, description: desc });
      }
      const printRows = [];
      const formattedRows = columnify(rows, { padStart: 2 });
      for (const row of formattedRows) {
        printRows.push([pc.green(row[0]), row[1]].join(''));
      }

      console.log(printRows.join('\n'));
    }
  }
}
