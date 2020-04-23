import {Component, ViewChild, OnInit, Injector, Input, Inject} from '@angular/core';
import {TranslateService} from "@ngx-translate/core";
import {UploaderComponent} from "../file-uploader/file-uploader.component";
import {ImageFromCamComponent} from "../image-from-cam/image-from-cam.component";
import {
    DefaultImageEditorComponentConfig,
    IImageEditorComponentConfig,
    ImageEditorComponent, ImageEditorComponentResult
} from "../image-editor/image-editor.component";
import {JsUtil} from "../../../../utils/jsUtil";
import {AlertService} from "../../../Alert/services/alert.service";
import {FileInfo} from "@app/models/storage/models";
import {Modal} from "Shared";
import {FileUploaderTranslateService} from "../../localization/token";
import {UploadFileInputConfig} from "../upload-file-input/upload-file-input-config.token";
import {IUploadFileInputConfig} from "../upload-file-input/upload-file-input.component";
import {UploadFile} from "../../data/UploadFIle";
import {UploadFilePreviewer} from "../../data/UploadFilePreviever";


export interface IFileUploaderModal {
    uploadFileInputConfig?: IUploadFileInputConfig;
    imageEditorConfig?: IImageEditorComponentConfig;
    useEditor?: boolean;
    onFilesUploaded: (files: FileInfo[]) => any;
    files?: UploadFile[];
}

@Component({
    selector: 'file-uploader-modal',
    templateUrl: './file-uploader-modal.component.html',
    styleUrls: ['./file-uploader-modal.component.scss'],
    providers: [{
        provide: TranslateService,
        useExisting: FileUploaderTranslateService
    }]
})
export class FileUploaderModalComponent extends Modal<IFileUploaderModal, FileUploaderModalComponent>
    implements IFileUploaderModal, OnInit {

    uploadFileInputConfig: IUploadFileInputConfig;
    imageEditorConfig: IImageEditorComponentConfig;
    useEditor: boolean = false;
    onFilesUploaded: (files: FileInfo[]) => any;

    uploadBtnEnabled = false;
    fileSrc: string;

    @ViewChild(UploaderComponent, {static: false}) private _uploader: UploaderComponent;
    @ViewChild(ImageFromCamComponent, {static: false}) private _imageFromCam: ImageFromCamComponent;
    @ViewChild(ImageEditorComponent, {static: false}) private _imageEditor: ImageEditorComponent;

    progress: number;
    viewState = 'uploader';

    get showUploadBtn(): boolean {
        return this.viewState === 'uploader';
    }

    get showCroppBtn(): boolean {
        return this.viewState === 'cropImage';
    }

    get showCancelBtn(): boolean {
        return true;
    }

    get allowMultipleFiles(): boolean {
        return this.uploadFileInputConfig.allowMultipleFiles;
    }

    constructor(private _injector: Injector,
                private _translateService: TranslateService,
                private _alertService: AlertService,
                @Inject(UploadFileInputConfig) private _defaultUploadFileInputConfig: IUploadFileInputConfig) {
        super(_injector);
    }

    ngOnInit() {
        this.uploadFileInputConfig = Object.assign({}, this._defaultUploadFileInputConfig, this.data.uploadFileInputConfig || {});
        this.imageEditorConfig = Object.assign({}, DefaultImageEditorComponentConfig, this.data.imageEditorConfig || {
            viewportType: 'circle',
            width: 80,
            height: 80,
        } as IImageEditorComponentConfig, {});


        this.onFilesUploaded = this.data.onFilesUploaded;
        this.useEditor = this.data.useEditor;
    }

    ngAfterViewInit() {
        setTimeout(() => { // fix ExpressionChangedAfterItHasBeenCheckedError
            if (this.data.files) {
                this._uploader.setFiles(this.data.files);
            }
        });
    }

    handleFilesToUploadChanged(files: UploadFile[]) {
        this.uploadBtnEnabled = files.length > 0;

        if (this.useEditor && files.length === 1) {
            const previewer = new UploadFilePreviewer(this._injector);
            previewer.getPreviewImageUrl(files[0])
                .subscribe((url: string) => {
                    this._showImageEditor(url);
                });
        }
    }

    handleAllFilesUploaded(filesInfo: FileInfo[]) {
        if (this.onFilesUploaded) {
            this.onFilesUploaded(filesInfo);
        }

        this.close();
    }

    handleCroppedImage(result: ImageEditorComponentResult) {
        const file = new File([JsUtil.dataURItoBlob(result.url)], 'cropped-image.png', {type: 'image/png'});

        this._uploader.setFiles([new UploadFile(file)], false);
        this._showUploader();
        this.uploadBtnEnabled = true;
    }

    private _showImageEditor(imageUrl: string) {
        this.fileSrc = imageUrl;
        this.viewState = 'cropImage';
    }

    private _showUploader() {
        this.viewState = 'uploader';
    }

    croppImage() {
        this._imageEditor.save();
    }

    upload() {
        this.uploadBtnEnabled = false;

        if (this.allowMultipleFiles) {
            this._uploader.upload().subscribe();
        } else {
            this._uploader.upload((value) => {
                this.progress = (value.loaded / value.total) * 100;
            })
                .subscribe({
                    error: (e) => {
                        this._handleUploadingError(e);
                    }
                });
        }
    }

    private async _handleUploadingError(e: any) {
        const key = 'uploaderModal.uploadingError';
        const localization = await this._translateService.get(key).toPromise();

        this._alertService.error(localization);
        this.progress = null;
        this.uploadBtnEnabled = true;
    }
}
