import {Modal} from 'Shared';
import {Component, ElementRef, Injector, ViewChild} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {FileUploaderTranslateService} from 'modules/file-uploader/localization/token';
import {UploaderComponent} from '../../../file-uploader/components/file-uploader/file-uploader.component';
import {FileInfo} from '@app/models/storage/models';
import {FileStorageService} from '@app/services/file-storage.service';
import {IFileViewDetails} from '../file-info-simple.component/file-info-simple.component';
import bind from "bind-decorator";
import {UploadFile} from "../../../file-uploader/data/UploadFIle";
import {IUploadFileInputConfig} from "../../../file-uploader/components/upload-file-input/upload-file-input.component";
import {FileType} from "../../../file-uploader/data/FileType";

export interface IChatFileUploaderConfig {
    file: UploadFile;
    fileInfo: FileInfo;
    caption: string;
    viewDetails: IFileViewDetails;
    onFileUploaded?: (file: FileInfo, caption: string) => any;
}

@Component({
    selector: 'chat-file-uploader',
    templateUrl: 'chat-file-uploader.component.html',
    styleUrls: ['chat-file-uploader.component.scss'],
    providers: [{
        provide: TranslateService,
        useExisting: FileUploaderTranslateService
    }]
})
export class ChatFileUploaderComponent extends Modal<IChatFileUploaderConfig, ChatFileUploaderComponent> {

    private _localImageUrl = "";
    private _file: UploadFile;
    private _fileInfo: FileInfo;
    private _imageUrl: string;
    private _isReadOnly: boolean = false;

    @ViewChild(UploaderComponent, {static: false}) private _uploader: UploaderComponent;
    @ViewChild('messageInput', {static: false}) public input: ElementRef;

    uploadFileInputConfig: IUploadFileInputConfig = {
        allowMultipleFiles: false
    };

    constructor(private _injector: Injector,
                private _fileservice: FileStorageService,
                private _translateService: TranslateService) {
        super(_injector);

        if (this.data.viewDetails) {
            this._processViewDetails(this.data.viewDetails);
        } else if (this.data.file) {
            this.File = this.data.file;
            // this.uploadFile = new UploadFile(this.data.file, _injector);
        } else if (this.data.fileInfo) {
            this.FileInfo = this.data.fileInfo;
        }
        if (this.data.caption)
            this.captionValue = this.data.caption;

    }

    viewState = 'uploader';
    progress: number;
    uploadBtnEnabled = true;
    // uploadFile: UploadFile;
    captionValue: string = '';

    public addEmoji(emoji: string) {

        const element = this.input.nativeElement;
        element.focus();
        this.captionValue =
            this.captionValue.substring(0, element.selectionStart) +
            emoji +
            this.captionValue.substring(element.selectionStart, this.captionValue.length);
    }

    get isImage() {
        return !!this._imageUrl;
    }

    get imageUrl() {
        return this._imageUrl;
    }

    get File(): UploadFile {
        return this._file;
    }

    set File(value: UploadFile) {
        this._file = value;
        this._checkFile(value);
    }

    get FileInfo(): FileInfo {
        return this._fileInfo;
    }

    set FileInfo(value: FileInfo) {
        this._fileInfo = value;
        this._checkFileInfo(value);
    }

    get isReadOnly(): boolean {
        return this._isReadOnly;
    }

    get title() {
        if (this.data.viewDetails) {
            return this._translateService.get("file.preview");
        } else if (this.data.fileInfo) {
            return this._translateService.get("file.editTitle");
        } else {
            return this._translateService.get("file.uploadTitle");
        }
    }

    private _processViewDetails(value: IFileViewDetails) {
        if (value && value.isImage) {
            this._imageUrl = this._fileservice.getImageUrl(value.id);
            this._isReadOnly = true;
        }
    }

    private _checkFile(file: UploadFile) {
        if (!file)
            return;

        if (file.type === FileType.Image) {
            let reader = new FileReader();
            reader.onloadend = () => {
                this._imageUrl = reader.result as string;
            };
            reader.readAsDataURL(file.file);
        } else {
            this._imageUrl = null;
        }
    }

    private _checkFileInfo(fileInfo: FileInfo) {
        if (!fileInfo)
            return;
        // this._fileId = fileInfo.id;
        this._fileservice.getFileInfo(fileInfo.id)
            .subscribe(
                data => {
                    if (data.data.mimeType.startsWith('image')) {
                        this._imageUrl = this._fileservice.getImageUrl(fileInfo.id);
                    }
                }
            );
    }

    @bind
    public handleNewFile(files: UploadFile[]) {
        this.File = files[0];
    }

    download() {
        window.open(this.imageUrl);
    }

    async upload() {
        if (this.isReadOnly)
            this.close();
        this.uploadBtnEnabled = false;

        try {
            if (this._file) {
                this._fileservice.uploadFile(this._file, undefined, (value) => this.progress = (value.loaded / value.total) * 100)
                    .subscribe({
                        next: (fileInfo: FileInfo) => {
                            this.data.onFileUploaded(fileInfo, this.captionValue);
                            this.close();
                        },
                        error: (e) => {
                            console.error(e);
                            this.uploadBtnEnabled = true;
                        }
                    });
            } else {
                if (this.FileInfo) {
                    this.data.onFileUploaded(this.FileInfo, this.captionValue);
                    this.close();
                }
            }
        } catch (e) {
            console.log("error", e);
        }
    }
}
