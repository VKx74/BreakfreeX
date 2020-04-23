import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, NavigationEnd, NavigationStart, Router} from "@angular/router";
import {takeUntil} from "rxjs/operators";
import {componentDestroyed} from "@w11k/ngx-componentdestroyed";
import {ThemeService} from "@app/services/theme.service";
import {NavigationMode} from "../../../navigation/components/navigation/navigation.component";
import {UserSettingsService} from "@app/services/user-settings/user-settings.service";

@Component({
    selector: 'landing',
    templateUrl: './landing.component.html',
    styleUrls: ['./landing.component.scss']
})
export class LandingComponent implements OnInit {
    readonly CONTENT_PADDING_TOP = 45;
    showProgress: boolean;

    constructor(private _router: Router,
                private _route: ActivatedRoute,
                private _userSettingsService: UserSettingsService,
                private _themeService: ThemeService) {

        // this._themeService.setForumAreaTheme();
        // this._themeService.setActiveTheme(this._themeService.getActiveTheme());
    }

    ngOnInit() {
        this._userSettingsService.applySettings(
            this._route.snapshot.data['userSettings']
        );
        this._router.events
            .pipe(takeUntil(componentDestroyed(this)))
            .subscribe((event: any) => {

                if (event instanceof NavigationStart) {
                    this.showProgress = true;
                }

                if (event instanceof NavigationEnd) {
                    this.showProgress = false;
                }
            });
    }

    ngOnDestroy() {
    }
}
