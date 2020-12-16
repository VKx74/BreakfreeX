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

export interface IBFTMission {
    internalId: string;
    name: string;
    requiredValue: number;
    currentValue: number;
    points: number;
    wasJustReached: boolean;
}

export interface IBFTMissions {
    daily: IBFTMission[];
    weekly: IBFTMission[];
    level: number;
    levelName: string;
    levelPoints: number;
    totalPoints: number;
    nextLevelPoints: number;
    calculationTimestamp: number;
}

@Injectable()
export class TradingProfileService {
    private url: string;
    private _missions: IBFTMissions;
    private _callbacks: (() => void)[] = [];
    private _loading: boolean = false;
    private _canLoad: boolean = true;
    private _timeInterval: number = 1000 * 60 * 10; // 10 min
    
    public get missions(): IBFTMissions {
        return this._missions;
    } 
    
    public get levelName(): string {
        if (!this.missions) {
            return null;
        }
        
        return this._missions.levelName;
    }  
    
    public get scoreForLevel(): number {
        if (!this.missions) {
            return 0;
        }
        
        return this._missions.nextLevelPoints;
    } 
    
    public get score(): number {
        if (!this.missions) {
            return 0;
        }

        return this._missions.levelPoints;
    }
    
    public get level(): number {
        if (!this.missions) {
            return 0;
        }
        
        return this._missions.level;
    }

    constructor(private _http: HttpClient) {
        this.url = AppConfigService.config.apiUrls.bftTradingProfilesREST;
    }

    setProcessedState() {
        if (!this.missions) {
            return;
        }

        if (this.missions.daily) {
            for (const mission of this.missions.daily) {
                if (mission.wasJustReached) {
                    mission.wasJustReached = false;
                }
            }
        }


        if (this.missions.weekly) {
            for (const mission of this.missions.weekly) {
                if (mission.wasJustReached) {
                    mission.wasJustReached = false;
                }
            }
        }
    }

    updateMissions(callback: () => void = null) {
        if (callback) {
            this._callbacks.push(callback);
        }

        if (!this._canLoad) {
            if (!this._loading) {
                this._raiseCallbacks();
            }
            return;
        }

        this._loading = true;
        this._canLoad = false;
        this._getTradingMissions().subscribe((data: IBFTMissions) => {
            this._missions = data;
            // this._missions.daily.forEach((v) => v.wasJustReached = true);
            this._raiseCallbacks();
            this._loading = false;
            setTimeout(() => {
                this._canLoad = true;
            }, this._timeInterval);
        }, () => {
            this._raiseCallbacks();
            this._loading = false;
            setTimeout(() => {
                this._canLoad = true;
            }, this._timeInterval);
        });
    } 

    private _raiseCallbacks() {
        for (const c of this._callbacks) {
            if (c) {
                try {
                    c();
                } catch (error) {}
            }
        }
        this._callbacks = [];
    }

    private _getTradingMissions(): Observable<IBFTMissions> {
        return this._http.get<IBFTMissions>(`${this.url}UserStats/Missions`);
    }
}