import {Component, Injector, OnInit} from '@angular/core';
import {Modal} from "Shared";
import {TranslateService} from "@ngx-translate/core";
import {ChatTranslateService} from "../../../Chat/localization/token";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {IThread, IThreadCreate, IThreadUpdate} from "../../../Chat/models/thread";
import {FileUploaderModalComponent} from "../../../file-uploader/components/file-uploader-modal/file-uploader-modal.component";
import {FileInfo} from "@app/models/storage/models";
import {UsersProfileService} from "@app/services/users-profile.service";
import {FileStorageService} from "@app/services/file-storage.service";
import {MatDialog} from "@angular/material/dialog";
import {IdentityService} from "@app/services/auth/identity.service";

export type CreateThreadDialogData = IThreadCreate | IThreadUpdate;

@Component({
    selector: 'create-thread',
    templateUrl: './create-thread.component.html',
    styleUrls: ['./create-thread.component.scss'],
    providers: [
        {
            provide: TranslateService,
            useExisting: ChatTranslateService
        }
    ]
})
export class CreateThreadComponent extends Modal<IThread, CreateThreadDialogData> implements OnInit {
    private _defaultPhotoLiteral = "DefaultPhoto";
    threadGroupForm: FormGroup;
    avatarId: string = this._defaultPhotoLiteral;

    constructor(private _injector: Injector,
                private _profileService: UsersProfileService,
                private _fileStorageService: FileStorageService,
                private _dialog: MatDialog,
                private _identityService: IdentityService,
                public ts: TranslateService,
                private _fb: FormBuilder) {
        super(_injector);
    }

    get isEdit(): boolean {
        return !!this.data;
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
    }

    getThreadGroupForm(): FormGroup {
        return this._fb.group({
            name: [this.name, [Validators.required, Validators.minLength(2), Validators.maxLength(35)]],
            description: [this.description, [Validators.minLength(2), Validators.maxLength(100)]]
        });
    }

    submit() {
        if (this.threadGroupForm.valid) {
            this.close(this.formValue);
        }
    }

    // TODO: Implement image upload
    upload() {
        this._dialog.open(
            FileUploaderModalComponent,
            {
                data: {
                    config: {
                        uploader: {
                            allowedFiles: ['image/*'],
                            maxFileSizeMb: 5,
                            allowMultipleFiles: false
                        },
                        imageEditor: {
                            viewportType: 'circle',
                            height: 150,
                            width: 150
                        },
                        useEditor: true,
                        onFilesUploaded: ((filesInfo: FileInfo[]) => {
                            let fileId = filesInfo[0].id;
                            this._profileService.patchUserAvatar(this._identityService.id, fileId)
                                .subscribe(data => {
                                    if (this.avatarId !== this._defaultPhotoLiteral)
                                        this._fileStorageService.deleteFile(this.avatarId);
                                    this.avatarId = fileId;
                                });
                            console.log('uploaded', filesInfo);
                        })
                    }
                }
            }
        );
    }

}
