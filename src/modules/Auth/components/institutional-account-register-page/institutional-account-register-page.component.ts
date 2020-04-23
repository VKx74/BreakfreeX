import {Component, OnInit, ViewChild} from '@angular/core';
import {
    BusinessAccountDocumentModel,
    PersonalAccountDocumentModel,
    PersonalInfoService,
    RegisterInstitutionalAccountDTOModel,
    RegisterInstitutionalAccountDTOModelConfig
} from "@app/services/personal-info/personal-info.service";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {FormGroupComponent} from "../company-info/company-info.component";
import {ActivatedRoute, Router} from "@angular/router";
import {first, switchMap} from "rxjs/operators";
import {AuthRoutes} from "../../auth.routes";
import {
    AccountType,
    BusinessRegistrationStep,
    DirectorFullName,
    KycModel,
    KycPageConfig,
    StrategyMix
} from "../../models/models";
import {integerNumberValidator} from "Validators";
import {check100PercentValidator} from "../../../Validators/check-100-percent.validator";
import {TzUtils} from "TimeZones";
import {KycPageCompleteHandler, KycPageComponent} from "../kyc-page/kyc-page";
import {of} from "rxjs";

enum EStrategyMixParts  {
    Arbitrage = 'Arbitrage',
    BuyHold = 'Buy & Hold',
    PriceMomentum = 'Price momentum',
    DrivenModels = 'Value driven models',
    EtfIndexWeighting = 'ETF/Index weighting',
    Derivaives = 'Derivaives',
    Other = 'Other'
}

@Component({
    selector: 'institutional-account-register-page',
    templateUrl: './institutional-account-register-page.component.html',
    styleUrls: ['./institutional-account-register-page.component.scss']
})
export class InstitutionalAccountRegisterPageComponent implements OnInit {
    registerInstitutionalAccountModel: RegisterInstitutionalAccountDTOModel;
    registerFormGroup: FormGroup;
    registeredUserEmail: string = '';
    registrationStep = BusinessRegistrationStep.CompanyInfo;

    director1: DirectorFullName;
    director2: DirectorFullName;

    businessTypes: string[];
    companyFunds: string[];
    cryptoBalances: string[];

    errorNotification: string;
    processing: boolean;

    kycPageConfig: KycPageConfig;

    strategyMixParts = EStrategyMixParts;

    @ViewChild('companyInfo', {static: false}) companyInfo: FormGroupComponent;
    @ViewChild(KycPageComponent, {static: false}) kycPage: KycPageComponent;

    get BusinessRegistrationStep() {
        return BusinessRegistrationStep;
    }

    constructor(private _personalInfoService: PersonalInfoService,
                private _router: Router,
                private _formBuilder: FormBuilder,
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
        this._initCompanyFundsList();
        this._initCryptoBalancesList();
    }

    onCompanyInfoFilled() {
        const company = this.companyInfo.getFormData();
        const controls = this.registerFormGroup.controls;
        const strategyMix: StrategyMix = {
            arbitrage: controls['strategyArbitrage'].value,
            buyAndHold: controls['strategyBuyHold'].value,
            priceMomentum: controls['strategyPriceMomentum'].value,
            valueDrivenModels: controls['strategyDrivenModels'].value,
            etfIndexWeighting: controls['strategyEtfIndexWeighting'].value,
            derivaives: controls['strategyDerivaives'].value,
            other: controls['strategyOther'].value
        };
        const model: RegisterInstitutionalAccountDTOModelConfig = {
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
            numberOfEmployers: company.employersCount,
            website: company.website,
            businessType: controls['businessType'].value,
            companyFunds: controls['companyFunds'].value,
            anticipatedCryptoFunds: controls['cryptoFunds'].value,
            anticipatedAverageCryptoFunds: controls['averageCryptoBalance'].value,
            isHaveBankAccount: controls['isBankAccount'].value,
            isEngagedCoinOffering: controls['isEngagedInCoinOffering'].value,
            fundAdministrator: controls['fundAdministrator'].value,
            fundLaunchDate: this._convertLocalTimeToUtc(new Date(controls['fundLaunchDate'].value)),
            strategyMix: strategyMix,
            documents: []
        };
        this.registerInstitutionalAccountModel = new RegisterInstitutionalAccountDTOModel(model);
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
        this.registrationStep = BusinessRegistrationStep.Director1Kyc;
        this.kycPageConfig = {
            type: AccountType.Institutional,
            data: [this.director1.firstName, this.director1.lastName]
        };
    }

