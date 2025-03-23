import { IntentApplicationContext } from '../interfaces/utils.js';
import repl from 'repl';
import pc from 'picocolors';
import { ConfigService } from '../config/service.js';

export class ReplServer {
  private repl: repl.REPLServer;

  constructor(private readonly app: IntentApplicationContext) {}

  async start() {
    this.repl = repl.start({
      prompt: pc.green(`$ >`),
      input: process.stdin,
      output: process.stdout,
      terminal: true,
      useColors: true,
    });

    this.defineCommands();

    const configService = this.app.get(ConfigService);

    /**
     * Set Application Context
     */
    this.repl.context.app = this.app;

    this.repl.context.$ = {
      version: '0.0.1',
      hw: (name: string) => console.log(`Hello ${name}`),
      config: configService,
    };

    return new Promise(resolve => {
      this.repl.on('exit', () => resolve(true));
    });
  }

  defineCommands() {
    this.defineHelpCommand();
    this.defineClearCommand();
  }

  defineHelpCommand() {
    this.repl.defineCommand('help', {
      help: 'Display this help message',
      action: () => {
        console.log('Available commands:');
        console.log('  help - Display this help message');
      },
    });
  }

  defineClearCommand() {
    this.repl.defineCommand('clear', {
      help: 'Clear the console',
      action: () => {
        // TODO: Implement clear command
        process.stdout.write('\x1Bc');
        process.stdout.write(pc.green(`$ >`));
      },
    });
  }
}
