import {Component, OnInit} from '@angular/core';
import {ApplicationType} from "@app/enums/ApplicationType";
import {ConfirmModalComponent} from "../../../UI/components/confirm-modal/confirm-modal.component";
import {TranslateService} from "@ngx-translate/core";
import {SettingsTranslateService} from "../../../broker/localization/token";
import {ThemeService} from "@app/services/theme.service";
import {MatDialog} from "@angular/material/dialog";
import {map} from "rxjs/operators";
import {Theme} from "@app/enums/Theme";
import {ApplicationTypeService} from "@app/services/application-type.service";
import {LocalizationService} from "Localization";
import {BrokerService} from "@app/services/broker.service";
import {UserSettings, UserSettingsService} from "@app/services/user-settings/user-settings.service";

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.scss', '../../styles/sidebar.scss'],
    providers: [
        {
            provide: TranslateService,
            useExisting: SettingsTranslateService
        }
    ]
})
export class SidebarComponent implements OnInit {
    applicationType$ = this._applicationTypeService.applicationTypeChanged;
    appTypes = [ApplicationType.Forex, ApplicationType.Crypto, ApplicationType.Stock, ApplicationType.All];
    selectedApplicationType: ApplicationType;
    Theme = Theme;
    appTypeCaption = (appType: ApplicationType) => this._translateService.get(`generalSettings.${appType}`)
        .pipe(map(caption => caption.toUpperCase()))

    constructor(private _translateService: TranslateService,
                private _themeService: ThemeService,
                private _brokerService: BrokerService,
                private _localizationService: LocalizationService,
                private _applicationTypeService: ApplicationTypeService,
                private _userSettingsService: UserSettingsService,
                private _dialog: MatDialog) {
    }

    ngOnInit() {
        this.selectedApplicationType = this._applicationTypeService.applicationType;
    }

    setApplicationType(type: ApplicationType) {
        const prev = this.selectedApplicationType;
        this.selectedApplicationType = type;
        this._dialog.open(ConfirmModalComponent, {
            data: {
                message: this._translateService.get(`changeAppTypeConfirmation`)
            }
        } as any)
            .afterClosed()
            .subscribe((isConfirmed) => {
                if (!isConfirmed) {
                    this.selectedApplicationType = prev;
                } else {
                    this._applicationTypeService.setApplicationType(type);
                    this.save();
                }
            });
    }

    save() {
        const settings: UserSettings = {
            theme: this._themeService.activeTheme,
            locale: this._localizationService.locale,
            // timeZone: generalSettingsComponentValues.timeZone,
            // showTips: generalSettingsComponentValues.showTips,
            applicationType: this._applicationTypeService.applicationType,
        } as UserSettings;

        this._userSettingsService.saveSettings(settings, true)
            .subscribe();
    }
}
