import {Component, OnInit} from '@angular/core';
import {TranslateService} from "@ngx-translate/core";
import {SettingsTranslateService} from "../../../broker/localization/token";
import {ThemeService} from "@app/services/theme.service";
import {MatDialog} from "@angular/material/dialog";
import {Theme} from "@app/enums/Theme";
import {LocalizationService} from "Localization";
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
    Theme = Theme;

    constructor(private _translateService: TranslateService,
                private _themeService: ThemeService,
                private _localizationService: LocalizationService,
                private _userSettingsService: UserSettingsService,
                private _dialog: MatDialog) {
    }

    ngOnInit() {
    }

    save() {
        const settings: UserSettings = {
            theme: this._themeService.activeTheme,
            locale: this._localizationService.locale
        } as UserSettings;

        this._userSettingsService.saveSettings(settings, true)
            .subscribe();
    }
}
