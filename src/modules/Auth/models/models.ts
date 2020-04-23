import {
    PersonalAccountDocumentModel,
    PersonalInformationModel
} from "@app/services/personal-info/personal-info.service";
import {FormGroup} from "@angular/forms";

export enum BusinessRegistrationStep {
    CompanyInfo,
    Director1Kyc,
    Director2Kyc
}

export interface DirectorFullName {
    firstName: string;
    lastName: string;
}

export interface KycModel {
    information: PersonalInformationModel;
    documents: PersonalAccountDocumentModel[];
}

export enum AccountType {
    None,
    Personal,
    Business,
    Institutional
}

export interface KycPageConfig {
    type: AccountType;
    data: string | string[];
}

export interface StrategyMix {
    arbitrage:	number;
    buyAndHold:	number;
    priceMomentum:	number;
    valueDrivenModels:	number;
    etfIndexWeighting:	number;
    derivaives:	number;
    other:	number;
}

export interface ResetableComponent {
    formGroup: FormGroup;
    resetAll: () => void;
}