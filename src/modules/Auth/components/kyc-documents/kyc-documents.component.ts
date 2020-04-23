import {Component, ElementRef, Input, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {PersonalInfoDocumentType} from "@app/services/personal-info/personal-info.service";
import {BehaviorSubject, combineLatest, Observable} from "rxjs";
import {takeUntil} from "rxjs/operators";
import {componentDestroyed} from "@w11k/ngx-componentdestroyed";
import {PersonalInfoHelper} from "@app/services/personal-info/personal-info-helper.service";
import {ResetableComponent} from "../../models/models";
import {TouchedControlErrorStateMatcher} from "@app/Utils/touchedControlErrorStateMatcher";

export class UserDocumentModel {
    public file: File;
    public type: PersonalInfoDocumentType;
    public id: string;
    public expiry: Date;
}

const FileMIMETypes = [
    'image/jpeg',
    'image/pjpeg',
    'image/png'
];

const FileMaxSize = 5242880;

export type KYCDocumentsCompleteHandler = (documents: UserDocumentModel[]) => Observable<any>;

@Component({
    selector: 'kyc-documents',
    templateUrl: './kyc-documents.component.html',
    styleUrls: ['./kyc-documents.component.scss']
})
export class KycDocumentsComponent implements ResetableComponent {
    @Input() completeHandler: KYCDocumentsCompleteHandler;
    errorNotification: string;
    processing: boolean;

    formGroup: FormGroup;
    requiredDocumentCount: number = 2;

    allDocumentTypes$ = new BehaviorSubject<PersonalInfoDocumentType[]>([]);
    addedDocuments$ = new BehaviorSubject<UserDocumentModel[]>([]);
    allowedDocumentTypes$ = new BehaviorSubject<PersonalInfoDocumentType[]>([]);
    errorMatcher = new TouchedControlErrorStateMatcher();


    @Input() set availableDocuments(documents: PersonalInfoDocumentType[]) {
        if (this._isSupportedDocumentsListChanged(this.allDocumentTypes$.getValue(), documents)) {

            this.requiredDocumentCount = documents.length > 1 ? 2 : 1;

            this.addedDocuments$.next([]);
            this.allDocumentTypes$.next(documents);
        }
    }

    @ViewChild('file', {static: true}) fileInput: ElementRef;

    constructor(private _formBuilder: FormBuilder,
                private _personalInfoHelper: PersonalInfoHelper) {

        this.formGroup = this._formBuilder.group({
            file: new FormControl('', [Validators.required]),
            type: new FormControl({
                value: '',
                disabled: this.allowedDocumentTypes$.getValue().length < 2
            }, [Validators.required]),
            id: new FormControl('', [Validators.required, Validators.minLength(6), Validators.maxLength(20)]),
            expiry: new FormControl('', [Validators.required])
        });
    }

    documentCaption = (documentType: PersonalInfoDocumentType) => {
        return `${this.getDocumentName(documentType)}`;
    }

    getDocumentName(documentType: PersonalInfoDocumentType): string {
        return this._personalInfoHelper.getPersonalInfoDocumentName(documentType);
    }

    ngOnInit() {
        combineLatest(
            this.allDocumentTypes$,
            this.addedDocuments$
        ).subscribe(([documentTypes, addedDocuments]: [PersonalInfoDocumentType[], UserDocumentModel[]]) => {
            const allowedDocumentTypes = documentTypes.filter((type) => {
                return addedDocuments.map(d => d.type).indexOf(type) === -1;
            });

            this.allowedDocumentTypes$.next(allowedDocumentTypes);
        });

        this.allowedDocumentTypes$
            .pipe(takeUntil(componentDestroyed(this)))
            .subscribe((allowedTypes: PersonalInfoDocumentType[]) => {
                this._refreshDocumentForm(allowedTypes);
            });
    }

    addDocument() {
        const formControls = this.formGroup.controls;
        const model: UserDocumentModel = {
            file: this.fileInput.nativeElement.files[0],
            type: formControls['type'].value,
            id: formControls['id'].value,
            expiry: formControls['expiry'].value
        };

        this.addedDocuments$.next([].concat(this.addedDocuments$.getValue(), model));
    }

    validateFileToUpload(file: File) {
        if (!file) return;
        this.errorNotification = null;
        if (!FileMIMETypes.includes(file.type)) {
            this.errorNotification = 'Type of file has to be .png, .jpeg or .pjpeg';
            this.formGroup.controls['file'].reset();
            return;
        }

        if (file.size >= FileMaxSize) {
            this.errorNotification = 'Size of file has to be less than 5MB';
            this.formGroup.controls['file'].reset();
            return;
        }

        return;

    }

    removeDocument(document: UserDocumentModel) {
        this.addedDocuments$.next(this.addedDocuments$.getValue().filter(doc => doc !== document));
    }

    sendDocuments() {
        this.processing = true;
        this.completeHandler(this.addedDocuments$.getValue())
            .subscribe({
                next: () => {
                    this.processing = false;
                    this.addedDocuments$.next([]);
                },
                error: (e) => {
                    this.errorNotification = e;
                    this.processing = false;
                }
            });
    }

    isProgress50(): boolean {
        return this.requiredDocumentCount / this.addedDocuments$.getValue().length === 2;
    }

    isProgress100(): boolean {
        return this.requiredDocumentCount === this.addedDocuments$.getValue().length;
    }

    resetAll() {
        this.addedDocuments$.next([]);
        this.errorNotification = null;
        this.formGroup.reset();
    }

    ngOnDestroy() {

    }

    private _isSupportedDocumentsListChanged(oldList: PersonalInfoDocumentType[], newList: PersonalInfoDocumentType[]): boolean {
        if (newList && newList.length === oldList.length) {
            if (newList.every(doc => oldList.includes(doc))) {
                return false;
            }
        }

        return true;
    }

    private _refreshDocumentForm(allowedDocumentTypes: PersonalInfoDocumentType[]) {
        const addedDocumentCount = this.addedDocuments$.getValue().length;
        const formGroup = this.formGroup;
        const formControls = formGroup.controls;
        formControls['type'].reset(allowedDocumentTypes[0]);
        formControls['file'].reset();
        formControls['id'].reset();
        formControls['expiry'].reset();

        if (allowedDocumentTypes.length === 0 || this.requiredDocumentCount === addedDocumentCount) {
            formGroup.disable();
        } else {
            formGroup.enable();
        }
    }
}
