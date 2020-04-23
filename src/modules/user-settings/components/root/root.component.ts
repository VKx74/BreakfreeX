import {Component, OnInit} from '@angular/core';
import {UserSettingsRoutes} from '../../user-settings.routes';
import {InstrumentService} from "@app/services/instrument.service";
import {ApplicationTypeService} from "@app/services/application-type.service";
import {ApplicationType} from "@app/enums/ApplicationType";
import {TranslateService} from "@ngx-translate/core";
import {AppTranslateService} from "@app/localization/token";
import {INavLinkTabDescriptor} from "../../../ViewModules/wrapper/wrapper.component";
import {filter, map} from "rxjs/operators";
import {NavigationEnd, NavigationError, NavigationStart, Router} from "@angular/router";
import {LoaderService} from "@app/services/loader.service";
import {ThemeService} from "@app/services/theme.service";

@Component({
    selector: 'user-settings',
    templateUrl: './root.component.html',
    styleUrls: ['./root.component.scss'],
    providers: [
        {
            provide: TranslateService,
            useExisting: AppTranslateService
        }
    ]
})
export class RootComponent implements OnInit {
    applicationType$ = this._appTypeService.applicationTypeChanged;
    applicationType: ApplicationType;
    appTypeForex$ = this.applicationType$.pipe(
        map(type => type === ApplicationType.Forex)
    );
    tabs: INavLinkTabDescriptor[] = [
        {
            name: 'deposits',
            url: UserSettingsRoutes.Deposits,
            disabled: this.appTypeForex$,
        },
        {
            name: 'withdraws',
            url: UserSettingsRoutes.Withdraws,
            disabled: this.appTypeForex$,
        },
        {
            name: 'trades',
            url: UserSettingsRoutes.Trades,
            disabled: this.appTypeForex$,
        },
        {
            name: 'profile',
            url: UserSettingsRoutes.Profile,
        },
        {
            name: 'activities',
            url: UserSettingsRoutes.Activities,
        },
        {
            name: 'loginActivities',
            url: UserSettingsRoutes.LoginActivities,
        },
    ];

    constructor(private _instrumentService: InstrumentService,
                private _router: Router,
                private _loaderService: LoaderService,
                private _appTypeService: ApplicationTypeService,
                ) {
    }

    ngOnInit() {
        // this._router
        //     .events
        //     .pipe(
        //         filter(e => e instanceof NavigationStart ||
        //             e instanceof NavigationEnd ||
        //             e instanceof NavigationError)
        //     ).subscribe(e => {
        //         if (e instanceof NavigationStart) {
        //             this._loaderService.show();
        //         } else {
        //             this._loaderService.hide();
        //         }
        // });
        // this._instrumentService.init();
        // this._appTypeService
        //     .applicationTypeChanged
        //     .subscribe(type => {
        //         if (type) {
        //             applicationType = type;
        //         }
        //     })
    }

}
