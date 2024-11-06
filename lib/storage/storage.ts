import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { LocalDiskOptions, S3DiskOptions, StorageDriver } from './interfaces';
import { StorageService } from './service';

@Injectable()
export class Storage {
  static build(config: S3DiskOptions | LocalDiskOptions): StorageDriver {
    return StorageService.newDisk(config);
  }

  static disk(disk?: string) {
    return StorageService.getDisk(disk);
  }

  static async download(url: string): Promise<Buffer> {
    const res = await axios.get(url, { responseType: 'arraybuffer' });
    return Buffer.from(res.data);
  }
}
