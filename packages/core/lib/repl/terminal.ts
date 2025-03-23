import { ConsoleIO } from '../console/consoleIO.js';
import { Command } from '../console/decorators.js';
import { Injectable } from '../foundation/decorators.js';
import { IntentApplicationContext } from '../interfaces/utils.js';
import { ReplServer } from './repl-server.js';
import pc from 'picocolors';

@Command('shell')
@Injectable()
export class ReplConsole {
  async handle(cli: ConsoleIO, app: IntentApplicationContext) {
    console.log(pc.gray('Intent Shell powered by node:repl'));
    console.log(
      pc.yellow('Type .help to get list of all available methods and props.'),
    );

    const replServer = new ReplServer(app);
    await replServer.start();
  }
}
