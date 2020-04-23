import {AppConfigService} from "@app/services/app.config.service";
import {IPaginationResponse} from "@app/models/pagination.model";

export enum SystemMonitoringType {
    platform = 'platform',
    exchange = 'exchange',
}

export enum SystemMonitoringSubtype {
    services = 'services',
    eventBus = 'eventBus',
    performance = 'performance',
}

export const URLS_MAP = {
    [SystemMonitoringType.platform]: {
        [SystemMonitoringSubtype.services]: AppConfigService.config.systemMonitoringUrls.platform.services,
        [SystemMonitoringSubtype.eventBus]: AppConfigService.config.systemMonitoringUrls.platform.eventBus,
        [SystemMonitoringSubtype.performance]: AppConfigService.config.systemMonitoringUrls.platform.performance,
    },
    [SystemMonitoringType.exchange]: {
        [SystemMonitoringSubtype.services]: AppConfigService.config.systemMonitoringUrls.exchange.services,
        [SystemMonitoringSubtype.eventBus]: AppConfigService.config.systemMonitoringUrls.exchange.eventBus,
        [SystemMonitoringSubtype.performance]: AppConfigService.config.systemMonitoringUrls.exchange.performance,
    },
};

export interface ISystemMonitoringQueryParams {
    type: string;
    subtype: string;
}

export class SystemMonitoringQueryParams {
    type: string;
    subtype: string;

    constructor(type: string, subtype: string) {
        this.type = type;
        this.subtype = subtype;
    }
}

export interface ISystemMonitoringItem {
    services: string;
    eventBus: string;
    performance: string;
}

export interface SystemMonitoringUrls {
    platform: ISystemMonitoringItem;
    exchange: ISystemMonitoringItem;
}

// services monitoring
export interface EventsLogRequestParams {
    serviceName?: string;
    from?: string;
    to?: string;
    statusCode?: number;
    requestMethod?: string;
}

export interface WithdrawRequestParams {
    search?: string;
    startDate?: string;
    endDate?: string;
    currencyId?: string;
    memberId?: number;
    descending?: boolean;
    orderField?: string;
}

export enum HTTPMethod {
    GET,
    PUT,
    POST,
    DELETE,
}

interface RequestResponseBody {
    length: number;
    type: string;
    value: string;
}

interface Headers {
    [name: string]: string;
}

export interface EventLogAction {
    exception: any;
    formVariables: any;
    headers: Headers;
    httpMethod: keyof typeof HTTPMethod;
    ipAddress: string;
    requestBody: RequestResponseBody;
    responseBody: RequestResponseBody;
    responseStatus: string;
    responseStatusCode: number;
    traceId: string;
    userName: string;
}

export interface EventLogEnvironment {
    userName: string;
    machineName: string;
    domainName: string;
    callingMethodName: string;
    assemblyName: string;
    exception: any;
    culture: string;
}

export interface IEventsLogItem {
    action: EventLogAction;
    duration: number;
    endDate: string;
    environment: EventLogEnvironment;
    eventType: string;
    serviceName: string;
    startDate: string;
    _id: string;
}

export interface IEventsLogResolvedData {
    logs: IPaginationResponse<IEventsLogItem>;
}
