import {Component, Inject} from "@angular/core";
import {IdentityService} from "./services/auth/identity.service";
import {TranslateService} from "@ngx-translate/core";
import {AppTranslateService} from "./localization/token";
import {
    ActivatedRoute,
    NavigationCancel,
    NavigationEnd,
    NavigationError,
    NavigationStart,
    Router,
    RouterEvent
} from "@angular/router";
import {ComponentAccessService} from "@app/services/component-access.service";
import {BrokerService} from "@app/services/broker.service";
import {CryptoBroker} from "@app/interfaces/broker/crypto.broker";
import {SidebarService} from "@app/services/sidebar.service";
import {LoaderService} from "@app/services/loader.service";
import {ThemeService} from "@app/services/theme.service";
import {LocalizationService} from "Localization";
import {UserSettingsService} from "@app/services/user-settings/user-settings.service";
import {filter, tap} from "rxjs/operators";
import {AppRoutes} from './app.routes';
import {ApplicationTypeService} from "@app/services/application-type.service";
import { Angulartics2Segment } from 'angulartics2/segment';


@Component({
    selector: 'app',
    templateUrl: 'app.component.html',
    styleUrls: ['app.component.scss']
})
export class AppComponent {
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
                private _route: ActivatedRoute,
                private _brokerService: BrokerService,
                private _ss: SidebarService,
                private _loaderService: LoaderService,
                private _componentsAccessService: ComponentAccessService,
                private _themeService: ThemeService,
                private _localizationService: LocalizationService,
                private _userSettingsService: UserSettingsService,
                private _applicationTypeService: ApplicationTypeService,
                private _angulartics2Segment: Angulartics2Segment,
                @Inject(AppTranslateService) private _translateService: TranslateService
    ) {


        this._authService.isAuthorizedChange$.subscribe(value => {
            if (!value) {
                window.location.reload();
            }
        });

        this._angulartics2Segment.startTracking();
    }

    ngOnInit() {
        // this._userSettingsService.applySettings(
        //     this._route.snapshot.data['userSettings']
        // );

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

