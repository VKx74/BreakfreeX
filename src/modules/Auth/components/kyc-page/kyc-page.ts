import {Component, Input, ViewChild} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {FormBuilder} from "@angular/forms";
import {AuthenticationService} from "@app/services/auth/auth.service";
import {AuthRoutes} from "../../auth.routes";
import {MatStepper} from "@angular/material/stepper";
import {
    PersonalAccountDocumentModel,
    PersonalInfoDocumentType,
    PersonalInformationModel,
    PersonalInfoService
} from "@app/services/personal-info/personal-info.service";
import {KYCDocumentsCompleteHandler, UserDocumentModel} from "../kyc-documents/kyc-documents.component";
import {forkJoin, Observable, of, throwError} from "rxjs";
import {HttpProgressEvent} from "@angular/common/http";
import {catchError, map, mergeMap, switchMap, tap} from "rxjs/operators";
import {FileInfo} from "@app/models/storage/models";
import {FileStorageService} from "@app/services/file-storage.service";
import {AccountType, KycModel, KycPageConfig, ResetableComponent} from "../../models/models";
import {PersonalInfoComponentCompleteHandler} from "../personal-info/personal-info.component";

export type KycPageCompleteHandler = (model: KycModel) => Observable<any>;

@Component({
    selector: 'kyc-page',
    templateUrl: 'kyc-page.html',
    styleUrls: ['kyc-page.scss'],
})
export class KycPageComponent {
    @Input() completeHandler: KycPageCompleteHandler;
    @Input() kycPageConfig: KycPageConfig;

    @ViewChild('stepper', {static: true}) stepper: MatStepper;
    @ViewChild('infoStep', {static: true}) infoStep: ResetableComponent;
    @ViewChild('documentStep', {static: true}) documentStep: ResetableComponent;

    personalInfo: PersonalInformationModel = null;
    availableDocuments: PersonalInfoDocumentType[] = [];

    get AccountType() {
        return AccountType;
    }

    constructor(private _router: Router,
                private _route: ActivatedRoute,
                private _authService: AuthenticationService,
                private _formBuilder: FormBuilder,
                private _fileStorageService: FileStorageService,
                private _personalInfoService: PersonalInfoService) {
    }

    ngOnInit() {
    }

    personalInfoCompleteHandler: PersonalInfoComponentCompleteHandler = (info: PersonalInformationModel) => {
        this.personalInfo = info;

        const kycModel: KycModel = {
            documents: [],
            information: this.personalInfo
        };

        return this.completeHandler(kycModel);

        // return this._personalInfoService.getSupportedDocumentsList(info.country)
        //     .pipe(
        //         tap((documents: PersonalInfoDocumentType[]) => {
        //             this.availableDocuments = documents.length ? documents : [1, 2, 3];
        //             this.stepper.next();
        //         })
        //     );
    }

    kycDocumentsCompleteHandler: KYCDocumentsCompleteHandler = (documents: UserDocumentModel[]) => {
        return this._uploadDocumentFiles(documents)
            .pipe(
                catchError(() => {
                    return throwError('Failed to upload documents');
                }),
                mergeMap((fileIds: string[]) => {
                    const personalInfoDocuments: PersonalAccountDocumentModel[] = documents.map((d, index) => {
                        return new PersonalAccountDocumentModel({
                            fileId: fileIds[index],
                            expiration: (this._convertLocalTimeToUTC(d.expiry.getTime())) / 1000,
                            code: d.id,
                            type: d.type
                        });
                    });

                    const kycModel: KycModel = {
                        documents: personalInfoDocuments,
                        information: this.personalInfo
                    };

                    return of(kycModel);
                }),
                switchMap((data: KycModel) => {
                    return this.completeHandler(data);
                })
            );
    }

    selectStep(step: number) {
        this.stepper.selectedIndex = step;
    }

    isStepActive(step: number): boolean {
        return this.stepper.selectedIndex === step;
    }

    isStepCompleted(step: number): boolean {
        return this.stepper.selectedIndex !== step && this.personalInfo != null;
    }

    reset() {
        this.personalInfo = null;
        this.infoStep.resetAll();
        this.documentStep.resetAll();
        this.selectStep(0);
    }

    doLogin() {
        this._router.navigate([AuthRoutes.Login], {relativeTo: this._route.parent});
    }

    private _convertLocalTimeToUTC(time: number): number {
        const dif = new Date(time).getTimezoneOffset() * 60000;
        return time - dif;
    }

    private _uploadDocumentFiles(documents: UserDocumentModel[]): Observable<string[]> {
        const fileStorage = this._fileStorageService;
        return forkJoin(documents.map((d) => {
            return fileStorage.uploadImage(FileStorageService.fileToFormData(d.file), undefined, (event: HttpProgressEvent) => {
            })
                .pipe(map((fileInfo: FileInfo) => fileInfo.id));
        }));
    }
}
