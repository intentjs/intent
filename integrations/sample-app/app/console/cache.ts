import { Cache } from '@intentjs/core/cache';
import { Command, ConsoleIO } from '@intentjs/core/console';

@Command('test:cache', { desc: 'Command to test the cache drivers' })
export class TestCacheConsoleCommand {
  async handle(_cli: ConsoleIO): Promise<boolean> {
    _cli.info('Testing the cache');
    const strValue = 'Hello world!';
    const objValue = { msg: 'Hey there!' };

    const disks = ['memory', 'redis', 'dicedb'];
    for (const disk of disks) {
      _cli.info(`Testing integration for ${disk} cache`);
      /**
       * Set different values
       */
      await Cache.store(disk).set('str_value', strValue);
      await Cache.store(disk).set('obj_value', objValue);

      /**
       * Get value from differen
       */
      const strValueFromCache = await Cache.store(disk).get('str_value');
      const objValueFromCache = await Cache.store(disk).get('obj_value');
      console.log(strValueFromCache);
      console.log(objValueFromCache);
    }

    return true;
  }
}
