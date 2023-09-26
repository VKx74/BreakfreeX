import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject } from "@angular/core";
import { IdentityService } from "./services/auth/identity.service";
import { TranslateService } from "@ngx-translate/core";
import { AppTranslateService } from "./localization/token";
import {
    ActivatedRoute,
    NavigationCancel,
    NavigationEnd,
    NavigationStart,
    Router,
    RouterEvent
} from "@angular/router";
import { SidebarService } from "@app/services/sidebar.service";
import { LoaderService } from "@app/services/loader.service";
import { filter } from "rxjs/operators";
import { AppRoutes } from './app.routes';
import { Angulartics2Segment } from 'angulartics2/segment';
import { Angulartics2GoSquared } from 'angulartics2/gosquared';
import { DeviceService } from 'modules/deviceService/device-service';
import { MatDialog } from '@angular/material/dialog';
import { FirstTimeLoginPopupComponent } from '@app/first-time-login-popup/first-time-login-popup.component';



@Component({
    selector: 'app',
    templateUrl: 'app.component.html',
    styleUrls: ['app.component.scss'],
    // changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
    static isGAInitialized = false;

    readonly SHOW_LOADER_MODULES = [
        `${AppRoutes.Platform}/settings`,
        `${AppRoutes.Platform}/scripting`,
        `${AppRoutes.Landing}/forum`,
        `${AppRoutes.Landing}/questions-answers`,
        `${AppRoutes.Landing}/news`,
        AppRoutes.Landing,
        AppRoutes.Admin,
        AppRoutes.Platform];
    loading = false;

    get state() {
        return this._ss.shown;
    }

    constructor(private _authService: IdentityService,
        private _router: Router,
        private _ref: ChangeDetectorRef,
        private _ss: SidebarService,
        private _loaderService: LoaderService,
        private _angulartics2Segment: Angulartics2Segment,
        private DeviceService: DeviceService,
        private dialog: MatDialog,

        private _angulartics2GoSquared: Angulartics2GoSquared,
        @Inject(AppTranslateService) private _translateService: TranslateService
    ) {
        this._authService.isAuthorizedChange$.subscribe(value => {
            if (!value) {
                window.location.reload();
            }
        });

        // this._angulartics2GoSquared.startTracking();
        // [userId], [traits], [options], [callback]

        if (this._authService.email && !AppComponent.isGAInitialized) {
            AppComponent.isGAInitialized = true;
            const name = `${this._authService.firstName} ${this._authService.lastName}`;
            const email = this._authService.email;
            const subscriptions = this._authService.subscriptions.join(";");

            this._angulartics2Segment.startTracking();
            this._angulartics2Segment.setUserProperties({
                userId: email,
                email: email,
                subscriptions: subscriptions,
                name: name
            });
            this._angulartics2GoSquared.setUserProperties({
                userId: email,
                email: email,
                subscriptions: subscriptions,
                name: name
            });
        }
    }

    ngOnInit() {
        
        document.addEventListener('detach-ng-zone', () => {
            this._ref.detach();
        }, false);

        document.addEventListener('reattach-ng-zone', () => {
            this._ref.reattach();
        }, false);

        const currentRoute = this._router.routerState.snapshot.url;
        if (currentRoute && currentRoute.endsWith(AppRoutes.ClearSession)) {
            this._authService.signOut().subscribe();
        }



        if (this._authService.isAuthorized && this.DeviceService.isFirstTimeLogin()) {
        console.log('Conditions not met, opening dialog');
        this.dialog.open(FirstTimeLoginPopupComponent, {
            backdropClass: 'cdk-overlay-backdrop-initial',
            hasBackdrop: true
            
          });
        
        } else {
        console.log('Welcome back');
        
        }
        let currModule;
        let prevModule;

        this._router.events
            .pipe(
                filter(e => e instanceof NavigationStart || e instanceof NavigationEnd || e instanceof NavigationCancel)
            ).subscribe((e: RouterEvent) => {
                const url = e.url;

                if (e instanceof NavigationStart) {
                    for (let module of this.SHOW_LOADER_MODULES) {
                        if (url.includes(module) && module !== prevModule) {
                            this._loaderService.show();
                            prevModule = currModule;
                            return currModule = module;
                        }
                    }
                } else {
                    this._loaderService.hide();
                }
            });
    }
}

