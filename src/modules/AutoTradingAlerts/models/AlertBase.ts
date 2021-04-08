import { AlertCondition, TriggerSetup, TriggerTimeframe, TriggerType } from "./Enums";
import { AlertExecutionStrategy, AlertStatus, AlertType } from "./EnumsDTO";

export interface AlertBase {
    id: number;
    type: AlertType;
    status: AlertStatus;
    executionStrategy: AlertExecutionStrategy;
    notificationMessage: string;
    expiring: number;
    started: number;
    created: number;
    useEmail: boolean;
    useSMS: boolean;
    usePush: boolean;
}

export interface PriceAlert extends AlertBase {
    instrument: string;
    exchange: string;
    condition: AlertCondition;
    value: number;
}

export interface SonarAlert extends AlertBase {
    instrument: string;
    timeframe: TriggerTimeframe;
    setup: TriggerSetup;
    triggerType: TriggerType;
}