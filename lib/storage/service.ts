import { Injectable, Type } from '@nestjs/common';
import { ConfigService } from '../config/service';
import { InternalLogger } from '../utils/logger';
import { Local, S3Storage } from './drivers';
import { DiskNotFoundException } from './exceptions/diskNotFound';
import { LocalDiskOptions, S3DiskOptions, StorageDriver } from './interfaces';

@Injectable()
export class StorageService {
  private static readonly driverMap: Record<string, Type<StorageDriver>> = {
    local: Local,
    s3: S3Storage,
  };

  private static disks: { [key: string]: any };

  constructor() {}

  static newDisk(config: S3DiskOptions | LocalDiskOptions): StorageDriver {
    const driver = StorageService.driverMap[config.driver];
    if (!driver) throw new DiskNotFoundException(config);
    return new driver('', config);
  }

  static getDisk(disk?: string): StorageDriver {
    const options = ConfigService.get('filesystem');

    disk = disk || options.default;
    if (this.disks.has(disk)) return this.disks.get(disk);

    const diskConfig = options.disks[disk];
    if (!diskConfig) {
      InternalLogger.error(
        'StorageService',
        `We couldn't find any configuration defined for ${disk} disk.`,
      );
      return;
    }

    const driver = this.driverMap[diskConfig.driver];
    if (!driver) {
      InternalLogger.error(
        'StorageService',
        `We couldn't find any disk driver associated with the [${disk}].`,
      );
      return;
    }

    this.disks.set(disk, this.newDisk(diskConfig));
    return this.disks.get(disk);
  }
}
