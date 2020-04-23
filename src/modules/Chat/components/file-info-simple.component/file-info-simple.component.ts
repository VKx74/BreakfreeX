import {Component, EventEmitter, Input, Output} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {FileUploaderTranslateService} from 'modules/file-uploader/localization/token';
import {IFileInfo} from 'modules/Chat/models/thread';
import {FileStorageService} from '@app/services/file-storage.service';
import {UploadFile} from "../../../file-uploader/data/UploadFIle";
import {FileType} from "../../../file-uploader/data/FileType";

export interface IFileViewDetails {
    id: string;
    isImage: boolean;
}

@Component({
    selector: 'file-info-simple',
    templateUrl: 'file-info-simple.component.html',
    styleUrls: ['file-info-simple.component.scss'],
    providers: [{
        provide: TranslateService,
        useExisting: FileUploaderTranslateService
    }]
})
export class FileInfoSimpleComponent {
    private _fileId = '';
    private _multiplier: number = 1024;
    private _name: string;
    private _size: string;
    private _imageUrl: string;
    private _isClickable: boolean;

    constructor(
        private _fileservice: FileStorageService,
    ) {

    }

    @Input()
    set isChatView(value: boolean) {
        this._isClickable = value;
    }

    @Input()
    set File(value: UploadFile) {
        this._processFile(value);
    }

    @Input()
    set FileInfo(value: IFileInfo) {
        this._processFileInfo(value);
    }

    @Output() infoClick = new EventEmitter<IFileViewDetails>();

    get isImage() {
        return !!this._imageUrl;
    }

    get imageUrl() {
        return this._imageUrl;
    }

    get name() {
        return this._name;
    }

    get size(): string {
        return this._size;
    }

    _setSize(value: number) {
        let kb = value / this._multiplier;
        if (kb > 1) {
            let mb = kb / this._multiplier;
            if (mb > 1) {
                this._size = mb.toFixed(2) + ' Mb';
            } else {
                this._size = kb.toFixed(2) + ' Kb';
            }
        } else {
            this._size = value.toFixed(2) + ' bytes';
        }
    }

    get isClickable(): boolean {
        return this._isClickable;
    }

    handleClick() {
        if (this.isClickable) {
            this.infoClick.emit({
                id: this._fileId,
                isImage: this.isImage
            } as IFileViewDetails);
        }
    }

    private _processFile(file: UploadFile) {
        if (!file)
            return;
        this._name = file.fileName;
        this._setSize(file.size);

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

    private _processFileInfo(fileInfo: IFileInfo) {
        if (!fileInfo)
            return;
        this._fileId = fileInfo.id;
        this._fileservice.getFileInfo(fileInfo.id)
            .subscribe(
                data => {
                    this._setSize(data.data.size);
                    this._name = data.data.fileName;

                    if (data.data.mimeType.startsWith('image')) {
                        this._imageUrl = this._fileservice.getImageUrl(fileInfo.id);
                    }
                }
            );
    }
}
