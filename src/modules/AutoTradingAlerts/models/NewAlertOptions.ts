import { AlertCondition, TriggerSetup, TriggerTimeframe, TriggerType } from "./Enums";

export interface NewAlertOptions {
    UseEmail: boolean;
    UseSMS: boolean;
    UsePush: boolean;
    NotificationMessage: string;
    Expiring?: number;
}

export interface NewPriceAlertOptions extends NewAlertOptions {
    Instrument: string;
    Exchange: string;
    Condition: AlertCondition;
    Value: number;
}

export interface NewSonarAlertOptions extends NewAlertOptions {
    Instrument: string;
    Timeframe: TriggerTimeframe;
    Setup: TriggerSetup;
    TriggerType: TriggerType;
}

