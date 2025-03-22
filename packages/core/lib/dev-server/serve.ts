import { Command, ConsoleIO } from '../console/index.js';
import { Package } from '../utils/index.js';

@Command(
  `dev
  {--config : Path to intent.config.json file}
  {--debug : Start debug mode in the server}
`,
  { desc: 'Command to start a server in watch (live-reload) mode.' },
)
export class DevServerCommand {
  async handle(_cli: ConsoleIO): Promise<void> {
    const debug = _cli.option('debug');
    const disableTypeCheck = _cli.option('debug');
    const tsConfig = _cli.option('tsConfig');
    const config = _cli.option('config');
    const port = +_cli.option('port');

    const { StartServerCommand } = await Package.load('@intentjs/cli');
    const command = new StartServerCommand();
    await command.handle({
      watch: true,
      debug,
      disableTypeCheck,
      tsConfig,
      config,
      port,
    });
  }
}
