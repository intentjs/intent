import { ConsoleIO } from './consoleIO.js';

export interface CommandMetaOptions {
  desc?: string;
  usage?: string[];
}

export interface CommandObject extends ArgumentParserOutput {
  target: (cli: ConsoleIO) => Promise<void | boolean>;
  expression: string;
  meta: CommandMetaOptions;
}

export interface ArgumentOptionObject {
  name: string;
  alias?: string[];
  isRequired: boolean;
  isArray: boolean;
  defaultValue: string | boolean;
  expression: string;
  description?: string;
}

export interface ArgumentParserOutput {
  name: string;
  arguments: ArgumentOptionObject[];
  options: ArgumentOptionObject[];
  meta: CommandMetaOptions;
}
