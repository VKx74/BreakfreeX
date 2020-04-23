import {Component, OnInit} from '@angular/core';
import {ApplicationType} from "@app/enums/ApplicationType";
import {Theme} from "@app/enums/Theme";
import {map} from "rxjs/operators";
import {TranslateService} from "@ngx-translate/core";
import {ThemeService} from "@app/services/theme.service";
import {BrokerService} from "@app/services/broker.service";
import {LocalizationService} from "Localization";
import {ApplicationTypeService} from "@app/services/application-type.service";
import {UserSettings, UserSettingsService} from "@app/services/user-settings/user-settings.service";
import {MatDialog} from "@angular/material/dialog";
import {ConfirmModalComponent} from "UI";
import {AppRoutes} from "AppRoutes";
import {LandingRoutes} from "../../../Landing/landing.routes";
import {AppTranslateService} from "@app/localization/token";
import {ADMIN_ITEMS, ComponentAccessService} from "@app/services/component-access.service";
import {Roles} from "@app/models/auth/auth.models";
import {IdentityService} from "@app/services/auth/identity.service";

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
    applicationType$ = this._applicationTypeService.applicationTypeChanged;
    appTypes = [ApplicationType.Forex, ApplicationType.Crypto];
    selectedApplicationType: ApplicationType;
    Theme = Theme;
    AppRoutes = AppRoutes;
    LandingRoutes = LandingRoutes;
    role: string;
    appTypeCaption = (appType: ApplicationType) => this._translateService.get(`footer.${appType}`)
        .pipe(map(caption => caption.toUpperCase()))

    constructor(private _translateService: TranslateService,
                private _themeService: ThemeService,
                private _brokerService: BrokerService,
                private _localizationService: LocalizationService,
                private _applicationTypeService: ApplicationTypeService,
                private _userSettingsService: UserSettingsService,
                private _dialog: MatDialog,
                private _identityService: IdentityService,
                ) {
    }

    ngOnInit() {
        this.selectedApplicationType = this._applicationTypeService.applicationType;
        this.role = this._identityService.role;
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
