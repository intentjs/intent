import { LocalDiskOptions, S3DiskOptions } from './interfaces/index.js';
import { StorageDriver } from './interfaces/index.js';
import { DiskNotFoundException } from './exceptions/diskNotFound.js';
import { ConfigService } from '../config/service.js';
import { DriverMap } from './driver-mapper.js';
import { Injectable } from '../foundation/decorators.js';

@Injectable()
export class StorageService {
  /**
   * Map to store all of the initialised disks
   */
  private static disks: Map<string, StorageDriver> = new Map<
    string,
    StorageDriver
  >();

  /**
   * Make a new driver from the given config.
   * @param config
   * @returns
   */

  static makeDriver(config: S3DiskOptions | LocalDiskOptions): StorageDriver {
    const driver = DriverMap[config.driver];
    if (!driver) throw new DiskNotFoundException(config);
    return new driver('', config);
  }

  /**
   * Gets the driver from the cached map, or else builds a new one if it doesn't exist.
   * @param disk
   * @returns
   */
  static getDriver(disk?: string): StorageDriver {
    const options = ConfigService.get('filesystem');
    disk = disk || options.default;
    if (this.disks.has(disk)) return this.disks.get(disk);

    const diskConfig = options.disks[disk];
    const newDriver = this.makeDriver(diskConfig);
    this.disks.set(disk, newDriver);
    return newDriver;
  }
}
