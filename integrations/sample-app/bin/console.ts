import {
  CommandMeta,
  CommandRunner,
  ContainerFactory,
  ConsoleLogger,
} from '@intentjs/core';
import yargs from 'yargs-parser';
import 'console.mute';

async function bootstrap() {
  try {
    const { ApplicationContainer } = await import('../app/boot/container.js');

    // console['mute']();
    await ContainerFactory.createStandalone(ApplicationContainer as any);
    // console['resume']();

    const argv = yargs(process.argv.slice(2));
    argv.command = argv._[0];

    if (typeof argv.command != 'string') {
      ConsoleLogger.error(' PLEASE ADD A COMMAND ');
      return process.exit();
    }

    const command = CommandMeta.getCommand(argv.command);
    if (!command || !command.target) {
      ConsoleLogger.error(` ${argv.command} : command not found `);
      return process.exit();
    }

    await CommandRunner.handle(command, argv);
  } catch (error) {
    console.error('Bootstrap error:', error);
    process.exit(1);
  }
}

bootstrap();
