import {Injectable} from '@angular/core';
import {AppConfigService} from "@app/services/app.config.service";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {QueryParamsConstructor} from "../data/models";
import {
    CollectionResponseType,
    IPaginationParams, PaginationParams,
    IPaginationResponse,
    toBasePaginationResponse
} from "@app/models/pagination.model";
import {
    IEventsLogItem,
    EventsLogRequestParams, SystemMonitoringSubtype,
    SystemMonitoringType,
    SystemMonitoringUrls
} from "../data/system-monitoring.models";

export interface ServiceHealthStatusResponse {
    status: number;
    description: string;
}

export interface IEventLogFiltrationParams {
    serviceNames: string[];
    responseCodes: number[];
    requestMethods: string[];
}

@Injectable({
    providedIn: 'root'
})
export class SystemMonitoringService {
    get systemMonitoringUrls(): SystemMonitoringUrls {
        return AppConfigService.config.systemMonitoringUrls;
    }

    constructor(private _http: HttpClient) {
    }

    getUrl(monitoringType: SystemMonitoringType, monitoringItem: SystemMonitoringSubtype): string {
        const monitoringTypeName = SystemMonitoringType[monitoringType].toLowerCase();
        const monitoringTypeUrls = this.systemMonitoringUrls[monitoringTypeName];

        return monitoringTypeUrls[monitoringItem];
    }

    getEventsLog(params = new PaginationParams(), filtrationParams?: EventsLogRequestParams): Observable<IPaginationResponse<IEventsLogItem>> {
        return this._http.get<IPaginationResponse<IEventsLogItem>>(`${AppConfigService.apiUrls.eventsLogREST}`, {
            params: QueryParamsConstructor.fromObjects(params.toSkipTake(), filtrationParams)
        }).pipe(
            toBasePaginationResponse(CollectionResponseType.DataCount)
        );
    }

    getFiltrationParameters(): Observable<IEventLogFiltrationParams> {
        return this._http.get<IEventLogFiltrationParams>(`${AppConfigService.apiUrls.eventsLogREST}filtration-params`);
    }

    checkStatus(url: string): Observable<ServiceHealthStatusResponse> {
        return this._http.get<ServiceHealthStatusResponse>(`${url}health-check`);
    }
}

