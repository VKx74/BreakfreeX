import {Injectable} from "@angular/core";
import {Locale, LocalizationService} from "Localization";
import {LocalTimeZone, TimeZone, TimeZoneManager, TimeZones} from "TimeZones";
import {Theme} from "../../enums/Theme";
import {Observable, of, throwError} from "rxjs";
import {IRSSFeed} from "../../../modules/News/models/models";
import {IdentityService} from "../auth/identity.service";
import {LocalStorageService} from "Storage";
import {ThemeService} from "../theme.service";
import {delay, map, tap} from "rxjs/operators";
import {NewsConfigService} from "../../../modules/News/services/news.config.service";
import {ApplicationType} from "../../enums/ApplicationType";
import {ApplicationTypeService} from "../application-type.service";
import {EducationalTipsService} from "@app/services/educational-tips.service";
import set = Reflect.set;

export interface UserSettingsDTO {
    locale: Locale;
    timeZoneId: string;
    theme: Theme;
    rssFeedId: String;
    applicationType: ApplicationType;
    showTips: boolean;
}

export interface UserSettings {
    locale?: Locale;
    timeZone?: TimeZone;
    theme?: Theme;
    rssFeed?: IRSSFeed;
    applicationType?: ApplicationType;
    showTips?: boolean;
}

@Injectable()
export class UserSettingsService {
    private _settings: UserSettings;

    constructor(private _identityService: IdentityService,
                private _timeZoneManager: TimeZoneManager,
                private _localizationService: LocalizationService,
                private _themeService: ThemeService,
                private _tipsService: EducationalTipsService,
                private _newsConfigService: NewsConfigService,
                private _applicationTypeService: ApplicationTypeService,
                private _localStorageService: LocalStorageService) {
    }

    getSettings(): Observable<UserSettings> {
        return this._getSettings()
            .pipe(
                map((settings: UserSettings) => {
                    this._settings = settings;
                    return settings;
                })
            );
    }

    defaultSettings(): Observable<UserSettings> {
        return this._newsConfigService.getAvailableFeeds()
            .pipe(
                map((feeds: IRSSFeed[]) => {
                    return {
                        locale: Locale.EN,
                        timeZone: LocalTimeZone,
                        theme: Theme.Dark,
                        rssFeed: feeds[0],
                        showTips: false,
                        applicationType: ApplicationType.Crypto
                    };
                })
            );
    }

    private _getSettings(): Observable<UserSettings> {
        const storedSettings: UserSettingsDTO = this._getFromStorage();

        if (storedSettings) {
            return this._convertDTO(storedSettings);
        }

        return this.defaultSettings();
    }

    saveSettings(settings: UserSettings, merge: boolean = false): Observable<UserSettings> {
        if (merge) {
            settings = {...this._settings, ...settings};
        }

        if (this._saveToStorage(settings) !== false) {
            this._settings = settings;

            return of(this._settings)
                .pipe(
                    delay(1000),
                    tap(() => {
                        this.applySettings(this._settings);
                    })
                );
        }

        return throwError('Failed to save settings');
    }

    applySettings(settings: UserSettings) {
        this._timeZoneManager.setTimeZone(settings.timeZone);
        this._themeService.setActiveTheme(settings.theme);
        this._tipsService.changeShowTips(settings.showTips);
        this._localizationService.setLocale(settings.locale);
        this._newsConfigService.setDefaultFeed(settings.rssFeed);
        this._applicationTypeService.setApplicationType(settings.applicationType);
    }

    private _convertDTO(dto: UserSettingsDTO): Observable<UserSettings> {
        return this._newsConfigService.getAvailableFeeds()
            .pipe(
                map((feeds: IRSSFeed[]) => {
                    return {
                        locale: dto.locale,
                        timeZone: TimeZones.find(t => t.id === dto.timeZoneId) || LocalTimeZone,
                        theme: dto.theme,
                        showTips: dto.showTips,
                        rssFeed: feeds.find(f => f.id === dto.rssFeedId) || feeds[0],
                        applicationType: dto.applicationType
                    };
                })
            );
    }

    private _saveToStorage(settings: UserSettings) {
        return this._localStorageService.set(this._getStorageKey(), {
            locale: settings.locale,
            timeZoneId: settings.timeZone ? settings.timeZone.id : "",
            theme: settings.theme,
            rssFeedId: settings.rssFeed ? settings.rssFeed.id : "",
            showTips: settings.showTips,
            applicationType: settings.applicationType
        } as UserSettingsDTO);
    }

    private _getFromStorage(): UserSettingsDTO {
        return this._localStorageService.get(this._getStorageKey());
    }

    private _getStorageKey(): string {
        return `userSettings_${this._identityService.id}`;
    }
}
