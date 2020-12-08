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

enum MissionPeriod {
    Daily,
    Weekly
}

@Component({
    selector: 'missions-component',
    templateUrl: './missions.component.html',
    styleUrls: ['./missions.component.scss']
})
export class MissionsComponent extends Modal<MissionsComponent> implements OnInit {
    public MissionPeriod = MissionPeriod;
    public selectedMissionPeriod = MissionPeriod.Daily;

    public get missions(): IBFTMissions {
        return this._tradingProfileService.missions;
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

    constructor(private _injector: Injector,
                private _identityService: IdentityService,
                private _tradingProfileService: TradingProfileService) {
        super(_injector);
        this._tradingProfileService.updateMissions();
    }

    selectPeriod(period: MissionPeriod) {
        this.selectedMissionPeriod = period;
    }

    ngOnInit() {
    }

    ngAfterViewInit() {
    }

    ngOnDestroy() {
    }
}
