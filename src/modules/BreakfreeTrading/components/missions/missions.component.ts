import {Component, Inject, Injector, OnInit, ViewChild} from '@angular/core';
import {Modal} from "Shared";
import {ThemeService} from "@app/services/theme.service";
import {LocalizationService} from "Localization";
import {LayoutTranslateService} from "@layout/localization/token";
import {TranslateService} from "@ngx-translate/core";
import {InstrumentService} from "@app/services/instrument.service";
import {RealtimeService} from "@app/services/realtime.service";
import {HistoryService} from "@app/services/history.service";
import {UserSettingsService} from "@app/services/user-settings/user-settings.service";
import {ActivatedRoute} from "@angular/router";
import {ApplicationTypeService} from "@app/services/application-type.service";
import {GoldenLayoutPopupComponent} from "angular-golden-layout";
import { IdentityService } from '@app/services/auth/identity.service';
import { IBFTMissions, TradingProfileService } from 'modules/BreakfreeTrading/services/tradingProfile.service';
import { AccountInfoModel, PersonalInfoService } from '@app/services/personal-info/personal-info.service';
import { IPersonalInfoData } from 'modules/Admin/components/app-member-info/app-member-info.component';

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
