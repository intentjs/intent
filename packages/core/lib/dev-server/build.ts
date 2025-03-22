import { Command, ConsoleIO } from '../console/index.js';
import { getTime, Package } from '../utils/index.js';
import pc from 'picocolors';

@Command(
  `build
  {--c|config : Path to the .intentrc file.}
  {--t|tsconfig : Path to tsconfig file.}
  {--d|debug : Run in debug mode (with --inspect flag).}
  {--dtc|disable-type-check : Disable type checking. Enabled by default.}`,
  { desc: 'Command to build the application' },
)
export class BuildProjectCommand {
  async handle(_cli: ConsoleIO): Promise<void> {
    const debug = _cli.option('debug');
    const disableTypeCheck = _cli.option('disable-type-check');
    const tsConfig = _cli.option('tsconfig');
    const config = _cli.option('config');

    const now = Date.now();
    const { BuildCommand } = await Package.load('@intentjs/cli');
    const command = new BuildCommand();
    await command.handle({
      debug,
      disableTypeCheck,
      tsConfig,
      config,
    });

    console.log(
      pc.gray(`[${getTime()}]`),
      pc.bgWhite(pc.black(` INTENT `)),
      `Build process completed in ${Date.now() - now}ms`,
    );

    process.exit();
  }
}
