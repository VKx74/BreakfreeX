import { AlertActionObject } from "./AlertActionObject";
import { PriceAlertConditionObject } from "./PriceAlertConditionObject";
import { SonarAlertConditionObject } from "./SonarAlertConditionObject";

export interface NewAlertDTO {
    Action: AlertActionObject;
    Name: string;
    Description: string;
    NotificationMessage: string;
    Expiring?: number;
}

export interface NewPriceAlertDTO extends NewAlertDTO {
    Condition: PriceAlertConditionObject;
    Instrument: string;
    Exchange: string;
}

export interface NewSonarAlertDTO extends NewAlertDTO {
    Condition: SonarAlertConditionObject;
}


