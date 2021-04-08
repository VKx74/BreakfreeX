import { AlertActionObject } from "./AlertActionObject";
import { AlertExecutionStrategy, AlertStatus, AlertType } from "./EnumsDTO";
import { PriceAlertConditionObject } from "./PriceAlertConditionObject";
import { SonarAlertConditionObject } from "./SonarAlertConditionObject";

export interface AlertBaseDTO {
    id: number;
    type: AlertType;
    status: AlertStatus;
    executionStrategy: AlertExecutionStrategy;
    action: AlertActionObject;
    name: string;
    description: string;
    notificationMessage: string;
    expiring: number;
    started: number;
    created: number;
}

export interface PriceAlertDTO extends AlertBaseDTO {
    condition: PriceAlertConditionObject;
    instrument: string;
    exchange: string;
}

export interface SonarAlertDTO extends AlertBaseDTO {
    condition: SonarAlertConditionObject;
}