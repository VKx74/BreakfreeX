import { AlertCondition, TriggerSetup, TriggerTimeframe, TriggerType } from "./Enums";
import { AlertExecutionStrategy, AlertStatus } from "./EnumsDTO";

export interface NewAlertOptions {
    useEmail: boolean;
    useSMS: boolean;
    usePush: boolean;
    playSound: boolean;
    notificationMessage: string;
    expiring?: number;
    status?: AlertStatus;
    triggerOptions: AlertExecutionStrategy;
}

export interface NewPriceAlertOptions extends NewAlertOptions {
    instrument: string;
    exchange: string;
    condition: AlertCondition;
    value: number;
}

export interface NewSonarAlertOptions extends NewAlertOptions {
    instrument: string;
    timeframe: TriggerTimeframe;
    setup: TriggerSetup;
    triggerType: TriggerType;
}

