import { CONFIG_FACTORY } from './constant.js';
import type { ConfigMap } from './options.js';
import pc from 'picocolors';
import archy from 'archy';
import { jsonToArchy } from '../utils/console-helpers.js';
import { Command } from '../console/decorators.js';
import { ConsoleIO } from '../console/consoleIO.js';
import { Inject } from '../foundation/decorators.js';

@Command('config:view {--ns : Namespace of a particular config}', {
  desc: 'Command to view config for a given namespace',
})
export class ViewConfigCommand {
  constructor(@Inject(CONFIG_FACTORY) private config: ConfigMap) {}

  async handle(_cli: ConsoleIO): Promise<void> {
    const nsFlag = _cli.option<string>('ns');
    const printNsToConsole = (namespace, obj) => {
      const values = obj.get('static') as Record<string, any>;
      console.log(
        archy(jsonToArchy(values, pc.bgGreen(pc.black(` ${namespace} `)))),
      );
    };

    if (nsFlag) {
      const ns = this.config.get(nsFlag);
      printNsToConsole(nsFlag, ns);
      return;
    }

    // Example usage
    for (const [namespace, obj] of this.config.entries()) {
      printNsToConsole(namespace, obj);
    }
  }
}
