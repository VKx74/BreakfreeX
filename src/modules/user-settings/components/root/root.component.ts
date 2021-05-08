import { Component, OnInit } from '@angular/core';
import { UserSettingsRoutes } from '../../user-settings.routes';
import { InstrumentService } from "@app/services/instrument.service";
import { TranslateService } from "@ngx-translate/core";
import { AppTranslateService } from "@app/localization/token";
import { INavLinkTabDescriptor } from "../../../ViewModules/wrapper/wrapper.component";
import { Router } from "@angular/router";
import { LoaderService } from "@app/services/loader.service";

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
    tabs: INavLinkTabDescriptor[] = [
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
        private _loaderService: LoaderService
    ) {
    }

    ngOnInit() {
    }

}
