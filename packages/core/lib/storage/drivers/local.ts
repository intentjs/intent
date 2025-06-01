import { ReadStream, createReadStream } from 'fs';
import { extname, join } from 'path';
import fs from 'fs-extra';
import { CannotParseAsJsonException } from '../exceptions/cannotParseAsJson.js';
import { CannotPerformFileOpException } from '../exceptions/cannotPerformFileOp.js';
import { getMimeTypeFromExtention } from '../helpers/index.js';
import {
  LocalDiskOptions,
  StorageDriver,
  StorageDriver$FileMetadataResponse,
  StorageDriver$PutFileResponse,
  StorageDriver$RenameFileResponse,
} from '../interfaces/index.js';
import { StorageService } from '../service.js';

export class Local implements StorageDriver {
  constructor(
    private disk: string,
    private config: LocalDiskOptions,
  ) {}

  /**
   * Put file content to the path specified.
   *
   * @param path
   * @param fileContent
   */
  async put(
    filePath: string,
    fileContent: any,
  ): Promise<StorageDriver$PutFileResponse> {
    await fs.outputFile(
      join(this.config.basePath || '', filePath),
      fileContent,
    );
    return { path: join(this.config.basePath || '', filePath), url: '' };
  }

  /**
   * Get file stored at the specified path.
   *
   * @param path
   */
  async get(filePath: string): Promise<Buffer> {
    return await fs.readFile(join(this.config.basePath || '', filePath));
  }

  /**
   * Get object's metadata
   * @param path
   */
  async meta(filePath: string): Promise<StorageDriver$FileMetadataResponse> {
    const path = join(this.config.basePath || '', filePath);
    const res = await fs.stat(path);
    return {
      path,
      contentLength: res.size,
      lastModified: res.mtime,
    };
  }

  /**
   * Get Signed Urls
   * @param path
   */
  async signedUrl(
    filePath: string,
    expire = 10,
    command: 'get' | 'put',
  ): Promise<string> {
    console.log(expire, filePath, command);
    return '';
  }

  /**
   * Check if file exists at the path.
   *
   * @param path
   */
  async exists(filePath: string): Promise<boolean> {
    return fs.pathExists(join(this.config.basePath || '', filePath));
  }

  /**
   * Check if file is missing at the path.
   *
   * @param path
   */
  async missing(filePath: string): Promise<boolean> {
    return !(await this.exists(filePath));
  }

  /**
   * Get URL for path mentioned.
   *
   * @param path
   */
  async url(fileName: string): Promise<string> {
    if (this.config.hasOwnProperty('baseUrl')) {
      const filePath = join('public', fileName);
      return `${this.config.basePath}/${filePath}`;
    } else {
      return '';
    }
  }

  /**
   * Delete file at the given path.
   *
   * @param path
   */
  async delete(filePath: string): Promise<boolean> {
    try {
      await fs.remove(join(this.config.basePath || '', filePath));
      return true;
    } catch (e) {
      if (this.shouldThrowError())
        throw new CannotPerformFileOpException(
          `File ${filePath} cannot be deleted due to the reason: ${e['message']}`,
        );
    }
    return false;
  }

  getAsStream(filePath: string): ReadStream {
    return createReadStream(join(this.config.basePath || '', filePath));
  }

  /**
   * Copy file internally in the same disk
   *
   * @param path
   * @param newPath
   */
  async copy(
    sourcePath: string,
    destinationPath: string,
  ): Promise<StorageDriver$RenameFileResponse> {
    await fs.copy(
      join(this.config.basePath || '', sourcePath),
      join(this.config.basePath || '', destinationPath),
      { overwrite: true },
    );
    return {
      path: join(this.config.basePath || '', destinationPath),
      url: await this.url(destinationPath),
    };
  }

  /**
   * Move file internally in the same disk
   *
   * @param path
   * @param newPath
   */
  async move(
    sourcePath: string,
    destinationPath: string,
  ): Promise<StorageDriver$RenameFileResponse> {
    await this.copy(sourcePath, destinationPath);
    await this.delete(sourcePath);
    return {
      path: join(this.config.basePath || '', destinationPath),
      url: await this.url(destinationPath),
    };
  }

  /**
   * Get instance of driver's client.
   */
  getClient(): null {
    return null;
  }

  /**
   * Get config of the driver's instance.
   */
  getConfig(): Record<string, any> {
    return this.config;
  }

  async copyToDisk(
    sourcePath: string,
    destinationDisk: string,
    destinationPath: string,
  ): Promise<boolean> {
    try {
      const buffer = await this.get(sourcePath);
      const driver = StorageService.getDriver(destinationDisk);
      await driver.put(destinationPath, buffer);
      return true;
    } catch (e) {
      if (this.shouldThrowError()) {
        throw new CannotPerformFileOpException(
          `File cannot be copied from ${sourcePath} to ${destinationDisk} in ${destinationDisk} disk for the reason: ${e['message']}`,
        );
      }
    }

    return false;
  }

  async moveToDisk(
    sourcePath: string,
    destinationDisk: string,
    destinationPath: string,
  ): Promise<boolean> {
    try {
      const buffer = await this.get(sourcePath);
      const driver = StorageService.getDriver(destinationDisk);
      await driver.put(destinationPath, buffer);
      await this.delete(sourcePath);
      return true;
    } catch (e) {
      if (this.shouldThrowError()) {
        throw new CannotPerformFileOpException(
          `File cannot be moved from ${sourcePath} to ${destinationDisk} in ${destinationDisk} disk for the reason: ${e['message']}`,
        );
      }
      console.log('error while copying ===> ', e);
    }
    return false;
  }

  async getAsJson(path: string): Promise<Record<string, any>> {
    const buffer = await this.get(path);
    try {
      return JSON.parse(buffer.toString());
    } catch (e) {
      if (this.shouldThrowError()) {
        throw new CannotParseAsJsonException();
      }
      return null;
    }
  }

  temporaryUrl(
    path: string,
    ttlInMins: number,
    params?: Record<string, any>,
  ): Promise<string> {
    console.log(path, ttlInMins, params);
    return null;
  }

  async size(filePath: string): Promise<number> {
    const path = join(this.config.basePath || '', filePath);
    const res = await fs.stat(path);
    return res.size;
  }

  async lastModifiedAt(filePath: string): Promise<Date> {
    const path = join(this.config.basePath || '', filePath);
    const res = await fs.stat(path);
    return res.mtime;
  }

  async mimeType(filePath: string): Promise<string> {
    return getMimeTypeFromExtention(filePath);
  }

  async path(filePath: string): Promise<string> {
    return join(this.config.basePath || '', filePath);
  }

  async listDir(path: string): Promise<Record<string, any>> {
    const directory = join(this.config.basePath || '', path);
    const fileNames = await fs.readdir(directory);

    const listOfFiles = [];
    for (const fileName of fileNames) {
      const ext = extname(fileName);
      const fileStat = await fs.stat(join(directory, fileName));
      listOfFiles.push({
        name: fileName,
        ext: ext,
        contentLengthInBytes: fileStat.size,
      });
    }

    return { total: listOfFiles.length, files: listOfFiles };
  }

  shouldThrowError(): boolean {
    return this.config.throwOnFailure === undefined
      ? true
      : this.config.throwOnFailure;
  }
}
