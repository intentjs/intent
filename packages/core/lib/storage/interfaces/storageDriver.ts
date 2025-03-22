import {
  StorageDriver$GetFileResponse,
  StorageDriver$FileMetadataResponse,
  StorageDriver$PutFileResponse,
  StorageDriver$RenameFileResponse,
  FileOptions,
} from './index.js';

export interface StorageDriver {
  /**
   * Put file content to the path specified.
   *
   * @param path
   * @param fileContent
   */
  put(
    path: string,
    fileContent: any,
    options?: FileOptions,
  ): Promise<StorageDriver$PutFileResponse>;

  /**
   * Get file stored at the specified path.
   *
   * @param path
   */
  get(path: string): Promise<StorageDriver$GetFileResponse>;

  /**
   * Check if file exists at the path.
   *
   * @param path
   */
  exists(path: string): Promise<boolean>;

  /**
   * Check if file is missing at the path.
   *
   * @param path
   */
  missing(path: string): Promise<boolean>;

  /**
   * Get URL for path mentioned.
   *
   * @param path
   */
  url(path: string): Promise<string>;

  /**
   * Get Signed Urls
   * @param path
   * @param expireInMinutes
   */
  signedUrl(
    path: string,
    expireInMinutes: number,
    command?: 'get' | 'put',
  ): Promise<string>;

  /**
   * Get object's metadata
   * @param path
   */
  meta(path: string): Promise<StorageDriver$FileMetadataResponse>;

  /**
   * Delete file at the given path.
   *
   * @param path
   */
  delete(path: string): Promise<boolean>;

  /**
   * Copy file internally in the same disk
   *
   * @param path
   * @param newPath
   */
  copy(
    path: string,
    newPath: string,
  ): Promise<StorageDriver$RenameFileResponse>;

  /**
   * Move file internally in the same disk
   *
   * @param path
   * @param newPath
   */
  move(
    path: string,
    newPath: string,
  ): Promise<StorageDriver$RenameFileResponse>;

  listDir(path: string): Promise<Record<string, any>>;

  /**
   * Copy object from one path to the same path but on a different disk
   *
   * @param filePath
   * @param destinationDisk
   * @returns
   */
  copyToDisk(
    sourcePath: string,
    destinationDisk: string,
    destinationPath: string,
  ): Promise<boolean>;

  /**
   * Copy object from one path to the same path but on a different disk
   *
   * @param filePath
   * @param destinationDisk
   * @returns
   */
  moveToDisk(
    sourcePath: string,
    destinationDisk: string,
    destinationPath: string,
  ): Promise<boolean>;

  /**
   * Get instance of driver's client.
   */
  getClient<T = any>(): T;

  /**
   * Get config of the driver's instance.
   */
  getConfig(): Record<string, any>;

  /**
   * Read file as JSON
   */
  getAsJson(path: string, throwError: boolean): Promise<Record<string, any>>;

  temporaryUrl(
    path: string,
    ttlInMins: number,
    params?: Record<string, any>,
  ): Promise<string>;

  size(path: string): Promise<number>;

  lastModifiedAt(path: string): Promise<Date>;

  mimeType(path: string): Promise<string>;

  path(path: string): Promise<string>;
}
