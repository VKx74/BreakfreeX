import { Component, OnInit } from '@angular/core';
import { Theme } from "@app/enums/Theme";
import { TranslateService } from "@ngx-translate/core";
import { ThemeService } from "@app/services/theme.service";
import { LocalizationService } from "Localization";
import { UserSettings, UserSettingsService } from "@app/services/user-settings/user-settings.service";
import { MatDialog } from "@angular/material/dialog";
import { AppRoutes } from "AppRoutes";
import { LandingRoutes } from "../../../Landing/landing.routes";
import { AppTranslateService } from "@app/localization/token";
import { ADMIN_ITEMS, ComponentAccessService } from "@app/services/component-access.service";
import { Roles } from "@app/models/auth/auth.models";
import { IdentityService } from "@app/services/auth/identity.service";
import { Intercom } from 'ng-intercom';
import { Store } from "@ngrx/store";
import { AppState } from "@app/store/reducer";
import { ClearSessionAction } from '@app/store/actions/platform.actions';

@Component({
    selector: 'platform-sidebar',
    templateUrl: './platform-sidebar.component.html',
    styleUrls: ['./platform-sidebar.component.scss', '../../../sidebar/styles/sidebar.scss'],
    providers: [
        {
            provide: TranslateService,
            useExisting: AppTranslateService,
        },
    ]
})
export class PlatformSidebarComponent implements OnInit {
    Theme = Theme;
    AppRoutes = AppRoutes;
    LandingRoutes = LandingRoutes;
    role: string;

    public get isGuest(): boolean {
        return this._identityService.isGuestMode;
    }

    constructor(private _translateService: TranslateService,
        private _themeService: ThemeService,
        private _localizationService: LocalizationService,
        private _userSettingsService: UserSettingsService,
        private _dialog: MatDialog,
        private _intercom: Intercom,
        private _store: Store<AppState>,
        private _identityService: IdentityService,
    ) {
    }

    ngOnInit() {
        this.role = this._identityService.role;
        // Set download link  
        let userAgent = window.navigator.userAgent,
            platform = window.navigator.platform,
            macosPlatforms = ['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K'],
            windowsPlatforms = ['Win32', 'Win64', 'Windows', 'WinCE'],
            iosPlatforms = ['iPhone', 'iPad', 'iPod'],
            os = null;

        if (macosPlatforms.indexOf(platform) !== -1) {
            document.getElementById('downloadlink').setAttribute('href', '/assets/Navigator_1.1_OSX.zip');

        } else if (iosPlatforms.indexOf(platform) !== -1) {

        } else if (windowsPlatforms.indexOf(platform) !== -1) {
            document.getElementById('downloadlink').setAttribute('href', '/assets/Navigator_1.1_WIN.zip');
        }
    }

    supportClick() {
        this._intercom.show();
    }

    clearSession() {
        this._store.dispatch(new ClearSessionAction());
    }

    chartClick() {
        if (this.isGuest) {
            window.location.href = "/";
        }
    }

    save() {
        const settings: UserSettings = {
            theme: this._themeService.activeTheme,
            locale: this._localizationService.locale,
        } as UserSettings;

        this._userSettingsService.saveSettings(settings, true)
            .subscribe();
    }

    get isAdminPanelShown() {
        const role = this.role;
        return ComponentAccessService.isAccessibleComponentsArray(ADMIN_ITEMS)
            && (role === Roles.Admin
                || role === Roles.KYCOfficer
                || role === Roles.NewsOfficer
                || role === Roles.SocialMediaOfficer
                || role === Roles.SupportOfficer
                || role === Roles.SystemMonitoringOfficer);
    }
}

