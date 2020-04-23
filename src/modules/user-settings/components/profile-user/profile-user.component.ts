import {Component, OnInit} from '@angular/core';
import {IdentityService} from "@app/services/auth/identity.service";
import {TranslateService} from "@ngx-translate/core";
import {SettingsTranslateService} from "../../../broker/localization/token";
import {UserAvatarShape} from "../../../UI/components/name-avatar/name-avatar.component";
import {FileUploaderModalComponent} from "../../../file-uploader/components/file-uploader-modal/file-uploader-modal.component";
import {FileInfo} from "@app/models/storage/models";
import {UsersProfileService} from "@app/services/users-profile.service";
import {MatDialog} from "@angular/material/dialog";
import {FileStorageService} from "@app/services/file-storage.service";
import {AppConfigService} from "@app/services/app.config.service";
import {AccountInfoModel, PersonalInfoService} from "@app/services/personal-info/personal-info.service";
import {Observable} from "rxjs";
import {tap} from "rxjs/internal/operators/tap";

interface IPersonalData {
    birthDay: number;
    country: string;
    address: string;
    city: string;
    postcode: number;
}

@Component({
    selector: 'profile-user',
    templateUrl: './profile-user.component.html',
    styleUrls: ['./profile-user.component.scss'],
    providers: [
        {
            provide: TranslateService,
            useExisting: SettingsTranslateService
        }
    ]
})
export class ProfileUserComponent implements OnInit {
    UserAvatarShape = UserAvatarShape;
    _defaultPhotoLiteral = "DefaultPhoto";
    initData$: Observable<any>;
    email: string;
    role: string;
    firstName: string;
    lastName: string;
    phone: string;
    avatarId: string;
    username: string;
    personalData: IPersonalData;

    constructor(private _identityService: IdentityService,
                private _profileService: UsersProfileService,
                private _dialog: MatDialog,
                private _fileStorageService: FileStorageService,
                private _personalInfoService: PersonalInfoService
    ) {
    }

    get currentUserId() {
        return this._identityService.id;
    }

    get currentUserFullName() {
        return this._identityService.fullName;
    }

    get avatarUrl() {
        return this.avatarId;
    }

    ngOnInit() {
        this.initData$ = this._personalInfoService.getPersonalInfo(this._identityService.id)
            .pipe(
                tap((data) => this._initPersonalData(data))
            );
        this.firstName = this._identityService.firstName;
        this.lastName = this._identityService.lastName;
        this.email = this._identityService.email;
        this.role = this._identityService.role;
        this.phone = this._identityService.phoneNumber || '';
        this.username = this._identityService.preferredUsername;
        this._profileService.getUserProfileById(this._identityService.id)
            .subscribe(
                data => {
                    if (data && data.avatarId) {
                        this.avatarId = data.avatarId;
                    }
                });
    }

    upload() {
        this._dialog.open(
            FileUploaderModalComponent,
            {
                data: {
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
                            console.log(filesInfo);
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
        );
    }

    onPhoneNumberUpdated(onUpdated: () => void) {
        if (onUpdated) {
            this._refreshAuthToken(onUpdated);
        }
    }

    private _refreshAuthToken(updatePhone: () => void) {
        this._identityService.refreshTokens().subscribe(value1 => {
            if (!this._identityService.isAuthorized) {
                location.reload();
            }
            this.phone = this._identityService.phoneNumber || '';
            updatePhone();
        }, error1 => {
            location.reload();
            this.phone = this._identityService.phoneNumber || '';
        });
    }

    handleUsernameChanged(cb: () => void) {
        this._refreshAuthToken(() => {
            // this.personalData.username = this._identityService.preferredUsername || '';
            cb();
        });
    }

    private _initPersonalData(data: AccountInfoModel) {
        this.personalData = {
            birthDay: data.personal.birthDay,
            country: data.personal.country,
            address: data.personal.address,
            city: data.personal.city,
            postcode: data.personal.postcode,
        };
    }


}
