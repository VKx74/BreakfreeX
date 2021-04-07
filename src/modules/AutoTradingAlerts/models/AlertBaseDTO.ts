import { AlertActionObject } from "./AlertActionObject";
import { AlertExecutionStrategy, AlertStatus, AlertType } from "./EnumsDTO";
import { PriceAlertConditionObject } from "./PriceAlertConditionObject";
import { SonarAlertConditionObject } from "./SonarAlertConditionObject";

export interface AlertBaseDTO {
    Id: number;
    Type: AlertType;
    Status: AlertStatus;
    ExecutionStrategy: AlertExecutionStrategy;
    Action: AlertActionObject;
    Name: string;
    Description: string;
    NotificationMessage: string;
    Expiring: number;
    Started: number;
    Created: number;
}

export interface PriceAlertDTO extends AlertBaseDTO {
    Condition: PriceAlertConditionObject;
    Instrument: string;
    Exchange: string;
}

export interface SonarAlertDTO extends AlertBaseDTO {
    Condition: SonarAlertConditionObject;
}