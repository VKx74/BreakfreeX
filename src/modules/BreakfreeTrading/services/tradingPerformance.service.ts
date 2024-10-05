import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { AppConfigService } from "@app/services/app.config.service";
import { Observable, of } from "rxjs";
import { map } from "rxjs/operators";

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
    public accCurencySign: string;
}

export class LeaderDashboardItem {
    level: number;
    levelName: string;
    userId: string;
    userName: string;
}

@Injectable()
export class TradingPerformanceService {
    private _cachedLeaderBoard: LeaderDashboardItem[];
    private url: string;

    constructor(private  _http: HttpClient) {
        this.url = AppConfigService.config.apiUrls.bftTradingProfilesREST;
        // this.url = "http://localhost:5000/";
    }

    // public getBalanceHistory(mtLogin: string, mtPlatform: string, period: Period = Period.Last30Days): Observable<any> {
    //     return this._http.get(`${this.url}UserStats/BalanceHistory`, {params: {
    //         mtLogin: mtLogin,
    //         platform: mtPlatform,
    //         period: period
    //     }});
    // }
    
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

    // public getPublicQuestsLeaderBoard(useCache: boolean = false): Observable<LeaderDashboardItem[]> {
    //     if (useCache && this._cachedLeaderBoard) {
    //         return of(this._cachedLeaderBoard);
    //     }
    //     return this._http.get<LeaderDashboardItem[]>(`${this.url}UserStats/PublicQuestsLeaderBoard`).pipe(map((data) => {
    //         this._cachedLeaderBoard = data;
    //         return data;
    //     }));
    // }
}