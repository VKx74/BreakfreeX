import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {AppConfigService} from "../app.config.service";
import {map} from "rxjs/operators";
import {AccountType, StrategyMix} from 'modules/Auth/models/models';
import { AlertService } from '@alert/services/alert.service';

export enum PersonalInfoStatus {
    None = 0,
    Pending = 1,
    Approve = 2,
    Rejected = 3
}

export enum KycHistoryReviewer {
    None = 0,
    Kyc = 1,
    Shuftipro = 2
}

export interface AccountInfoModelConfig extends Partial<AccountInfoModel> {}
export class AccountInfoModel {
    id: string;
    account: AccountType = AccountType.None;
    status: PersonalInfoStatus = PersonalInfoStatus.None;
    personal: PersonalInformationModel;
    companyFunds: string;
    anticipatedCryptoFunds: string;
    anticipatedAverageCryptoFunds: string;
    isHaveBankAccount: boolean;
    isEngagedCoinOffering: boolean;
    fundAdministrator: string;
    fundLaunchDate: number;
    strategyMix: StrategyMix;

    userEmail: string;
    businessType: string;
    companyName: string;
    companyAddress: string;
    companyLocation: string;
    website: string;
    numberOfEmployers: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    email: string;
    roleAtCompany: string;
    registeredCompanyNumber: string;
    director1: PersonalInformationModel;
    director2: PersonalInformationModel;
    documents: BusinessAccountDocumentModel[];

    constructor(props: AccountInfoModelConfig) {
        Object.assign(this, props);
    }
}

export interface PersonalInformationModel {
    firstName: string;
    lastName: string;
    birthDay: number;
    country: string;
    address: string;
    city: string;
    postcode: number;
}

export interface RegisterPersonalAccountDTOModelConfig extends Partial<RegisterPersonalAccountDTOModel> {}
export class RegisterPersonalAccountDTOModel {
    email: string;
    information: PersonalInformationModel;
    documents: PersonalAccountDocumentModel[];

    constructor(props: RegisterPersonalAccountDTOModelConfig) {
        Object.assign(this, props);
    }
}

export interface RegisterBusinessAccountDTOModelConfig extends Partial<RegisterBusinessAccountDTOModel> {}
export class RegisterBusinessAccountDTOModel {
    userEmail: string;
    businessType: string;
    companyName: string;
    companyAddress: string;
    companyLocation: string;
    website: string;
    numberOfEmployers: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    email: string;
    roleAtCompany: string;
    registeredCompanyNumber: string;
    director1: PersonalInformationModel;
    director2: PersonalInformationModel;
    documents: BusinessAccountDocumentModel[];

    constructor(props: RegisterBusinessAccountDTOModelConfig) {
        Object.assign(this, props);
    }
}

export interface RegisterInstitutionalAccountDTOModelConfig extends Partial<RegisterInstitutionalAccountDTOModel> {}
export class RegisterInstitutionalAccountDTOModel {
    companyFunds: string;
    anticipatedCryptoFunds: string;
    anticipatedAverageCryptoFunds: string;
    isHaveBankAccount: boolean;
    isEngagedCoinOffering: boolean;
    fundAdministrator: string;
    fundLaunchDate: number;
    strategyMix: StrategyMix;

    userEmail: string;
    businessType: string;
    companyName: string;
    companyAddress: string;
    companyLocation: string;
    website: string;
    numberOfEmployers: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    email: string;
    roleAtCompany: string;
    registeredCompanyNumber: string;
    director1: PersonalInformationModel;
    director2: PersonalInformationModel;
    documents: BusinessAccountDocumentModel[];

    constructor(props: RegisterInstitutionalAccountDTOModelConfig) {
        Object.assign(this, props);
    }
}

export interface PersonalAccountDocumentModelConfig extends Partial<PersonalAccountDocumentModel> {}
export class PersonalAccountDocumentModel {
    id: string;
    fileId: string;
    expiration: number;
    code: string;
    type: PersonalInfoDocumentType;

    constructor(config: PersonalAccountDocumentModelConfig) {
        Object.assign(this, config);
    }
}

export interface BusinessAccountDocumentModelConfig extends Partial<BusinessAccountDocumentModel> {}
export class BusinessAccountDocumentModel {
    firstName?: string;
    lastName?: string;
    id?: string;
    fileId: string;
    expiration: number;
    code: string;
    type: PersonalInfoDocumentType;

    constructor(config: BusinessAccountDocumentModelConfig) {
        Object.assign(this, config);
    }
}

export interface PersonalInfoResponseDTO {
    id: string;
    kyc: {
        address: string;
        birthDay: number;
        country: string;
        firstName: string;
        lastName: string;
        id: string;
        postCode: number;
        reason: string;
        status: PersonalInfoStatus;
        documents: PersonalAccountDocumentModel[];
    };
}

export interface PersonalInfoDTO {
    id: string;
    userId: string;
    firstName: string;
    lastName: string;
    birthDay: number;
    country: string;
    address: string;
    city: string;
    postcode: number;
    status: PersonalInfoStatus;
    reason: string;
    documents: PersonalAccountDocumentModel[];
}

