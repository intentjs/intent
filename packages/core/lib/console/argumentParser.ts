import { InternalLogger } from '../utils/logger.js';
import { Str } from '../utils/string.js';
import { ArgumentOptionObject, ArgumentParserOutput } from './interfaces.js';

export class ArgumentParser {
  constructor(private exp: string) {}

  static from(exp: string): ArgumentParserOutput {
    const parser = new ArgumentParser(exp);
    return parser.handle();
  }

  private handle(): ArgumentParserOutput {
    const words = this.exp.split('{');
    const obj: ArgumentParserOutput = {
      name: Str.replace(words.splice(0, 1)[0], /[\s\n]*/, ''),
      arguments: [],
      options: [],
      meta: { desc: '' },
    };

    const reservedArgumentsAndOptions = {};
    for (const word of words) {
      if (!word) continue;
      const input = Str.replace(word, /[\n}]]*/, '').trim();
      Str.startsWith(input, '--')
        ? obj.options.push({
            ...this.parseExpression(
              input.substring(2),
              reservedArgumentsAndOptions,
            ),
            isRequired: false,
          })
        : obj.arguments.push(
            this.parseExpression(input, reservedArgumentsAndOptions),
          );
    }

    return obj;
  }

  parseExpression(
    expression: string,
    reservedArgumentsAndOptions: Record<string, any>,
  ): ArgumentOptionObject {
    const [arg, description] = expression.split(':');
    const [arg1, defaultValue = null] = arg.split('=');

    const formattedExp = Str.replace(arg1, /[?\*]+/g, '');
    const aliasedExp = formattedExp.split('|');

    for (const alias of aliasedExp) {
      if (reservedArgumentsAndOptions[alias]) {
        InternalLogger.error(
          'Console Argument Parser',
          `Only unique command name or alias are allowed, duplicated found for alias: '${alias}'`,
        );
        return;
      }
      reservedArgumentsAndOptions[alias] = 1;
    }
    return {
      name: aliasedExp.pop().trim(),
      alias: aliasedExp.map(a => a.trim()),
      isRequired: !Str.contains(arg, '?'),
      isArray: Str.contains(arg, '*'),
      defaultValue: ![' ', null].includes(defaultValue) && defaultValue,
      expression,
      description: description?.trim() ?? '',
    };
  }
}
