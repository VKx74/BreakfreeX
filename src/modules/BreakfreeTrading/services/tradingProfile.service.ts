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

export interface IBFTDailyMission {
    internalId: string;
    name: string;
    requiredValue: number;
    currentValue: number;
    points: number;
}

export interface IBFTWeeklyMission {
    internalId: string;
    name: string;
    requiredValue: number;
    currentValue: number;
    points: number;
}

export interface IBFTMissions {
    daily: IBFTDailyMission[];
    weekly: IBFTWeeklyMission[];
    totalPoints: number;
    calculationTimestamp: number;
}

@Injectable()
export class TradingProfileService {
    private url: string;
    private _scoreForLevel = 1000;
    private _missions: IBFTMissions;
    
    public get missions(): IBFTMissions {
        return this._missions;
    } 
    
    public get scoreForLevel(): number {
        return this._scoreForLevel;
    } 
    
    public get userScore(): number {
        if (!this.missions) {
            return 0;
        }

        return this.missions.totalPoints;
    } 
    
    public get score(): number {
        return this.userScore % this._scoreForLevel;
    }
    
    public get level(): number {
        return Math.floor(this.userScore / this._scoreForLevel) + 1;
    }

    constructor(private _http: HttpClient) {
        this.url = AppConfigService.config.apiUrls.bftTradingProfilesREST;
    }

    updateMissions() {
        this._getTradingMissions().subscribe((data: IBFTMissions) => {
            this._missions = data;
        });
    } 

    private _getTradingMissions(): Observable<IBFTMissions> {
        return this._http.get<IBFTMissions>(`${this.url}UserStats/Missions`);
    }
}