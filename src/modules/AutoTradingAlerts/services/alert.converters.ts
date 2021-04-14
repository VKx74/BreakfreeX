import { NewPriceAlertOptions, NewSonarAlertOptions } from "../models/NewAlertOptions";
import { NewPriceAlertDTO, NewSonarAlertDTO } from "../models/NewAlertDTO";
import { AlertCondition, TriggerSetup, TriggerTimeframe, TriggerType } from "../models/Enums";
import { TimeSpan } from "@app/helpers/timeFrame.helper";
import { AlertNotificationType, AlertType, PriceAlertCondition } from "../models/EnumsDTO";
import { AlertBaseDTO, PriceAlertDTO, SonarAlertDTO } from "../models/AlertBaseDTO";
import { AlertBase, PriceAlert, SonarAlert } from "../models/AlertBase";
import { AlertHistory } from "../models/AlertHistory";
import { AlertHistoryDTO } from "../models/AlertHistoryDTO";
import { NotificationLog } from "../models/NotificationLog";
import { NotificationLogDTO } from "../models/NotificationLogDTO";


export class AlertConverters {
    public static AlertDTOToAlertBase(dto: AlertBaseDTO): AlertBase {
        if (dto.type === AlertType.PriceAlert) {
            return this.PriceAlertDTOToAlertBase(dto as PriceAlertDTO);
        } else if (dto.type === AlertType.SonarAlert) {
            return this.SonarAlertDTOToAlertBase(dto as SonarAlertDTO);
        }
    } 
    
    public static AlertHistoryDTOToAlertHistory(dto: AlertHistoryDTO): AlertHistory {
        return {
            id: dto.id,
            created: dto.created,
            executionStrategy: dto.executionStrategy,
            notificationMessage: dto.notificationMessage,
            type: dto.type,
            action: dto.action,
            alertId: dto.alertId,
            condition: dto.condition,
            description: dto.description,
            name: dto.name,
            triggerTime: dto.triggerTime * 1000
        };
    }  
    
    public static NotificationLogDTOToNotificationLog(dto: NotificationLogDTO): NotificationLog {
        dto.time *= 1000;
        return dto; // same data
    }

    public static PriceAlertDTOToAlertBase(dto: PriceAlertDTO): PriceAlert {
        return {
            id: dto.id,
            created: dto.created,
            exchange: dto.exchange,
            executionStrategy: dto.executionStrategy,
            expiring: dto.expiring ? dto.expiring * 1000 : dto.expiring,
            instrument: dto.instrument,
            notificationMessage: dto.notificationMessage,
            started: dto.started,
            type: dto.type,
            status: dto.status,
            value: dto.condition.price,
            condition: this.MapDTOToPriceAlertCondition(dto.condition.condition),
            useEmail: dto.action && dto.action.notifications ? dto.action.notifications.indexOf(AlertNotificationType.Email) !== -1 : false,
            usePush: dto.action && dto.action.notifications ? dto.action.notifications.indexOf(AlertNotificationType.Push) !== -1 : false,
            useSMS: dto.action && dto.action.notifications ? dto.action.notifications.indexOf(AlertNotificationType.SMS) !== -1 : false
        };
    }

    public static SonarAlertDTOToAlertBase(dto: SonarAlertDTO): SonarAlert {
        return {
            id: dto.id,
            created: dto.created,
            executionStrategy: dto.executionStrategy,
            expiring: dto.expiring ? dto.expiring * 1000 : dto.expiring,
            notificationMessage: dto.notificationMessage,
            started: dto.started,
            type: dto.type,
            status: dto.status,
            instrument: dto.condition.symbol,
            setup: this.MapDTOToTriggerSetup(dto.condition.setup),
            timeframe: this.MapGranularityToTriggerTimeframe(dto.condition.granularity),
            triggerType: dto.condition.isDisappeared ? TriggerType.SetupDisappeared : TriggerType.NewSetup,
            useEmail: dto.action && dto.action.notifications ? dto.action.notifications.indexOf(AlertNotificationType.Email) !== -1 : false,
            usePush: dto.action && dto.action.notifications ? dto.action.notifications.indexOf(AlertNotificationType.Push) !== -1 : false,
            useSMS: dto.action && dto.action.notifications ? dto.action.notifications.indexOf(AlertNotificationType.SMS) !== -1 : false
        };
    }