export interface KycHistoryModel {
    reviedTime: number;
    status: PersonalInfoStatus;
    reviwer: KycHistoryReviewer;
    value: string;
}

export interface ShuftiproAccountCredentialsModel {
    email: string;
    apikey: string;
    secret: string;
}

export enum PersonalInfoDocumentType {
    None = 0,
    IdentityCard = 1,
    DriversLicense = 2,
    Passport = 3
}

export interface ISubscription {
    status: string;
    name: string;
    price: number;
    created: Date;
    interval: string;
    intervalCount: number;
    currency: string;
    id: string;
}

export interface IPaymentAccount {
    id: string;
    email: string;
    description: string;
    name: string;
    created: number;
    subscriptions: string[];
}

export interface IBillingDashboard {
    id: string;
    object: string;
    customer: string;
    created: number;
    livemode: boolean;
    returnUrl: string;
    url: string;
}


export interface SendCodeViaSMSToAttachPhoneNumberModel {
    email: string;
    phoneNumber: string;
    isFreeTrial: boolean;
}

export interface SendCodeViaSMSToChangePhoneNumberModel {
    email: string;
    currentPhoneNumber: string;
    newPhoneNumber: string;
    viaSms: boolean;
}

export interface SendCodeViaSMSToRemovePhoneNumberModel {
    email: string;
    phoneNumber: string;
    viaSms: boolean;
}

export interface AttachPhoneNumberModel {
    code: string;
    email: string;
    phone: string;
}

export interface ChangePhoneNumberModel {
    email: string;
    code: string;
    phoneNumber: string;
}

export interface RemovePhoneNumberModel {
    email: string;
    code: string;
}

export interface ChangeUserNameModel {
    oldUserName: string;
    newUserName: string;
}

@Injectable()
export class PersonalInfoService {
    private _httpOptions = {
        withCredentials: true
    };

    constructor(private _http: HttpClient, private _alertService: AlertService) {
    }

    getPersonalInfo(userId: string): Observable<AccountInfoModel> {
        return this._http.get<AccountInfoModel>(`${AppConfigService.config.apiUrls.personalInfoREST}${userId}`, this._httpOptions)
            .pipe(
                map((response: AccountInfoModel) => {
                    return new AccountInfoModel({
                        id: userId,
                        ...response
                    });
                })
            );
    }

    sendPersonalInfo(personalInfo: RegisterPersonalAccountDTOModel): Observable<any> {
        return this._http.post(`${AppConfigService.config.apiUrls.personalInfoREST}personal`, personalInfo, this._httpOptions);
    }

    registerBusinessAccount(personalInfo: RegisterBusinessAccountDTOModel): Observable<any> {
        return this._http.post(`${AppConfigService.config.apiUrls.personalInfoREST}business`, personalInfo, this._httpOptions);
    }

    registerInstitutionalAccount(personalInfo: RegisterInstitutionalAccountDTOModel): Observable<any> {
        return this._http.post(`${AppConfigService.config.apiUrls.personalInfoREST}institutional`, personalInfo, this._httpOptions);
    }

    getUserAccountTypeByEmail(email: string): Observable<AccountType> {
        return this._http.get<AccountType>(`${AppConfigService.config.apiUrls.personalInfoREST}type?Email=${email}`);
    }

    approvePersonalInfo(userId: string): Observable<any> {
        const body = {
            userId: userId,
            isApproved: true,
            reason: ''
        };

        return this._http.patch(`${AppConfigService.config.apiUrls.personalInfoREST}`, body, this._httpOptions);
    }

    rejectPersonalInfo(userId: string, reasonMessage: string): Observable<any> {
        const body = {
            userId: userId,
            isApproved: false,
            reason: reasonMessage
        };

        return this._http.patch(`${AppConfigService.config.apiUrls.personalInfoREST}`, body, this._httpOptions);
    }

    getSupportedCountriesList(): Observable<string[]> {
        return this._http.get<string[]>(`${AppConfigService.config.apiUrls.shuftiproApiRest}Verification/Countries`);
    }

    getSupportedDocumentsList(country: string): Observable<PersonalInfoDocumentType[]> {
        return this._http.get<PersonalInfoDocumentType[]>(`${AppConfigService.config.apiUrls.shuftiproApiRest}Verification/Documents/?country=${country}`);
    }

    getBusinessTypesList(): Observable<string[]> {
        return this._http.get<string[]>(`${AppConfigService.config.apiUrls.identityUrl}Constants/business`);
    }

    getInstitutionalBusinessTypesList(): Observable<string[]> {
        return this._http.get<string[]>(`${AppConfigService.config.apiUrls.identityUrl}Constants/institutional/business`);
    }

    getCompanyFundsList(): Observable<string[]> {
        return this._http.get<string[]>(`${AppConfigService.config.apiUrls.identityUrl}Constants/funds`);
    }

    getCryptoBalancesList(): Observable<string[]> {
        return this._http.get<string[]>(`${AppConfigService.config.apiUrls.identityUrl}Constants/Crypto/balance`);
    }

