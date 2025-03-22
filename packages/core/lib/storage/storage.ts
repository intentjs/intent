import { Injectable } from '@nestjs/common';
import {
  LocalDiskOptions,
  S3DiskOptions,
  StorageDriver,
} from './interfaces/index.js';
import { StorageService } from './service.js';

@Injectable()
export class Storage {
  static build(config: S3DiskOptions | LocalDiskOptions): StorageDriver {
    return StorageService.makeDriver(config);
  }

  static disk(disk?: string) {
    return StorageService.getDriver(disk);
  }

  static async download(url: string): Promise<Buffer> {
    const res = await fetch(url);
    const data = await res.arrayBuffer();
    return Buffer.from(data);
  }
}
