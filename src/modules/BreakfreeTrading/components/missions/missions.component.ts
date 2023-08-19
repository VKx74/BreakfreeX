import { Component, Injector, OnInit } from '@angular/core';
import { Modal } from "Shared";
import { IdentityService } from '@app/services/auth/identity.service';
import { IBFTMissions, TradingProfileService } from 'modules/BreakfreeTrading/services/tradingProfile.service';
import { UsersProfileService } from '@app/services/users-profile.service';
import { MissionTrackingService } from '@app/services/missions-tracking.service';

enum Ranks {
    Newbie = "Newbie",
    Bronze = "Bronze",
    Silver = "Silver",
    Gold = "Gold",
    Platinum = "Platinum",
    Master = "Master",
    Legend = "Legend"
}

enum Sections {
    Daily = "Daily Quests",
    Weekly = "Weekly Quests",
    Info = "Ranks",
    TradeGuard = "TradeGuard",
    Analysis = "Trading Analysis",
    LeaderDashboard = "Leaderboard"
}

@Component({
    selector: 'missions-component',
    templateUrl: './missions.component.html',
    styleUrls: ['./missions.component.scss']
})
export class MissionsComponent extends Modal<MissionsComponent> implements OnInit {
    private _name: string;
    private _timeInterval: any;
    private _timeToUpdate: string;

    public Sections = Sections;
    public Ranks: any = Ranks;
    public selectedSection = Sections.Analysis;

    public get missions(): IBFTMissions {
        return this._tradingProfileService.missions;
    }

    public get rank(): Ranks {
        return this._tradingProfileService.levelName as Ranks;
    }

    public get score(): number {
        return this._tradingProfileService.score;
    }

    public get scoreForLevel(): number {
        return this._tradingProfileService.scoreForLevel;
    }

    public get level(): number {
        return this._tradingProfileService.level;
    }

    public get name(): string {
        return this._name;
    }

    public get timeToUpdate(): string {
        return this._timeToUpdate;
    }

    constructor(private _injector: Injector,
                private _identityService: IdentityService,
                private _profileService: UsersProfileService,
                private _tradingProfileService: TradingProfileService,
                private _missionTrackingService: MissionTrackingService) {
        super(_injector);
        this._updateTimer();
    }

    selectPeriod(period: Sections) {
        this.selectedSection = period;
    }

    ngOnInit() {
        this._profileService.getUserProfileById(this._identityService.id, true)
        .subscribe(
            data => {
                if (data && data.userName) {
                    this._name = data.userName;
                } else {
                    this._name = `${this._identityService.firstName} ${this._identityService.lastName}`;
                }
            });

        this._timeInterval = setInterval(() => {
            this._updateTimer();
        }, 1000);
    }

    ngAfterViewInit() {
    }

    ngOnDestroy() {
        if (this._timeInterval) {
            clearInterval(this._timeInterval);
        }
    }   
    
    onClose() {
        this.close();
    }

    selectedSectionTitle(): string {
        switch (this.selectedSection) {
            case Sections.LeaderDashboard: return "TOP 50 XP Leaderboard";
            default: return this.selectedSection;
        }
    }

    private _updateTimer() {
        let diff = (this._missionTrackingService.nextUpdateTime - new Date().getTime()) / 1000;
        let minutes = Math.trunc(diff / 60);
        let seconds = Math.trunc(diff - (minutes * 60)).toString();
        if (seconds.length < 2) {
            seconds = `0${seconds}`;
        }
        this._timeToUpdate = `${minutes}:${seconds}`;
    }
}
