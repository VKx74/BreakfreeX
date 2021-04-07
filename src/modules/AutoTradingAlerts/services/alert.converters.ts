import { NewPriceAlertOptions, NewSonarAlertOptions } from "../models/NewAlertOptions";
import { NewPriceAlertDTO, NewSonarAlertDTO } from "../models/NewAlertDTO";
import { AlertCondition, TriggerSetup, TriggerTimeframe, TriggerType } from "../models/Enums";
import { TimeSpan } from "@app/helpers/timeFrame.helper";
import { AlertNotificationType, AlertType, PriceAlertCondition } from "../models/EnumsDTO";
import { AlertBaseDTO, PriceAlertDTO, SonarAlertDTO } from "../models/AlertBaseDTO";
import { AlertBase, PriceAlert, SonarAlert } from "../models/AlertBase";
import { AlertHistory } from "../models/AlertHistory";
import { AlertHistoryDTO } from "../models/AlertHistoryDTO";


export class AlertConverters {
    public static AlertDTOToAlertBase(dto: AlertBaseDTO): AlertBase {
        if (dto.Type === AlertType.PriceAlert) {
            return this.PriceAlertDTOToAlertBase(dto as PriceAlertDTO);
        } else if (dto.Type === AlertType.SonarAlert) {
            return this.SonarAlertDTOToAlertBase(dto as SonarAlertDTO);
        }
    } 
    
    public static AlertHistoryDTOToAlertHistory(dto: AlertHistoryDTO): AlertHistory {
        return {
            Id: dto.Id,
            Created: dto.Created,
            ExecutionStrategy: dto.ExecutionStrategy,
            NotificationMessage: dto.NotificationMessage,
            Type: dto.Type,
            Action: dto.Action,
            AlertId: dto.AlertId,
            Condition: dto.Condition,
            Description: dto.Description,
            Name: dto.Name,
            TriggerTime: dto.TriggerTime
        };
    }

    public static PriceAlertDTOToAlertBase(dto: PriceAlertDTO): PriceAlert {
        return {
            Id: dto.Id,
            Created: dto.Created,
            Exchange: dto.Exchange,
            ExecutionStrategy: dto.ExecutionStrategy,
            Expiring: dto.Expiring,
            Instrument: dto.Instrument,
            NotificationMessage: dto.NotificationMessage,
            Started: dto.Started,
            Type: dto.Type,
            Status: dto.Status,
            Value: dto.Condition.Price,
            Condition: this.MapDTOToPriceAlertCondition(dto.Condition.Condition),
            UseEmail: dto.Action && dto.Action.Notifications ? dto.Action.Notifications.indexOf(AlertNotificationType.Email) !== -1 : false,
            UsePush: dto.Action && dto.Action.Notifications ? dto.Action.Notifications.indexOf(AlertNotificationType.Push) !== -1 : false,
            UseSMS: dto.Action && dto.Action.Notifications ? dto.Action.Notifications.indexOf(AlertNotificationType.SMS) !== -1 : false
        };
    }

    public static SonarAlertDTOToAlertBase(dto: SonarAlertDTO): SonarAlert {
        return {
            Id: dto.Id,
            Created: dto.Created,
            ExecutionStrategy: dto.ExecutionStrategy,
            Expiring: dto.Expiring,
            NotificationMessage: dto.NotificationMessage,
            Started: dto.Started,
            Type: dto.Type,
            Status: dto.Status,
            Instrument: dto.Condition.Symbol,
            Setup: this.MapDTOToTriggerSetup(dto.Condition.Setup),
            Timeframe: this.MapGranularityToTriggerTimeframe(dto.Condition.Granularity),
            TriggerType: dto.Condition.IsDisappeared ? TriggerType.SetupDisappeared : TriggerType.NewSetup,
            UseEmail: dto.Action && dto.Action.Notifications ? dto.Action.Notifications.indexOf(AlertNotificationType.Email) !== -1 : false,
            UsePush: dto.Action && dto.Action.Notifications ? dto.Action.Notifications.indexOf(AlertNotificationType.Push) !== -1 : false,
            UseSMS: dto.Action && dto.Action.Notifications ? dto.Action.Notifications.indexOf(AlertNotificationType.SMS) !== -1 : false
        };
    }

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
    
    private static MapDTOToPriceAlertCondition(alertCondition: PriceAlertCondition): AlertCondition {
        switch (alertCondition) {
            case PriceAlertCondition.Greater: return AlertCondition.GreaterThan;
            case PriceAlertCondition.Less: return AlertCondition.LessThan;
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

    private static MapDTOToTriggerSetup(setup: string): TriggerSetup {
        if (!setup) {
            return TriggerSetup.AllSetups;
        }

        let upCaseName = setup.toUpperCase();
        if (upCaseName === "BRC") {
            return TriggerSetup.BRC;
        } 
        if (upCaseName === "EXT") {
            return TriggerSetup.EXT;
        }
        if (upCaseName === "SWING") {
            return TriggerSetup.Swing;
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

    private static MapGranularityToTriggerTimeframe(tf: number): TriggerTimeframe {
        if (!tf) {
            return TriggerTimeframe.AllTimeframes;
        }

        if (TimeSpan.MILLISECONDS_IN_MINUTE / 1000 * 15 === tf)
        {
            return TriggerTimeframe.Min15;
        }
        if (TimeSpan.MILLISECONDS_IN_HOUR / 1000 === tf)
        {
            return TriggerTimeframe.Hour1;
        }
        if (TimeSpan.MILLISECONDS_IN_HOUR / 1000 === tf)
        {
            return TriggerTimeframe.Hour4;
        }
        if (TimeSpan.MILLISECONDS_IN_DAY / 1000 === tf)
        {
            return TriggerTimeframe.Day1;
        }
    }
}
