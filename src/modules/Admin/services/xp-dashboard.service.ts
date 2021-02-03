import {Injectable} from '@angular/core';
import {Observable, of} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {AppConfigService} from "@app/services/app.config.service";
import {PaginationResponse, PaginationParams, IPaginationResponse} from "@app/models/pagination.model";
import {map} from "rxjs/operators";
import { XPDashboardItemDTO } from '../data/xp-dashboard/models';
import { QueryParamsConstructor } from '../data/models';

@Injectable({
    providedIn: 'root'
})
export class XPDashboardService {
    readonly URL = `${AppConfigService.config.apiUrls.bftTradingProfilesREST}generalstats/QuestsLeaderBoard`;

    constructor(private _http: HttpClient) {
    }

    getXPDashboard(paginationParams = new PaginationParams(0, 50)): Observable<IPaginationResponse<XPDashboardItemDTO>> {
        return this._http.get<IPaginationResponse<XPDashboardItemDTO>>(`${this.URL}`, {
            params: QueryParamsConstructor.fromObjects(paginationParams.toSkipTake())
        }).pipe(map((response: any) => {
            return {
                items: response.data,
                total: response.total
            };
        }));
    }
}
