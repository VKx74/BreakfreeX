import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {ActivatedRoute, NavigationEnd, NavigationError, NavigationStart, Router} from "@angular/router";
import {componentDestroyed} from "@w11k/ngx-componentdestroyed";
import {takeUntil} from "rxjs/operators";
import {NavigationMode} from "../../../navigation/components/navigation/navigation.component";
import {ThemeService} from "@app/services/theme.service";
import {AppRoutes} from "AppRoutes";
import {SidebarService} from "@app/services/sidebar.service";

@Component({
    selector: 'admin-root',
    templateUrl: './admin.component.html',
    styleUrls: [
        './admin.component.scss',
        '../../styles/_shared.scss'
    ]
})
export class AdminComponent implements OnInit {
    _updateTimer: any;
    showProgressBar: boolean = false;
    NavigationMode = NavigationMode;

    get isRootUrl() {
        return this._router.url === `/${AppRoutes.Admin}`;
    }

    get sidebarOpen() {
        return this._sidebarService.shown;
    }

    constructor(private _themeService: ThemeService,
                private _sidebarService: SidebarService,
                private _router: Router,
                private _ref: ChangeDetectorRef,
                private _route: ActivatedRoute
                ) {
    }

    ngOnInit() {
           let theme = this._route.snapshot.data['userSettings'].theme;

           this._themeService.setActiveTheme(theme);

        this._router.events
            .pipe(takeUntil(componentDestroyed(this)))
            .subscribe((event: any) => {

                if (event instanceof NavigationStart) {
                    this.showProgressBar = true;
                }

                if (event instanceof NavigationEnd || event instanceof NavigationError) {
                    this.showProgressBar = false;
                }
            });

        this._updateTimer = setInterval(() => {
            this._ref.markForCheck();
        }, 1000);
    }

    ngOnDestroy() {
        clearInterval(this._updateTimer);
    }

    setSidebarState(value: boolean) {
        this._sidebarService.setSidebarState(value);
    }
}
