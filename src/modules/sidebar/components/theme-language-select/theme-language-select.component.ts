import {Component, OnInit} from '@angular/core';
import {ILanguageOption} from "../language-select/language-select.component";
import {Theme} from "@app/enums/Theme";
import {LocalizationService} from "Localization";
import {UserSettings, UserSettingsService} from "@app/services/user-settings/user-settings.service";
import {ThemeService} from "@app/services/theme.service";
import {TranslateService} from "@ngx-translate/core";
import {SettingsTranslateService} from "../../../broker/localization/token";

@Component({
    selector: 'theme-language-select',
    templateUrl: './theme-language-select.component.html',
    styleUrls: ['./theme-language-select.component.scss'],
    providers: [
        {
            provide: TranslateService,
            useExisting: SettingsTranslateService,
        },
    ]
})
export class ThemeLanguageSelectComponent implements OnInit {
    activeTheme$ = this._themeService.activeThemeChange$;
    activeLocale$ = this._localizationService.localeChange$;
    Theme = Theme;

    constructor(private _localizationService: LocalizationService,
                private _themeService: ThemeService,
                private _userSettingsService: UserSettingsService) {
    }

    ngOnInit() {
    }

    onLanguageChange(language: ILanguageOption) {
        this._localizationService.setLocale(language.locale);
        this.save();
    }

    onThemeToggle(event) {
        const theme = event.checked ? Theme.Dark : Theme.Light;
        this._themeService.setActiveTheme(theme);
        this.save();
    }

    save() {
        const settings: UserSettings = {
            theme: this._themeService.activeTheme,
            locale: this._localizationService.locale,
        } as UserSettings;

        this._userSettingsService.saveSettings(settings, true)
            .subscribe();
    }
}
