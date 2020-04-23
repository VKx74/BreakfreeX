import {Component, OnInit, ViewChild} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {
    BusinessAccountDocumentModel,
    PersonalAccountDocumentModel,
    PersonalInfoService,
    RegisterBusinessAccountDTOModel,
    RegisterBusinessAccountDTOModelConfig
} from "@app/services/personal-info/personal-info.service";
import {AuthRoutes} from "../../auth.routes";
import {ActivatedRoute, Router} from "@angular/router";
import {first, switchMap} from "rxjs/operators";
import {FormGroupComponent} from "../company-info/company-info.component";
import {AccountType, BusinessRegistrationStep, DirectorFullName, KycModel, KycPageConfig} from "../../models/models";
import {KycPageCompleteHandler, KycPageComponent} from "../kyc-page/kyc-page";
import {of} from "rxjs";

@Component({
    selector: 'business-account-register-page',
    templateUrl: './business-account-register-page.component.html',
    styleUrls: ['./business-account-register-page.component.scss']
})
export class BusinessAccountRegisterPageComponent implements OnInit {
    registerBusinessAccountModel: RegisterBusinessAccountDTOModel;
    registerFormGroup: FormGroup;
    registeredUserEmail: string = '';
    registrationStep = BusinessRegistrationStep.CompanyInfo;

    director1: DirectorFullName;
    director2: DirectorFullName;

    businessTypes: string[];

    errorNotification: string;
    processing: boolean;

    kycPageConfig: KycPageConfig;

    @ViewChild('companyInfo', {static: false}) companyInfo: FormGroupComponent;
    @ViewChild(KycPageComponent, {static: false}) kycPage: KycPageComponent;

    get BusinessRegistrationStep() {
        return BusinessRegistrationStep;
    }

    constructor(private _personalInfoService: PersonalInfoService,
                private _router: Router,
                private _route: ActivatedRoute) {
    }

    ngOnInit() {
        this._route.queryParams
            .pipe(first())
            .subscribe(params => {
                if (params['email']) {
                    this.registeredUserEmail = params['email'];
                }
            });
        this.registerFormGroup = this._getFormGroup();
        this._initBusinessTypesList();
    }

    onCompanyInfoFilled() {
        const company = this.companyInfo.getFormData();
        const controls = this.registerFormGroup.controls;
        const model: RegisterBusinessAccountDTOModelConfig = {
            userEmail: this.registeredUserEmail,
            email: company.email,
            companyName: company.companyName,
            firstName: company.firstName,
            lastName: company.lastName,
            phoneNumber: company.phone,
            roleAtCompany: company.roleAtCompany,
            companyLocation: [company.country, company.city].join(', '),
            companyAddress: company.address,
            registeredCompanyNumber: company.companyNumber,
            businessType: controls['businessType'].value,
            numberOfEmployers: company.employersCount,
            website: company.website,
            documents: []
        };

        this.registerBusinessAccountModel = new RegisterBusinessAccountDTOModel(model);
        this.registrationStep = BusinessRegistrationStep.Director1Kyc;
        this.kycPageConfig = {
            type: AccountType.Business,
            data: [company.director1Name, company.director1LastName]
        };

        this.director1 = {
            firstName: company.director1Name,
            lastName: company.director1LastName,
        };

        if (company.director2Name && company.director2LastName) {
            this.director2 = {
                firstName: company.director2Name,
                lastName: company.director2LastName,
            };
        }
    }

    kycPageCompleteHandler: KycPageCompleteHandler = (kycModel: KycModel) => {
        const information = kycModel.information;

        if (this.registrationStep === BusinessRegistrationStep.Director1Kyc) {
            this.registerBusinessAccountModel.director1 = information;
            this.registerBusinessAccountModel.documents.push(...this._getDirectorDocuments(kycModel.documents, this.director1));

            if (this.director2) {
                this.kycPageConfig = {
                    type: AccountType.Business,
                    data: [this.director2.firstName, this.director2.lastName]
                };

                this.registrationStep = BusinessRegistrationStep.Director2Kyc;
                this.kycPage.reset();

                return of(null);
            }
        } else {
            this.registerBusinessAccountModel.director2 = information;
            this.registerBusinessAccountModel.documents.push(...this._getDirectorDocuments(kycModel.documents, this.director2));
        }

        this.doRegistration();

        return of(null);
    }

    doRegistration() {
        this.processing = true;
        this.errorNotification = null;
        this.registrationStep = BusinessRegistrationStep.CompanyInfo;
        this._personalInfoService.registerBusinessAccount(this.registerBusinessAccountModel)
            .pipe(
                switchMap(() => {
                    return of(this._router.navigate([AuthRoutes.Login], {
                        relativeTo: this._route.parent,
                        queryParams: {infoFilled: true}
                    }));
                })
            )
            .subscribe(() => {
                this.processing = false;
            }, e => {
                this.processing = false;
                this.errorNotification = e.error.description || e.error;
            });
    }

    doLogin() {
        this._router.navigate([AuthRoutes.Login], {relativeTo: this._route.parent});
    }

    private _getDirectorDocuments(documents: PersonalAccountDocumentModel[], director): BusinessAccountDocumentModel[] {
        return documents.map((d: PersonalAccountDocumentModel): BusinessAccountDocumentModel => {
            return Object.assign({}, d, {
                firstName: director.firstName,
                lastName: director.lastName
            });
        });
    }

    private _getFormGroup() {
        return new FormGroup({
            businessType: new FormControl('', [Validators.required]),
        });
    }

    private _initBusinessTypesList() {
        this._personalInfoService.getBusinessTypesList()
            .subscribe(types => {
                this.businessTypes = types;
                this.registerFormGroup.controls['businessType'].setValue(this.businessTypes[0]);
            }, e => {
                console.log(e);
            });
    }
}