    public static NewPriceAlertOptionsToDTO(options: NewPriceAlertOptions): NewPriceAlertDTO {
        let notifications: AlertNotificationType[] = [];
        if (options.useEmail) {
            notifications.push(AlertNotificationType.Email);
        }
        if (options.useSMS) {
            notifications.push(AlertNotificationType.SMS);
        }
        if (options.usePush) {
            notifications.push(AlertNotificationType.Push);
        }

        let result: NewPriceAlertDTO = {
            expiring: options.expiring ? Math.trunc(options.expiring / 1000) : options.expiring,
            notificationMessage: options.notificationMessage,
            exchange: options.exchange,
            instrument: options.instrument,
            status: options.status,
            description: "",
            name: "",
            action: {
                notifications: notifications
            },
            condition: {
                price: options.value,
                condition: this.MapPriceAlertConditionToDTO(options.condition)
            }
        };

        return result;
    }

    public static NewSonarAlertOptionsToDTO(options: NewSonarAlertOptions): NewSonarAlertDTO {
        let notifications: AlertNotificationType[] = [];
        if (options.useEmail) {
            notifications.push(AlertNotificationType.Email);
        }
        if (options.useSMS) {
            notifications.push(AlertNotificationType.SMS);
        }
        if (options.usePush) {
            notifications.push(AlertNotificationType.Push);
        }

        let result: NewSonarAlertDTO = {
            expiring: options.expiring ? Math.trunc(options.expiring / 1000) : options.expiring,
            notificationMessage: options.notificationMessage,
            status: options.status,
            description: "",
            name: "",
            action: {
                notifications: notifications
            },
            condition: {
                symbol: options.instrument,
                granularity: this.MapTriggerTimeframeToGranularity(options.timeframe),
                isDisappeared: options.triggerType === TriggerType.SetupDisappeared,
                setup: this.MapTriggerSetupToDTO(options.setup)
            }
        };
        return result;
    }

    public static MapPriceAlertConditionToDTO(alertCondition: AlertCondition): PriceAlertCondition {
        switch (alertCondition) {
            case AlertCondition.GreaterThan: return PriceAlertCondition.Greater;
            case AlertCondition.LessThan: return PriceAlertCondition.Less;
        }
    }   
    
    public static MapDTOToPriceAlertCondition(alertCondition: PriceAlertCondition): AlertCondition {
        switch (alertCondition) {
            case PriceAlertCondition.Greater: return AlertCondition.GreaterThan;
            case PriceAlertCondition.Less: return AlertCondition.LessThan;
        }
    }

    public static MapTriggerSetupToDTO(setup: TriggerSetup): string {
        switch (setup) {
            case TriggerSetup.AllSetups: return null;
            case TriggerSetup.BRC: return "BRC";
            case TriggerSetup.EXT: return "EXT";
            case TriggerSetup.Swing: return "SWING";
        }
    }

    public static MapDTOToTriggerSetup(setup: string): TriggerSetup {
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

    public static MapTriggerTimeframeToGranularity(tf: TriggerTimeframe): number {
        switch (tf) {
            case TriggerTimeframe.AllTimeframes: return null;
            case TriggerTimeframe.Min15: return TimeSpan.MILLISECONDS_IN_MINUTE / 1000 * 15;
            case TriggerTimeframe.Hour1: return TimeSpan.MILLISECONDS_IN_HOUR / 1000;
            case TriggerTimeframe.Hour4: return TimeSpan.MILLISECONDS_IN_HOUR / 1000 * 4;
            case TriggerTimeframe.Day1: return TimeSpan.MILLISECONDS_IN_DAY / 1000;
        }
    }

    public static MapGranularityToTriggerTimeframe(tf: number): TriggerTimeframe {
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
