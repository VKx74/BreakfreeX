import {Component, Injector} from "@angular/core";
import {ActivatedRoute} from "@angular/router";
import {
    AccountInfoModel,
    BusinessAccountDocumentModel,
    PersonalInfoService,
    PersonalInfoStatus
} from "@app/services/personal-info/personal-info.service";
import {PersonalInfoHelper} from "@app/services/personal-info/personal-info-helper.service";
import {forkJoin, Observable, of} from "rxjs";
import {catchError, map, mergeMap, tap} from "rxjs/operators";
import {AlertService} from "../../../Alert/services/alert.service";
import {Modal} from "Shared";
import {Roles, UserModel} from "@app/models/auth/auth.models";
import {FileStorageService} from "@app/services/file-storage.service";
import {DomSanitizer} from "@angular/platform-browser";
import {AccountType} from "../../../Auth/models/models";
import {UsersProfileService} from "@app/services/users-profile.service";
import bind from "bind-decorator";
import {TranslateService} from "@ngx-translate/core";
import {SharedTranslateService} from "@app/localization/shared.token";

export interface AppMemberInfoComponentConfig {
    user: UserModel;
    statusChangeHandler: (status: PersonalInfoStatus) => void;
}

export interface DocumentsUrls {
    [documentId: string]: string;
}

export interface IPersonalInfoData {
    personalInfo: AccountInfoModel;
    documentsUrls: DocumentsUrls;
}

@Component({
    selector: 'app-member-info',
    templateUrl: 'app-member-info.component.html',
    styleUrls: ['app-member-info.component.scss'],
    providers: [
        {
            provide: TranslateService,
            useExisting: SharedTranslateService
        }
    ]
})
export class AppMemberInfoComponent extends Modal<AppMemberInfoComponentConfig, PersonalInfoStatus> {
    $initObs: Observable<any>;
    avatarId: string;
    personalInfoData: IPersonalInfoData;

    get personalInfo(): AccountInfoModel {
        return this.personalInfoData.personalInfo;
    }

    get Roles() {
        return Roles;
    }

    get user(): UserModel {
        return this.data.user;
    }

    get AccountType() {
        return AccountType;
    }


    constructor(_injector: Injector,
                private _route: ActivatedRoute,
                private _domSanitizer: DomSanitizer,
                private _personalInfoHelper: PersonalInfoHelper,
                private _personalInfoService: PersonalInfoService,
                private _fileStorageService: FileStorageService,
                private _usersProfileService: UsersProfileService,
                private _alertService: AlertService) {
        super(_injector);
    }

    ngOnInit() {
        this.$initObs = forkJoin(
            this._getPersonalInfoData(this.user.id)
                .pipe(tap({
                    next: (data: IPersonalInfoData) => {
                        this.personalInfoData = data;
                    },
                    error: (e) => {
                        console.error(e);
                        this.close();
                    }
                })),
            this._usersProfileService.getUserProfileById(this.user.id)
                .pipe(
                    tap((userProfileModel) => {
                        this.avatarId = userProfileModel.avatarId;
                    }),
                    catchError((e) => {
                        console.error(e);
                        this.avatarId = '';

                        return of(null);
                    })
                )
        );
    }

    getPersonalInfoStatusStr(): Observable<string> {
        return this._personalInfoHelper.getPersonalInfoStatusStr(this.personalInfo.status);
    }

    getPersonalInfoStatusClass(status: PersonalInfoStatus): string {
        const statusToClass = {
            [PersonalInfoStatus.Approve]: 'crypto-color-green',
            [PersonalInfoStatus.Pending]: 'crypto-color-yellow',
            [PersonalInfoStatus.Rejected]: 'crypto-color-red',
            [PersonalInfoStatus.None]: ''
        };

        return statusToClass[status];
    }

    @bind
    rejectHandler(reasonMessage: string) {
        return this._personalInfoService.rejectPersonalInfo(this.personalInfo.id, reasonMessage)
            .pipe(
                tap(() => {
                    this.personalInfo.status = PersonalInfoStatus.Rejected;
                    this.data.statusChangeHandler(PersonalInfoStatus.Rejected);
                }),
                catchError((e) => {
                    console.error(e);
                    this._alertService.error('Failed to reject personal info');

                    return of(null);
                })
            );
    }

    @bind
    approveHandler() {
        return this._personalInfoService.approvePersonalInfo(this.personalInfo.id)
            .pipe(
                tap(() => {
                    this.personalInfo.status = PersonalInfoStatus.Approve;
                    this.data.statusChangeHandler(PersonalInfoStatus.Approve);
                }),
                catchError((e) => {
                    console.error(e);
                    this._alertService.error('Failed to accept personal info');

                    return of(null);
                })
            );
    }

    private _getPersonalInfoData(userId: string): Observable<IPersonalInfoData> {
        return this._personalInfoService.getPersonalInfo(userId)
            .pipe(
                mergeMap((info: AccountInfoModel) => {
                    return forkJoin([
                        of(info),
                        this._getDocumentsUrls(info.documents)
                    ]);
                }),
                map(([info, documentsUrls]: [AccountInfoModel, DocumentsUrls]) => {
                    return {
                        personalInfo: info,
                        documentsUrls: documentsUrls
                    };
                })
            );
    }

    private _getDocumentsUrls(documents: BusinessAccountDocumentModel[]): Observable<DocumentsUrls> {
        const documentsUrls: DocumentsUrls = {};

        if (!documents || documents.length === 0) {
            return of({});
        }

        return forkJoin(
            documents.map(d => {
                return this._fileStorageService.getFileObjectUrl(d.fileId)
                    .pipe(
                        tap((objectUrl: string) => {
                            documentsUrls[d.fileId] = objectUrl;
                        })
                    );
            })
        )
            .pipe(
                map(() => documentsUrls)
            );
    }

    ngOnDestroy() {
    }
}
