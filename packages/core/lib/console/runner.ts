import * as pc from 'picocolors';
import yargsParser from 'yargs-parser';
import { columnify } from '../utils/columnify.js';
import { isEmpty } from '../utils/helpers.js';
import { ConsoleIO } from './consoleIO.js';
import { CommandObject } from './interfaces.js';
import { ConsoleLogger } from './logger.js';
import { CommandMeta } from './metadata.js';

export class CommandRunner {
  static async run(cmd: string, options?: { silent: boolean }): Promise<void> {
    const argv = yargsParser(cmd);
    const command = CommandMeta.getCommand(argv._[0] as string);
    await CommandRunner.handle(command, { ...argv, silent: options?.silent });
  }

  static async handle(
    command: CommandObject | null,
    args: Record<string, any>,
  ): Promise<void> {
    if (command == null) {
      ConsoleLogger.error('No command found');
      return;
    }

    if (args.silent) {
      console.log = () => {};
    }

    if (args.help) {
      CommandRunner.printOptions(command);
      return;
    }

    const _cli = ConsoleIO.from(command.expression, args);
    if (_cli.hasErrors && _cli.missingArguments.length > 0) {
      _cli.error(` Missing Arguments: ${_cli.missingArguments.join(', ')} `);
      return;
    }

    if (args.debug) {
      console.log(_cli);
    }

    const returnFromCommand = await command.target(_cli);

    process.nextTick(() => {
      returnFromCommand && process.exit(0);
    });

    return;
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

    // if (command.arguments.length > 0) {
    //   Logger.success(pc.bgBlue(pc.white(pc.bold(' Arguments '))));

    //   const list = [];
    //   for (const argument of command.arguments) {
    //     console.log(argument);
    //     list.push({
    //       name: argument.name,
    //       desc: 'No description passed',
    //       default: argument.defaultValue,
    //       isArray: argument.isArray ? 'Y' : 'N',
    //     });
    //   }

    //   Logger.table(['Name', 'Description', 'Default', 'Is Array?'], list);
    // }

    // if (command.options.length > 0) {
    //   Logger.success(pc.bgBlue(pc.white(pc.bold(' Options '))));

    //   const list = [];
    //   for (const option of command.options) {
    //     list.push({
    //       name: option.name,
    //       desc: '',
    //       default: option.defaultValue || 'null',
    //       isArray: option.isArray ? 'Y' : 'N',
    //     });
    //   }

    //   Logger.table(['Name', 'Desc', 'Default', 'Is Array?'], list);
    // }
  }
}
