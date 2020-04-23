import { EAlertType, EChannelAlertCondition, EMovingAlertCondition, EPriceAlertCondition } from "./Enums";
import { TradeSettings } from "./TradeSettingsBase";
import { IndicatorSeriesDescription } from './dataSources/IndicatorSeriesDescription';


export class AlertSettings {
    AlertType: EAlertType;
    Condition: EPriceAlertCondition | EChannelAlertCondition | EMovingAlertCondition;
    UseExpiration: boolean;
    Expiration: number;
    ShowPopup: boolean;
    SendEmail: boolean;
    SendSMS: boolean;
    PlaySound: boolean;
    SoundId: string;
    // NotificationPhoneNumber: string;
    // NotificationEmail: string;
    Comment: string;
    AlertName: string;
    AlertId: string;
    ConfiguredTrade?: TradeSettings;
}

export class PriceAlertSettings extends AlertSettings {
    Value: number;
}

export class ChannelAlertSettings extends AlertSettings {
    Value1: number;
    Value2: number;
}

export class MovingAlertSettings extends AlertSettings {
    Value: number;
    Time: number;
}

export class IndicatorAlertSettings extends AlertSettings {
    IndicatorSeriesDescription: IndicatorSeriesDescription;
}