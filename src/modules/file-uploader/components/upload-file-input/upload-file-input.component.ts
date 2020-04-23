import {Component, ElementRef, Inject, Input, OnInit, ViewChild} from '@angular/core';
import {UploadFileInputConfig} from "./upload-file-input-config.token";
import {UploadFile} from "../../data/UploadFIle";


export interface IUploadFileInputConfig {
    maxSizeMb?: number;
    maxFileSizeMb?: number;
    allowedFiles?: string[];
    allowMultipleFiles?: boolean;
    incorrectFileSizeHandler?: (file: UploadFile | UploadFile[], maxFileSizeMB: number) => any;
    incorrectFileTypeHandler?: (file: UploadFile | UploadFile[], allowedTypes: string[]) => any;
}



@Component({
    selector: 'upload-file-input',
    templateUrl: './upload-file-input.component.html',
    styleUrls: ['./upload-file-input.component.scss']
})
export class UploadFileInputComponent implements OnInit {
    @Input() config: IUploadFileInputConfig;
    @Input() onFilesSelected: (files: UploadFile[]) => any;
    @ViewChild('input', {static: false}) input: ElementRef;

    dragging: boolean;

    constructor(@Inject(UploadFileInputConfig) private _defaultConfig: IUploadFileInputConfig) {
    }

    ngOnInit() {
        this.config = Object.assign({}, this._defaultConfig, this.config);
    }

    handleDragEnter() {
        this.dragging = true;
    }

    handleDragOver() {
        this.dragging = true;
    }

    handleDragLeave() {
        this.dragging = false;
    }

    handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        this.dragging = false;

        this.handleFilesSelected(e);
    }

    handleInputChange(e) {
        this.handleFilesSelected(e);
    }

    handleClick() {
        this.input.nativeElement.click();
    }

    clear() {
        this.input.nativeElement.value = "";
    }

    handleFilesSelected(e: any) {
        const files: File[] = e.dataTransfer
            ? this._fileListToArray(e.dataTransfer.files)
            : this._fileListToArray(e.target.files);

        const uploadFiles = files.map(f => new UploadFile(f));

        if (this._validateFiles(uploadFiles)) {
            this.onFilesSelected(uploadFiles);
        }

        this.clear();
    }

    private _validateFiles(files: UploadFile[]): boolean {
        for (let i = 0; i < files.length; i++) {
            if (!this._validateFileType(files[i])) {

                if (this.config.incorrectFileTypeHandler) {
                    this.config.incorrectFileTypeHandler(files[i], this.config.allowedFiles);
                }

                return false;
            }
        }

        for (let i = 0; i < files.length; i++) {
            if (!this._validateFileSize(files[i])) {

                if (this.config.incorrectFileSizeHandler) {
                    this.config.incorrectFileSizeHandler(files[i], this.config.maxFileSizeMb);
                }

                return false;
            }
        }

        return true;
    }

    private _validateFileSize(file: UploadFile): boolean {
        const maxSizeInBytes = this.config.maxFileSizeMb * 1024 * 1024;

        return maxSizeInBytes >= file.size;
    }

    private _validateFileType(uploadFile: UploadFile): boolean {
        const allowedFiles = this.config.allowedFiles;

        if (allowedFiles == null || allowedFiles.length === 0) {
            return true;
        }

        for (const i of allowedFiles) {
            if (uploadFile.file.type.match(i.trim()) || uploadFile.file.name.search(i.trim()) !== -1) {
                return true;
            }
        }

        return false;
    }

    private _fileListToArray(fileList: FileList): File[] {
        const array = [];

        for (let i = 0; i < fileList.length; i++) {
            array.push(fileList[i]);
        }

        return array;
    }
}