    getEmployersCountList(): Observable<string[]> {
        return this._http.get<string[]>(`${AppConfigService.config.apiUrls.identityUrl}Constants/employers`);
    }
    
    getUserSubscriptions(): Observable<ISubscription[]> {
        return this._http.get<ISubscription[]>(`${AppConfigService.config.apiUrls.identityUrl}Account/subscriptions`, this._httpOptions)
        .pipe(
            map((response: any[]) => {
                const subscriptions = [];
                if (!response || !response.length) {
                    return subscriptions;
                }

                for (const sub of response) {
                    subscriptions.push({
                        status: sub.status,
                        name: sub.name,
                        price: sub.amount / 100,
                        created: new Date(sub.created * 1000),
                        interval: sub.interval,
                        intervalCount: sub.intervalCount,
                        currency: sub.currency,
                        id: sub.id
                    });
                }

                return subscriptions;
            })
        );
    } 

    getUserAccounts(): Observable<IPaymentAccount[]> {
        return this._http.get<IPaymentAccount[]>(`${AppConfigService.config.apiUrls.identityUrl}striple/user_stripe_accounts`, this._httpOptions);
    } 

    processUserBillingDashboard(id: string) {
        this.getUserBillingDashboard(id).subscribe((result: IBillingDashboard) => {
            if (result) {
                if (result.url) {
                    let popUp = window.open(result.url, "_blank");
                    if (!popUp || popUp.closed || typeof popUp.closed === 'undefined') { 
                        // POPUP BLOCKED
                        window.location.assign(result.url);
                    }
                } else {
                    this._alertService.info("Subscriptions not found for current user");    
                }
            } else {
                this._alertService.info("Subscriptions not found for current user");    
            }
        }, (error) => {
            this._alertService.error("Failed to get subscription details");
        });
    }
    
    getUserBillingDashboard(id: string): Observable<IBillingDashboard> {
        return this._http.get<IBillingDashboard>(`${AppConfigService.config.apiUrls.identityUrl}striple/user_billing_dashboard/${id}`, this._httpOptions);
    }

    getHealthStatus(): Observable<any> {
        return this._http.get<any>(`${AppConfigService.config.apiUrls.shuftiproApiRest}Verification/Health`);
    }

    getShuftiproAccountEmail(): Observable<string> {
        return this._http.get<string>(`${AppConfigService.config.apiUrls.shuftiproApiRest}Account/Credentials`);
    }

    changeShuftiproAccount(credentials: ShuftiproAccountCredentialsModel): Observable<any> {
        return this._http.post<any>(`${AppConfigService.config.apiUrls.shuftiproApiRest}Account/Credentials`, credentials);
    }

    getUserKycHistory(email: string): Observable<any> {
        return this._http.get<any>(`${AppConfigService.config.apiUrls.identityUrl}KYC/history?Email=${email}`, this._httpOptions);
    }

    sendCodeViaSMSToAttachPhoneNumber(sendCodeViaSMSToAttachPhoneNumberModel: SendCodeViaSMSToAttachPhoneNumberModel): Observable<any> {
        return this._http.post(`${AppConfigService.config.apiUrls.identityUrl}PhoneNumber/send/verification/token`, sendCodeViaSMSToAttachPhoneNumberModel, this._httpOptions);
    }

    sendCodeViaSMSToChangePhoneNumber(sendCodeViaSMSToChangePhoneNumberModel: SendCodeViaSMSToChangePhoneNumberModel): Observable<any> {
        return this._http.post(`${AppConfigService.config.apiUrls.identityUrl}PhoneNumber/send/change/token`, sendCodeViaSMSToChangePhoneNumberModel, this._httpOptions);
    }

    sendCodeViaSMSToRemovePhoneNumber(sendCodeViaSMSToRemovePhoneNumberModel: SendCodeViaSMSToRemovePhoneNumberModel): Observable<any> {
        return this._http.post(`${AppConfigService.config.apiUrls.identityUrl}PhoneNumber/send/delete/token`, sendCodeViaSMSToRemovePhoneNumberModel, this._httpOptions);
    }

    attachPhoneNumber(attachPhoneNumberModel: AttachPhoneNumberModel): Observable<any> {
        return this._http.patch(`${AppConfigService.config.apiUrls.identityUrl}PhoneNumber`, attachPhoneNumberModel, this._httpOptions);
    }

    changePhoneNumber(changePhoneNumberModel: ChangePhoneNumberModel): Observable<any> {
        return this._http.post(`${AppConfigService.config.apiUrls.identityUrl}PhoneNumber/change`, changePhoneNumberModel, this._httpOptions);
    }

    removePhoneNumber(removePhoneNumberModel: RemovePhoneNumberModel): Observable<any> {
        const options = {
            body: removePhoneNumberModel,
            withCredentials: true
        };
        return this._http.delete(`${AppConfigService.config.apiUrls.identityUrl}PhoneNumber`, options);
    }

    changeUserName(changeUsernameModel: ChangeUserNameModel) {
        return this._http.put(`${AppConfigService.config.apiUrls.identityUrl}Profile/userName/change`, changeUsernameModel, this._httpOptions);
    }
}
