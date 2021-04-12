import { AlertCondition, TriggerSetup, TriggerTimeframe, TriggerType } from "./Enums";
import { AlertStatus } from "./EnumsDTO";

export interface NewAlertOptions {
    useEmail: boolean;
    useSMS: boolean;
    usePush: boolean;
    notificationMessage: string;
    expiring?: number;
    status?: AlertStatus;
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

