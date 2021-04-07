import { NewPriceAlertOptions, NewSonarAlertOptions } from "../models/NewAlertOptions";
import { NewPriceAlertDTO, NewSonarAlertDTO } from "../models/NewAlertDTO";
import { AlertCondition, TriggerSetup, TriggerTimeframe, TriggerType } from "../models/Enums";
import { TimeSpan } from "@app/helpers/timeFrame.helper";
import { AlertNotificationType, PriceAlertCondition } from "../models/EnumsDTO";


export class AlertConverters {
    public static NewPriceAlertOptionsToDTO(options: NewPriceAlertOptions): NewPriceAlertDTO {
        let notifications: AlertNotificationType[] = [];
        if (options.UseEmail) {
            notifications.push(AlertNotificationType.Email);
        }
        if (options.UseSMS) {
            notifications.push(AlertNotificationType.SMS);
        }
        if (options.UsePush) {
            notifications.push(AlertNotificationType.Push);
        }

        let result: NewPriceAlertDTO = {
            Expiring: options.Expiring,
            NotificationMessage: options.NotificationMessage,
            Exchange: options.Exchange,
            Instrument: options.Instrument,
            Description: "",
            Name: "",
            Action: {
                Notifications: notifications
            },
            Condition: {
                Price: options.Value,
                Condition: this.MapPriceAlertConditionToDTO(options.Condition)
            }
        };

        return result;
    }

    public static NewSonarAlertOptionsToDTO(options: NewSonarAlertOptions): NewSonarAlertDTO {
        let notifications: AlertNotificationType[] = [];
        if (options.UseEmail) {
            notifications.push(AlertNotificationType.Email);
        }
        if (options.UseSMS) {
            notifications.push(AlertNotificationType.SMS);
        }
        if (options.UsePush) {
            notifications.push(AlertNotificationType.Push);
        }

        let result: NewSonarAlertDTO = {
            Expiring: options.Expiring,
            NotificationMessage: options.NotificationMessage,
            Description: "",
            Name: "",
            Action: {
                Notifications: notifications
            },
            Condition: {
                Symbol: options.Instrument,
                Granularity: this.MapTriggerTimeframeToGranularity(options.Timeframe),
                IsDisappeared: options.TriggerType === TriggerType.SetupDisappeared,
                Setup: this.MapTriggerSetupToDTO(options.Setup)
            }
        };
        return result;
    }

    private static MapPriceAlertConditionToDTO(alertCondition: AlertCondition): PriceAlertCondition {
        switch (alertCondition) {
            case AlertCondition.GreaterThan: return PriceAlertCondition.Greater;
            case AlertCondition.LessThan: return PriceAlertCondition.Less;
        }
    }

    private static MapTriggerSetupToDTO(setup: TriggerSetup): string {
        switch (setup) {
            case TriggerSetup.AllSetups: return null;
            case TriggerSetup.BRC: return "BRC";
            case TriggerSetup.EXT: return "EXT";
            case TriggerSetup.Swing: return "SWING";
        }
    }

    private static MapTriggerTimeframeToGranularity(tf: TriggerTimeframe): number {
        switch (tf) {
            case TriggerTimeframe.AllTimeframes: return null;
            case TriggerTimeframe.Min15: return TimeSpan.MILLISECONDS_IN_MINUTE / 1000 * 15;
            case TriggerTimeframe.Hour1: return TimeSpan.MILLISECONDS_IN_HOUR / 1000;
            case TriggerTimeframe.Hour4: return TimeSpan.MILLISECONDS_IN_HOUR / 1000 * 4;
            case TriggerTimeframe.Day1: return TimeSpan.MILLISECONDS_IN_DAY / 1000;
        }
    }
}
