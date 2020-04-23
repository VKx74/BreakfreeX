import {Component, EventEmitter, Input, Output} from "@angular/core";
import {TranslateService} from "@ngx-translate/core";
import {FileInfo} from "@app/models/storage/models";
import {Observable, of, ReplaySubject} from "rxjs";
import {tap} from "rxjs/operators";
import {FileStorageService} from "@app/services/file-storage.service";
import {FileType} from "../../data/FileType";
import {UploadFile} from "../../data/UploadFIle";
import {UploadFilePreviewer} from "../../data/UploadFilePreviever";

export const FileUploadingStatus = {
    Ready: 'ready',
    Uploaded: 'uploaded',
    Uploading: 'uploading',
    Failed: 'failed',
    IncorrectSize: 'incorrectSize',
    IncorrectType: 'incorrectType'
};


export class UploadFileItem {
    status: string;

    private _storageService: FileStorageService;
    private _previewImageObs: ReplaySubject<string>;


    get fileName(): string {
        return this.uploadFile.fileName;
    }

    get size(): number {
        return this.uploadFile.size;
    }

    get type(): FileType {
        return this.uploadFile.type;
    }

    constructor(public uploadFile: UploadFile,
                private _injector) {
        this.status = FileUploadingStatus.Ready;
        this._storageService = _injector.get(FileStorageService);
    }


    getPreviewImageUrl(): Observable<string> {
        if (this._previewImageObs) {
            return this._previewImageObs;
        }

        this._previewImageObs = new ReplaySubject(1);

        const previewer = new UploadFilePreviewer(this._injector);
        previewer.getPreviewImageUrl(this.uploadFile)
            .subscribe((url: string) => {
                this._previewImageObs.next(url);
            });

        return this._previewImageObs;
    }

    upload(progress: any): Observable<FileInfo> {
        this.status = FileUploadingStatus.Uploading;

        return this._storageService.uploadFile(this.uploadFile, undefined, progress)
            .pipe(
                tap({
                    next: () => {
                        this.status = FileUploadingStatus.Uploaded;
                    },
                    error: (e) => {
                        console.error(e);
                        this.status = FileUploadingStatus.Failed;
                    }
                })
            );
    }
}


@Component({
    selector: 'upload-file-item',
    templateUrl: 'upload-file-item.component.html',
    styleUrls: ['upload-file-item.component.scss']
})
export class UploadFileItemComponent {
    @Input() file: UploadFileItem;
    @Input() allowedFiles: string[];
    @Input() maxFileSizeMb: number;

    @Output() onRemove = new EventEmitter<UploadFileItem>();
    @Output() fileUploaded = new EventEmitter<FileInfo>();

    progress: number;

    get status(): string {
        return this.file.status;
    }

    get showRetryBtn(): boolean {
        return this.status === FileUploadingStatus.Failed;
    }

    get showRemoveBtn(): boolean {
        return this.status === FileUploadingStatus.Failed
            || this.status === FileUploadingStatus.Ready
            || this.status === FileUploadingStatus.IncorrectSize
            || this.status === FileUploadingStatus.IncorrectType;
    }

    get showProgressBar(): boolean {
        return this.status === FileUploadingStatus.Uploading;
    }

    get showSuccessBtn(): boolean {
        return this.status === FileUploadingStatus.Uploaded;
    }

    get showFileSizeError(): boolean {
        return this.status === FileUploadingStatus.IncorrectSize;
    }

    get showFileTypeError(): boolean {
        return this.status === FileUploadingStatus.IncorrectType;
    }

    constructor(private _translateService: TranslateService) {
    }

    remove(e) {
        e.preventDefault();
        e.stopPropagation();

        this.onRemove.emit(this.file);
    }

    upload(): Observable<FileInfo> {
        return this.file.upload(this._handleOnProgress.bind(this))
            .pipe(
                tap({
                    next: (fileInfo: FileInfo) => {
                        this.fileUploaded.emit(fileInfo);
                    },
                    error: (e) => {
                        console.error(e);
                        this.progress = null;
                    }
                })
            );
    }

    retry(e) {
        e.preventDefault();
        e.stopPropagation();

        this.upload().subscribe({
            error: () => {

            }
        });
    }

    formatSize(size) {
        const units = ['B', 'KB', 'MB', 'GB'];

        let l = 0,
            formatSize = parseInt(size, 10) || 0;
        while (formatSize >= 1024) {
            formatSize = formatSize / 1024;
            l++;
        }
        return (formatSize.toFixed(formatSize >= 10 || l < 1 ? 0 : 1) + ' ' + units[l]);
    }

    private _handleOnProgress(value: any) {
        this.progress = Math.trunc(value.loaded / value.total * 100);
    }
}
