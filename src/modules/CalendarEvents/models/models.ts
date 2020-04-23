import {EEconomicCalendarNotificationType, EEventVolatility} from "./enums";

export class EconomicEvent {
    id: string;
    time: number;
    title: string;
    description: string;
    actual: string;
    consensus: string;
    previous: string;
    volatility: EEventVolatility;
    symbols: string[] = [];
}

export class EconomicEventResponseModel {
    tradingEvents: EconomicEvent[];
    count: number;
}

export class EconomicEventNotification {
    type: EEconomicCalendarNotificationType;
}

export class EconomicEventCreateNotification extends EconomicEventNotification {
    event: EconomicEvent;
}

export class EconomicEventUpdateNotification extends EconomicEventNotification {
    event: EconomicEvent;
}

export class EconomicEventDeleteNotification extends EconomicEventNotification {
    eventid: string;
}

export interface GetEventsParams {
    startDate?: number;
    endDate?: number;
    volatility?: number;
    search?: string;
    skip?: number;
    limit?: number;
    symbols?: string[];
}



