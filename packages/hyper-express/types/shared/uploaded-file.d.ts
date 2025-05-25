export class UploadedFile {
    _filename: string;
    _size: number;
    _mimeType: string;
    _tempName: string;
    _tempPath: string;

    get filename(): string;
    get size(): string;
    get mimeType(): string;
    get tempName(): string;
    get tempPath(): string;

    get extension(): string;

    toBuffer(): Promise<Buffer>;
}
