import {Component, Injector, OnInit} from '@angular/core';
import {PaginationHandler} from "@app/models/pagination.model";
import {ComponentIdentifier} from "@app/models/app-config";
import {ThemeService} from "@app/services/theme.service";
import {NewsRestService} from "../../services";
import {LocalizationService} from "Localization";
import {LocalTimeZone, TimeZoneManager, TzUtils} from "TimeZones";
import {JsUtil} from "../../../../utils/jsUtil";
import {NewsRoutes} from '../../news.routes';
import {ActivatedRoute, NavigationEnd, Router} from "@angular/router";
import {ToolsRoutes} from "../../../tools/tools.routes";
import {UserSettingsRoutes} from "../../../user-settings/user-settings.routes";
import {TranslateService} from "@ngx-translate/core";
import {SharedTranslateService} from "@app/localization/shared.token";
import {LandingRoutes} from "../../../Landing/landing.routes";
import {BaseGoldenLayoutItemComponent} from "@layout/base-golden-layout-item.component";

@Component({
    selector: 'news-root',
    templateUrl: './news-root.component.html',
    styleUrls: ['./news-root.component.scss'],
    providers: [
        {
            provide: TranslateService,
            useExisting: SharedTranslateService
        }
    ]
})
export class NewsRootComponent implements OnInit {
    static componentName = 'News';
    static previewImgClass = 'crypto-icon-news';

    showRout = true;
    activeTab = '';

    readonly format: string = 'MMMM, DD, HH:mm';
    date: Date;
    paginationHandler = new PaginationHandler();
    ComponentIdentifier = ComponentIdentifier;


    get newsRouters() {
        return NewsRoutes;
    }


    constructor(
        private _themeService: ThemeService,
        private _newsRestService: NewsRestService,
        private _localizationService: LocalizationService,
        private _timeZoneManager: TimeZoneManager,
        private _router: Router,
        private _route: ActivatedRoute,
        ) {
        if (this._router.url.indexOf(ToolsRoutes.news) < 0) {
            this.showRout = false;
            this.activeTab = NewsRoutes.RSS;
        }
    }

    ngOnInit() {

    }



    ngOnDestroy() {
    }
}
