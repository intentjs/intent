import { Type } from '../interfaces/index.js';
import { Local } from './drivers/local.js';
import { S3Storage } from './drivers/s3Storage.js';
import { StorageDriver } from './interfaces/index.js';

export const DriverMap: Record<string, Type<StorageDriver>> = {
  local: Local,
  s3: S3Storage,
};
