import {Component, Inject, OnInit, ViewChild} from '@angular/core';
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

@Component({
    selector: 'popup-window-root',
    templateUrl: './popup-window-root.component.html',
    styleUrls: ['./popup-window-root.component.scss']
})
export class PopupWindowRootComponent implements OnInit {
    @ViewChild(GoldenLayoutPopupComponent, {static: false}) layoutPopup: GoldenLayoutPopupComponent;

    constructor(private _themeService: ThemeService,
                private _localizationService: LocalizationService,
                private _instrumentService: InstrumentService,
                private _realtimeService: RealtimeService,
                private _historyService: HistoryService,
                private _userSettingsService: UserSettingsService,
                private _route: ActivatedRoute,
                private _applicationTypeService: ApplicationTypeService,
                @Inject(LayoutTranslateService) private _layoutTranslateService: TranslateService) {

        this._themeService.setupElementCssClasses(document.body);
        this._localizationService.setupMomentLocale(moment);
    }

    ngOnInit() {
        let applicationType = this._route.snapshot.data['userSettings'].applicationType;

        this._applicationTypeService.setApplicationType(applicationType);

    }

    ngAfterViewInit() {
    }

    ngOnDestroy() {

    }
}
