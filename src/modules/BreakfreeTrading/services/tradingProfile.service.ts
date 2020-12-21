import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppConfigService } from '@app/services/app.config.service';
import { Observable, Subject } from 'rxjs';

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
    faileDescription: string;
    requiredValue: number;
    currentValue: number;
    points: number;
    wasJustReached: boolean;
    conditionsFailed: boolean;
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
    private _canLoad: boolean = true;
    private _timeInterval: number = 1000 * 60 * 10; // 10 min

    public MissionChanged: Subject<void> = new Subject();
    
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

    initMissions() {
        this._getTradingMissions().subscribe((data: IBFTMissions) => {
            this._missions = data;
            this._raiseCallbacks();
        }, () => {
        });
    }

    updateMissions(varRisk: number) {
        this._updateTradingMissions(varRisk).subscribe((data: IBFTMissions) => {
            this._missions = data;
            this._raiseCallbacks();
        }, () => {
        });
    } 

    private _raiseCallbacks() {
        this.MissionChanged.next();
    }

    private _updateTradingMissions(varRisk: number): Observable<IBFTMissions> {
        return this._http.post<IBFTMissions>(`${this.url}UserStats/Missions`, {
            var: varRisk
        });
    }

    private _getTradingMissions(): Observable<IBFTMissions> {
        return this._http.get<IBFTMissions>(`${this.url}UserStats/Missions`);
    }
}