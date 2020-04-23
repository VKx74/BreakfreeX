import {
    Component, EventEmitter, Injector, Input, Output, QueryList, ViewChild,
    ViewChildren, OnInit, Inject
} from "@angular/core";
import {
    FileUploadingStatus,
    UploadFileItem,
    UploadFileItemComponent
} from "../upload-file-item/upload-file-item.component";
import {TranslateService} from "@ngx-translate/core";
import {FileInfo} from "@app/models/storage/models";
import {FileUploaderTranslateService} from "../../localization/token";
import {
    IUploadFileInputConfig,
    UploadFileInputComponent
} from "../upload-file-input/upload-file-input.component";
import {JsUtil} from "../../../../utils/jsUtil";
import {AlertService} from "@alert/services/alert.service";
import {UploadFileInputConfig} from "../upload-file-input/upload-file-input-config.token";
import bind from "bind-decorator";
import {forkJoin, Observable, of} from "rxjs";
import {catchError, tap} from "rxjs/operators";
import {UploadFile} from "../../data/UploadFIle";


export interface IFileUploaderConfig {
}

@Component({
    selector: 'uploader',
    templateUrl: 'file-uploader.component.html',
    styleUrls: ['file-uploader.component.scss'],
    providers: [{
        provide: TranslateService,
        useExisting: FileUploaderTranslateService
    }]
})
export class UploaderComponent implements OnInit {
    @Input() uploadFileInputConfig: IUploadFileInputConfig;
    @Input() config: IFileUploaderConfig;
    @Output() onFilesChanged = new EventEmitter<UploadFile[]>();
    @Output() onAllFilesUploaded = new EventEmitter<FileInfo[]>();

    @ViewChild(UploadFileInputComponent, {static: false}) uploadFileInput: UploadFileInputComponent;
    @ViewChildren(UploadFileItemComponent) uploadFileItemComponents: QueryList<UploadFileItemComponent>;

    uploadFileItems: UploadFileItem[] = [];
    private _uploadedFiles: FileInfo[] = [];

    get allowMultipleFiles(): boolean {
        return this.uploadFileInputConfig.allowMultipleFiles;
    }

    get showFileInfo(): boolean {
        return false;

        // return !this.config.allowMultipleFiles && this.files.length === 1 && this.files[0].type === FileType.File;
    }

    constructor(private _injector: Injector,
                private _alertService: AlertService,
                @Inject(UploadFileInputConfig) private _defaultUploadFileInputConfig: IUploadFileInputConfig) {
    }

    ngOnInit() {
        this.uploadFileInputConfig = Object.assign({}, this._defaultUploadFileInputConfig, this.uploadFileInputConfig);
    }

    @bind
    onFilesSelected(files: UploadFile[]) {
        this.setFiles(JsUtil.flattenArray([files]));
    }

    upload(process?: any): Observable<any> {
        if (this.allowMultipleFiles) {
            return forkJoin(
                this.uploadFileItemComponents.map((item) => {
                    return item.upload()
                        .pipe(
                            catchError(() => of(null))
                        );
                })
            ).pipe(
                tap((filesInfo: FileInfo[]) => {
                    if (filesInfo.every(f => f != null)) {
                        this.onAllFilesUploaded.emit(filesInfo);
                    }
                })
            );
        } else {
            return this.uploadFileItems[0].upload(process)
                .pipe(
                    tap((fileInfo: FileInfo) => {
                        this.onAllFilesUploaded.emit([fileInfo]);
                    })
                );
        }
    }

    handleUploadItemUploaded(fileInfo: FileInfo) {
        this._uploadedFiles.push(fileInfo);

        if (this._uploadedFiles.length === this.uploadFileItems.length) {
            this.onAllFilesUploaded.emit(this._uploadedFiles);
        }
    }

    setFiles(files: UploadFile[], fire: boolean = true) {
        this._uploadedFiles = [];

        if (files && files.length) {
            const uploadFileItems = files.map((f) => {
                const uploadFileItem = new UploadFileItem(f, this._injector);
                uploadFileItem.status = FileUploadingStatus.Ready;

                return uploadFileItem;
            });

            this.uploadFileItems = uploadFileItems;

            if (fire) {
                this.onFilesChanged.emit(files);
            }
        }
    }

    removeFile(file: UploadFileItem) {
        const index = this.uploadFileItems.indexOf(file);

        if (index !== -1) {
            this.uploadFileItems.splice(index, 1);
            this.onFilesChanged.emit(this.uploadFileItems.map(f => f.uploadFile));

            if (this.uploadFileItems.length === 0) {
                this.uploadFileInput.clear();
            }

            if (this.uploadFileItems.length && this.uploadFileItems.length === this._uploadedFiles.length) {
                this.onAllFilesUploaded.emit(this._uploadedFiles);
            }
        }
    }
}
