import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppConfigService } from '@app/services/app.config.service';
import { Observable } from 'rxjs';

export interface IBFTTradingProfile {
    accountsCount: number;
    total: number;
    totalActivated: number;
    totalBridged: number;
    totalBridgedActivated: number;
    totalBridgedProfitable: number;
    totalProfitable: number;
}

@Injectable()
export class TradingProfileService {
    private url: string;
    private _scoreForOrder = 5;
    private _scoreForProfitableOrder = 20;
    private _scoreForLevel = 100;
    private _userScore = 0;

    public get scoreForOrder(): number {
        return this._scoreForOrder;
    }
    
    public get scoreForProfitableOrder(): number {
        return this._scoreForProfitableOrder;
    }
    
    public get scoreForLevel(): number {
        return this._scoreForLevel;
    } 
    
    public get userScore(): number {
        return this._userScore;
    } 
    
    public get score(): number {
        return this._userScore % this._scoreForLevel;
    }
    
    public get level(): number {
        return Math.floor(this._userScore / this._scoreForLevel) + 1;
    }

    constructor(private _http: HttpClient) {
        this.url = AppConfigService.config.apiUrls.bftTradingProfilesREST;
    }

    updateTradingProfile() {
        // this._getTradingProfile().subscribe((data: IBFTTradingProfile) => {
        //     this._updateTradingProfile(data);
        // });
    } 
    
    private _updateTradingProfile(data: IBFTTradingProfile) {
        this._userScore = 0;
        this._userScore += data.totalBridgedActivated * this._scoreForOrder;
        this._userScore += data.totalBridgedProfitable * this._scoreForProfitableOrder;
    }

    private _getTradingProfile(): Observable<IBFTTradingProfile> {
        return this._http.get<IBFTTradingProfile>(`${this.url}UserStats/OrderPerformance`);
    }
}