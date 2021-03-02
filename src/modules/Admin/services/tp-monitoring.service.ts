import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { IPaginationResponse, PaginationParams, PaginationResponse } from "@app/models/pagination.model";
import { AppConfigService } from "@app/services/app.config.service";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { QueryParamsConstructor } from "../data/models";
import { EnumHelper, Grouping, Periods } from "../data/tp-monitoring/TPMonitoringData";
import { AlgoTradingData, DistributionData, GeneralData, MTAccountDTO, MTAccountPerformanceData, TradingData, UserBalanceResponse, UserMTAccounts, UserOrdersResponse } from "../data/tp-monitoring/TPMonitoringDTO";

@Injectable()
export class TPMonitoringService {
    // readonly URL = `${AppConfigService.config.apiUrls.bftTradingProfilesREST}generalstats/`;
    readonly URL = `http://localhost:5000/generalstats/`;
    constructor(private _http: HttpClient) {
    }

    get getUsersUrl(): string {
        return `${this.URL}Users`;
    }

    get getUserOrdersUrl(): string {
        return `${this.URL}UserOrdersHistory`;
    }

    get getUserBalanceUrl(): string {
        return `${this.URL}UserBalanceHistory`;
    }

    get getUserAccPerformanceUrl(): string {
        return `${this.URL}MTAccountPerformanceData`;
    }

    get getGeneralDataUrl(): string {
        return `${this.URL}GeneralData`;
    }

    get getDistributionDataUrl(): string {
        return `${this.URL}DistributionData`;
    }

    get getTradingDataUrl(): string {
        return `${this.URL}TradingData`;
    }

    get getAlgoTradingDataUrl(): string {
        return `${this.URL}AlgoTradingData`;
    }

    get getTradedVolumeDataUrl(): string {
        return `${this.URL}TradedVolume`;
    }

    public getGeneralData(): Observable<GeneralData> {
        return this._http.get<GeneralData>(this.getGeneralDataUrl);
    }

    public getDistributionData(): Observable<DistributionData> {
        return this._http.get<DistributionData>(this.getDistributionDataUrl);
    }

    public getTradingData(): Observable<TradingData> {
        return this._http.get<TradingData>(this.getTradingDataUrl);
    }

    public getAlgoTradingData(): Observable<AlgoTradingData> {
        return this._http.get<AlgoTradingData>(this.getAlgoTradingDataUrl);
    }

    public getTradedVolume(): Observable<{ [key: number]: number }> {
        return this._http.get<{ [key: number]: number }>(this.getTradedVolumeDataUrl);
    }

    public getUserAccountPerformanceData(userId: string, mtLogin: number, mtPlatform: string)
        : Observable<MTAccountPerformanceData> {

        let params = new HttpParams();
        params = params.append('userId', userId.toString());
        params = params.append('mtLogin', mtLogin.toString());
        params = params.append('mtPlatform', mtPlatform);

        return this._http.get<MTAccountPerformanceData>(this.getUserAccPerformanceUrl, { params: params });
    }

    public getUsers(paginationParams = new PaginationParams(0, 50), filtrationParams = {}): Observable<IPaginationResponse<UserMTAccounts>> {
        return this._http.get(this.getUsersUrl, {
            params: QueryParamsConstructor.fromObjects(paginationParams.toSkipTake(), filtrationParams), withCredentials: true
        }).pipe(
            map((r: any) => {
                return new PaginationResponse(r.data, r.total);
            })
        );
    }

    public getUserOrdersHistory(userId: string, mtLogin: number, mtPlatform: string, period: Periods,
        grouping: Grouping): Observable<UserOrdersResponse> {

        let params = new HttpParams();
        params = params.append('userId', userId.toString());
        params = params.append('mtLogin', mtLogin.toString());
        params = params.append('mtPlatform', mtPlatform);
        params = params.append('period', EnumHelper.getKeyString(period));
        params = params.append('grouping', grouping.toString());

        return this._http.get<UserOrdersResponse>(this.getUserOrdersUrl, { params: params });
    }

    public getUserBalanceHistory(userId: string, mtLogin: number, mtPlatform: string, period: Periods): Observable<UserBalanceResponse> {
        let params = new HttpParams();
        params = params.append('userId', userId.toString());
        params = params.append('mtLogin', mtLogin.toString());
        params = params.append('mtPlatform', mtPlatform);
        params = params.append('period', EnumHelper.getKeyString(period));

        return this._http.get<UserBalanceResponse>(this.getUserBalanceUrl, { params: params });
    }
}