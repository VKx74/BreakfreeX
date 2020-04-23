import {Component, Injector, OnInit} from '@angular/core';
import {Modal} from "Shared";
import {TranslateService} from "@ngx-translate/core";
import {ChatTranslateService} from "../../localization/token";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {Observable} from "rxjs";
import {IUploadFileInputConfig} from "@file-uploader/components/upload-file-input/upload-file-input.component";
import bind from "bind-decorator";
import {UploadFile} from "@file-uploader/data/UploadFIle";
import {JsUtil} from "../../../../utils/jsUtil";
import {MatDialog} from "@angular/material/dialog";
import {
    IImageEditorModalConfig,
    ImageEditorModalComponent
} from "@file-uploader/components/image-editor-modal/image-editor-modal.component";
import {DomSanitizer} from "@angular/platform-browser";
import {
    DefaultImageEditorComponentConfig,
    IImageEditorComponentConfig
} from "@file-uploader/components/image-editor/image-editor.component";

export type ThreadConfiguratorSubmitHandler = (result: ThreadConfiguratorComponentResult) => Observable<boolean>; // close modal

export interface ThreadConfiguratorComponentConfig {
    name?: string;
    description?: string;
    photoUrl?: string;
    submitHandler: ThreadConfiguratorSubmitHandler;
}

export interface ThreadConfiguratorComponentResult {
    name: string;
    description?: string;
    photo?: File;
}

@Component({
    selector: 'create-thread',
    templateUrl: './thread-configurator.component.html',
    styleUrls: ['./thread-configurator.component.scss'],
    providers: [
        {
            provide: TranslateService,
            useExisting: ChatTranslateService
        }
    ]
})
export class ThreadConfiguratorComponent extends Modal<ThreadConfiguratorComponentConfig> implements OnInit {
    fileInputConfig: IUploadFileInputConfig = {
        maxSizeMb: 5,
        allowedFiles: ['image/*'],
        allowMultipleFiles: false
    };

    photo: File;
    photoUrl: string;
    initialPhoto: File;
    processing: boolean = false;
    threadGroupForm: FormGroup;

    constructor(private _injector: Injector,
                private _fb: FormBuilder,
                private _dialog: MatDialog,
                private _sanitizer: DomSanitizer) {
        super(_injector);
    }

    get isEdit(): boolean {
        return this.data.name != null;
    }

    get name(): string {
        return this.isEdit ? this.data.name : '';
    }

    get description(): string {
        return this.isEdit ? this.data.description : '';
    }

    get formValue() {
        return this.threadGroupForm.value;
    }

    ngOnInit() {
        this.threadGroupForm = this.getThreadGroupForm();

        if (this.data.photoUrl) {
            JsUtil.imageUrlToFile(this.data.photoUrl, 'file.png')
                .subscribe((file: File) => {
                    if (file) {
                        this.handlePhotoFile(file);
                        this.initialPhoto = file;
                    }
                });
        }
    }

    getThreadGroupForm(): FormGroup {
        return this._fb.group({
            name: [this.name, [Validators.required, Validators.minLength(3), Validators.maxLength(35)]],
            description: [this.description, [Validators.minLength(3), Validators.maxLength(100)]]
        });
    }

    submit() {
        const result = {
            ...this.formValue,
            photo: this.isEdit && this.photo === this.initialPhoto // photo not changed
                ? undefined
                : this.photo || undefined
        } as ThreadConfiguratorComponentResult;

        this.processing = true;
        this.data.submitHandler(result)
            .subscribe({
                next: (closeModal: boolean = true) => {
                    this.processing = false;

                    if (closeModal !== false) {
                        this.close(result);
                    }
                },
                error: (e) => {
                    this.processing = false;
                }
            });
    }

    @bind
    onFilesSelected(files: UploadFile[]) {
        if (!files) {
            return;
        }

        this._dialog.open(ImageEditorModalComponent, {
            data: {
                imageEditorConfig: Object.assign({}, DefaultImageEditorComponentConfig, {
                    height: 110,
                    width: 110
                } as Partial<IImageEditorComponentConfig>),
                file: files[0].file,
                submitHandler: (editedFile: File) => {
                    this.handlePhotoFile(editedFile);
                }
            } as IImageEditorModalConfig
        });
    }

    handlePhotoFile(file: File) {
        this.photo = file;

        JsUtil.fileToDataURI(file)
            .subscribe((url) => {
                this.photoUrl = this._sanitizer.bypassSecurityTrustUrl(url) as string;
            });
    }
}
