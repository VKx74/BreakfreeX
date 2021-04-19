import { AlertActionObject } from "./AlertActionObject";
import { AlertStatus } from "./EnumsDTO";
import { PriceAlertConditionObject } from "./PriceAlertConditionObject";
import { SonarAlertConditionObject } from "./SonarAlertConditionObject";

export interface NewAlertDTO {
    action: AlertActionObject;
    name: string;
    description: string;
    notificationMessage: string;
    expiring?: number;
    status?: AlertStatus;
}

export interface NewPriceAlertDTO extends NewAlertDTO {
    condition: PriceAlertConditionObject;
    instrument: string;
    exchange: string;
}

export interface NewSonarAlertDTO extends NewAlertDTO {
    condition: SonarAlertConditionObject;
}

