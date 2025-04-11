const fs = require('fs');

class UploadedFile {
    _filename;
    _sizeInBytes;
    _mimeType;
    _tempName;
    _tempPath;

    constructor(filename, size, mimeType, tempName, tempPath) {
        this._filename = filename;
        this._sizeInBytes = size;
        this._mimeType = mimeType;
        this._tempName = tempName;
        this._tempPath = tempPath;
    }

    get filename() {
        return this._filename;
    }

    get sizeInBytes() {
        return this._sizeInBytes;
    }

    get mimeType() {
        return this._mimeType;
    }

    get extension() {
        return this._filename.split('.').pop();
    }

    async toBuffer() {
        return fs.readFileSync(this._tempPath);
    }
}

module.exports = UploadedFile;
