import { Obj } from '../utils/object.js';
import { ArgumentParser } from './argumentParser.js';
import { Inquirer } from './inquirer.js';
import { ArgumentParserOutput } from './interfaces.js';
import { ConsoleLogger } from './logger.js';

export class ConsoleIO {
  schema: ArgumentParserOutput;
  rawValues: Record<string, any>;
  values: Record<string, any> = { arguments: {}, options: {} };
  hasErrors: boolean;
  missingArguments: string[];

  constructor(
    private schemaString: string,
    private argv: Record<string, any>,
  ) {
    this.schema = { name: '', arguments: [], options: [], meta: { desc: '' } };
    this.values = { arguments: {}, options: {} };
    this.rawValues = { ...this.argv };
    this.missingArguments = [];
    this.hasErrors = false;
  }

  static from(schemaString: string, argv: Record<string, any>): ConsoleIO {
    const parent = new ConsoleIO(schemaString, argv);
    parent.handle();
    return parent;
  }

  argument<T>(key: string): T {
    return this.values.arguments[key];
  }

  option<T>(key: string): T {
    return this.values.options[key];
  }

  handle(): ConsoleIO {
    this.schema = ArgumentParser.from(this.schemaString);
    this.values = { arguments: {}, options: {} };
    this.rawValues = { ...this.argv };

    /**
     * Parse arguments
     */
    const argumentValues = this.argv._.splice(1);
    for (const argument of this.schema.arguments) {
      if (argument.isArray && argumentValues.length > 0) {
        this.values.arguments[argument.name] = argumentValues;
        break;
      } else {
        const singleArgumentValue = argumentValues.splice(0, 1);
        if (singleArgumentValue.length > 0) {
          this.values.arguments[argument.name] = singleArgumentValue[0];
        }
      }

      if (!this.values.arguments[argument.name]) {
        if (argument.defaultValue !== undefined) {
          this.values.arguments[argument.name] = argument.isArray
            ? [argument.defaultValue]
            : argument.defaultValue;
        }
      }
    }

    this.validateArguments();
    if (this.hasErrors) return this;

    /**
     * Parse options
     */
    for (const option of this.schema.options) {
      const value = Obj.get(this.argv, option.name, ...option.alias);
      if (value) {
        this.values.options[option.name] = value;
      } else {
        this.values.options[option.name] = option.defaultValue;
      }
    }

    return this;
  }

  validateArguments(): void {
    for (const argument of this.schema.arguments) {
      if (!this.values.arguments[argument.name] && argument.isRequired) {
        this.missingArguments.push(argument.name);
      }
    }

    if (this.missingArguments.length > 0) {
      this.hasErrors = true;
    }
  }

  /**
   * Use this method to print an information line
   * @param msg
   * @returns void
   */
  info(msg: string) {
    ConsoleLogger.info(msg);
  }

  /**
   * Use this method to print an error message
   * @param msg
   * @returns void
   */
  error(msg: string) {
    ConsoleLogger.error(msg);
  }

  /**
   * Use this method to print a warning message
   * @param msg
   * @returns void
   */
  warn(msg: string) {
    ConsoleLogger.warn(msg);
  }

  /**
   * Use this method to print a success message
   * @param msg
   * @returns void
   */
  success(msg: string) {
    ConsoleLogger.success(msg);
  }

  /**
   * Use this method to print a line.
   * Prints line half the width of the console
   * @returns void
   */
  line() {
    ConsoleLogger.line();
  }
  /**
   * Use this function to print table in console
   * @param rows
   * @param options
   * @returns void
   */
  table(header: string[], rows: Array<Array<string>>) {
    ConsoleLogger.table(header, rows);
  }

  /**
   * Use this method to ask the client about any input.
   * @param question
   * @returns Promise<string>
   */
  async ask(question: string) {
    return Inquirer.ask(question);
  }

  /**
   * Use this method to let the client select option from given choices
   * @param question
   * @param choices
   * @returns Promise<string>
   */
  async select(question: string, choices: string[]): Promise<string> {
    return Inquirer.select(question, choices);
  }

  async multiSelect(question: string, choices: string[]) {
    return Inquirer.multiSelect(question, choices);
  }

  /**
   * Use this method to ask for confirmation from the client
   * @param message
   */
  async confirm(message: string) {
    return Inquirer.confirm(message);
  }

  /**
   * Use this method to ask for a password/hidden input from the client
   * @param question
   * @param mask
   */
  async password(question: string) {
    return Inquirer.password(question);
  }
}
