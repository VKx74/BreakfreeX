import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { AppConfigService } from "@app/services/app.config.service";
import { Observable } from "rxjs";

@Injectable()
export class TradingPerformanceService {
    private url: string;

    constructor(private  _http: HttpClient) {
        this.url = AppConfigService.config.apiUrls.bftTradingProfilesREST;
        // this.url = "http://localhost:5000/";
    }

    public getBalanceHistory(mtLogin: string, mtPlatform: string, period: string = ''): Observable<any> {
        return this._http.get(`${this.url}UserStats/BalanceHistory`, {params: {
            mtLogin: mtLogin,
            platform: mtPlatform
        }});
    }
    
    public getWeeklyPnLHistory(mtLogin: string, mtPlatform: string): Observable<any> {
        return this._http.get(`${this.url}UserStats/WeeklyPnL`, {params: {
            mtLogin: mtLogin,
            platform: mtPlatform
        }});
    }
}