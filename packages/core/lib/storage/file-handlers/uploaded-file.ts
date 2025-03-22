import { readFileSync } from 'fs-extra';
import { Str } from '../../utils/index.js';

export class UploadedFile {
  constructor(
    public readonly filename: string,
    public readonly size: number,
    public readonly mimeType: string,
    public readonly tempName: string,
    public readonly tempPath: string,
  ) {}

  get extension(): string {
    return Str.afterLast(this.filename, '.');
  }

  async toBuffer(): Promise<Buffer> {
    return readFileSync(this.tempPath);
  }
}
