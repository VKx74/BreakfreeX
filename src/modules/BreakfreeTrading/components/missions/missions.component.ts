import { Component, Injector, OnInit } from '@angular/core';
import { Modal } from "Shared";
import { IdentityService } from '@app/services/auth/identity.service';
import { IBFTMissions, TradingProfileService } from 'modules/BreakfreeTrading/services/tradingProfile.service';

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
    Info = "Info",
    TradeGuard = "Trade Guard",
    Analysis = "Profit & Loss Analysis"
}

@Component({
    selector: 'missions-component',
    templateUrl: './missions.component.html',
    styleUrls: ['./missions.component.scss']
})
export class MissionsComponent extends Modal<MissionsComponent> implements OnInit {
    public Sections = Sections;
    public Ranks: any = Ranks;
    public selectedSection = Sections.Daily;

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
        return `${this._identityService.firstName} ${this._identityService.lastName}`;
    }

    constructor(private _injector: Injector,
                private _identityService: IdentityService,
                private _tradingProfileService: TradingProfileService) {
        super(_injector);
        // this._tradingProfileService.updateMissions();
    }

    selectPeriod(period: Sections) {
        this.selectedSection = period;
    }

    ngOnInit() {
    }

    ngAfterViewInit() {
    }

    ngOnDestroy() {
    }
    
    onClose() {
        this.close();
    }
}
