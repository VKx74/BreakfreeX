import { AlertCondition, TriggerSetup, TriggerTimeframe, TriggerType } from "./Enums";
import { AlertExecutionStrategy, AlertStatus, AlertType } from "./EnumsDTO";

export interface AlertBase {
    Id: number;
    Type: AlertType;
    Status: AlertStatus;
    ExecutionStrategy: AlertExecutionStrategy;
    NotificationMessage: string;
    Expiring: number;
    Started: number;
    Created: number;
    UseEmail: boolean;
    UseSMS: boolean;
    UsePush: boolean;
}

export interface PriceAlert extends AlertBase {
    Instrument: string;
    Exchange: string;
    Condition: AlertCondition;
    Value: number;
}

export interface SonarAlert extends AlertBase {
    Instrument: string;
    Timeframe: TriggerTimeframe;
    Setup: TriggerSetup;
    TriggerType: TriggerType;
}