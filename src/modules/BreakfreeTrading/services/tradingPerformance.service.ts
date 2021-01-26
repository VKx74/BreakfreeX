import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { AppConfigService } from "@app/services/app.config.service";
import { Observable } from "rxjs";

export enum Period {    
    Last7Days = "Last7Days",
    Last30Days = "Last30Days",
    Last90Days = "Last90Days"
}

export class UserTradingPerformanceData {
    public cumulativePnL: {[key: number]: number};
    public dailyPnL: {[key: number]: number};
    public balanceHistory: {[key: number]: number};
    public accCurency: string;
}

export class UserTradingPerformAdditionalData {    
    public accCurency: string;
    public estBalance: number;    
    public estBalanceUSD: number;
    public dailyPnLVal: number;
    public dailyPnLValPercent: number;
    public monthlyPnLVal: number;
    public monthlyPnLValPercent: number;
}

@Injectable()
export class TradingPerformanceService {
    private url: string;

    constructor(private  _http: HttpClient) {
        this.url = AppConfigService.config.apiUrls.bftTradingProfilesREST;
        // this.url = "http://localhost:5000/";
    }

    public getBalanceHistory(mtLogin: string, mtPlatform: string, period: Period = Period.Last30Days): Observable<any> {
        return this._http.get(`${this.url}UserStats/BalanceHistory`, {params: {
            mtLogin: mtLogin,
            platform: mtPlatform,
            period: period
        }});
    }
    
    public getWeeklyPnLHistory(mtLogin: string, mtPlatform: string): Observable<any> {
        return this._http.get(`${this.url}UserStats/WeeklyPnL`, {params: {
            mtLogin: mtLogin,
            platform: mtPlatform
        }});
    }

    public getTradingPerformance(mtLogin: string, mtPlatform: string, period: Period): Observable<UserTradingPerformanceData> {
        return this._http.get<UserTradingPerformanceData>(`${this.url}UserStats/TradingPerformance`, {params: {
            mtLogin: mtLogin,
            platform: mtPlatform,
            period: period
        }});
    }

    public getTradingPerformanceAdditionalParams(mtLogin: string, mtPlatform: string): Observable<UserTradingPerformAdditionalData> {
        return this._http.get<UserTradingPerformAdditionalData>(`${this.url}UserStats/TradingPerformanceAdditional`, {params: {
            mtLogin: mtLogin,
            platform: mtPlatform            
        }});
    }
}