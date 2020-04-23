import {FileType} from "./FileType";

export class UploadFile {
    public fileName: string;
    public size: number;
    public type: FileType;

    constructor(public file: File) {
        this.fileName = this._getFileName(file);
        this.size = this._getFileSizeInMb(file);
        this.type = this._getFileType(file);
    }

    private _getFileName(file: any): string {
        return file.name;
    }

    private _getFileSizeInMb(file: File): number {
        return file.size;
    }

    private _getFileType(file: File): FileType {
        return file.type.match('image.*')
            ? FileType.Image
            : file.type.match('video.*')
                ? FileType.Video
                : FileType.File;
    }
}
