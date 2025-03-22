import * as pc from 'picocolors';
import { InternalLogger } from './logger.js';

export class Package {
  static async load(pkgName: string): Promise<any> {
    try {
      return import(pkgName);
    } catch (e) {
      InternalLogger.error(
        'PackageLoader',
        `${pc.underline(
          pkgName,
        )} is missing. Please make sure that you have installed the package first`,
      );
      process.exit();
      // process.exitCode = 1;
      // process.exit();
    }
  }
}
