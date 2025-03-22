import { GenericFunction } from '../interfaces/index.js';
import { ArgumentParser } from './argumentParser.js';
import { CommandObject, CommandMetaOptions } from './interfaces.js';

export class CommandMeta {
  private static commands: Record<string, CommandObject> = {};

  /**
   * Add a new command to the command meta
   * @param command string
   * @param target Function
   * @param options Options
   *
   * @returns void
   */
  static setCommand(
    command: string,
    options: CommandMetaOptions,
    target: GenericFunction,
  ): void {
    const parsedArgument = ArgumentParser.from(command);
    const { name } = parsedArgument;
    CommandMeta.commands[name] = {
      target,
      expression: command,
      ...parsedArgument,
      meta: options,
    };
    return;
  }

  /**
   * Get all commands along with their stored payload
   *
   * @returns Record<string, any>
   */
  static getAllCommands(): Record<string, CommandObject> {
    return CommandMeta.commands;
  }

  /**
   * Get the specified command
   * @param command string
   *
   * @returns Function|null
   */
  static getCommand(command: string): CommandObject | null {
    if (!command) return null;
    const obj = CommandMeta.commands[command];
    return obj || null;
  }

  /**
   * Get target for the specified command
   * @param command string
   *
   * @returns Function|null
   */
  static getTarget(command: string): GenericFunction | null {
    const obj = CommandMeta.commands[command];
    return obj ? obj.target : null;
  }
}
