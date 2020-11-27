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

    constructor(private _injector: Injector, private _identityService: IdentityService) {
        super(_injector);
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