    kycPageCompleteHandler: KycPageCompleteHandler = (kycModel: KycModel) => {
        const information = kycModel.information;

        if (this.registrationStep === BusinessRegistrationStep.Director1Kyc) {
            this.registerInstitutionalAccountModel.director1 = information;
            this.registerInstitutionalAccountModel.documents.push(...this._getDirectorDocuments(kycModel.documents, this.director1));

            if (this.director2) {
                this.kycPageConfig.data = [this.director2.firstName, this.director2.lastName];
                this.registrationStep = BusinessRegistrationStep.Director2Kyc;
                this.kycPage.reset();

                return of(null);
            }
        } else {
            this.registerInstitutionalAccountModel.director2 = information;
            this.registerInstitutionalAccountModel.documents.push(...this._getDirectorDocuments(kycModel.documents, this.director2));
        }

        this.doRegistration();

        return of(null);
    }

    doRegistration() {
        this.processing = true;
        this.errorNotification = null;
        this.registrationStep = BusinessRegistrationStep.CompanyInfo;

        this._personalInfoService.registerInstitutionalAccount(this.registerInstitutionalAccountModel)
            .pipe(
                switchMap(() => {
                    return of(
                        this._router.navigate([AuthRoutes.Login], {
                            relativeTo: this._route.parent,
                            queryParams: {infoFilled: true}
                        })
                    );
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

    getStrategyMixFieldErrorMessage(strategyMixPart: EStrategyMixParts) {
        return `${strategyMixPart} field have to be number from 0 to 100`;
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
        const error = 'Sum of values of all strategy mix fields have to be equal 100%';
        return this._formBuilder.group({
            businessType: new FormControl('', [Validators.required]),
            companyFunds: new FormControl('', [Validators.required]),
            cryptoFunds: new FormControl('', [Validators.required]),
            averageCryptoBalance: new FormControl('', [Validators.required]),
            isBankAccount: new FormControl(false, [Validators.required]),
            isEngagedInCoinOffering: new FormControl(false, [Validators.required]),
            fundAdministrator: new FormControl(''),
            fundLaunchDate: new FormControl('', [Validators.required]),
            strategyArbitrage: new FormControl('', [Validators.required, Validators.max(100), Validators.min(0), integerNumberValidator()]),
            strategyBuyHold: new FormControl('', [Validators.required, Validators.max(100), Validators.min(0), integerNumberValidator()]),
            strategyPriceMomentum: new FormControl('', [Validators.required, Validators.max(100), Validators.min(0), integerNumberValidator()]),
            strategyDrivenModels: new FormControl('', [Validators.required, Validators.max(100), Validators.min(0), integerNumberValidator()]),
            strategyEtfIndexWeighting: new FormControl('', [Validators.required, Validators.max(100), Validators.min(0), integerNumberValidator()]),
            strategyDerivaives: new FormControl('', [Validators.required, Validators.max(100), Validators.min(0), integerNumberValidator()]),
            strategyOther: new FormControl('', [Validators.required, Validators.max(100), Validators.min(0), integerNumberValidator()]),
        }, {
            validators: [check100PercentValidator(['strategyArbitrage',
                'strategyBuyHold',
                'strategyPriceMomentum',
                'strategyDrivenModels',
                'strategyEtfIndexWeighting',
                'strategyDerivaives',
                'strategyOther'], error)]
        });
    }

    private _initBusinessTypesList() {
        this._personalInfoService.getInstitutionalBusinessTypesList()
            .subscribe(types => {
                this.businessTypes = types;
                this.registerFormGroup.controls['businessType'].setValue(this.businessTypes[0]);
            }, e => {
                console.log(e);
            });
    }

    private _initCompanyFundsList() {
        this._personalInfoService.getCompanyFundsList()
            .subscribe(funds => {
                this.companyFunds = funds;
                this.registerFormGroup.controls['companyFunds'].setValue(this.companyFunds[0]);
                this.registerFormGroup.controls['cryptoFunds'].setValue(this.companyFunds[0]);
            }, e => {
                console.log(e);
            });
    }

    private _initCryptoBalancesList() {
        this._personalInfoService.getCryptoBalancesList()
            .subscribe(balances => {
                this.cryptoBalances = balances;
                this.registerFormGroup.controls['averageCryptoBalance'].setValue(this.cryptoBalances[0]);
            }, e => {
                console.log(e);
            });
    }

    private _convertLocalTimeToUtc(date: Date): number {
        return TzUtils.localToUTCTz(date).getTime();
    }
}
