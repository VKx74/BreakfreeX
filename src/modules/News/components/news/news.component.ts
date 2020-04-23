import {Component, ElementRef, Injector, ViewChild} from '@angular/core';
import {IChannel, INews, INewsMessage, IRSSFeed} from "../../models/models";
import {ThemeService} from "@app/services/theme.service";
import {Theme} from "@app/enums/Theme";
import {NewsRestService} from "../../services/news.rest.service";
import {TranslateService} from "@ngx-translate/core";
import {catchError, debounceTime, filter, map, startWith} from "rxjs/operators";
import {LocalizationService} from "Localization";
import {combineLatest, Observable, of} from "rxjs";
import {JsUtil} from "../../../../utils/jsUtil";
import {LocalTimeZone, TimeZoneManager, TzUtils} from "TimeZones";
import {ComponentIdentifier} from "@app/models/app-config";
import {NewsService} from "../../../Admin/services/news.service";
import {IPaginationResponse, PaginationHandler, PaginationParams} from "@app/models/pagination.model";
import bind from "bind-decorator";
import {NewsConfigService} from "../../services/news.config.service";
import {NewsTranslateService} from "../../localization/news.token";
import {ActivatedRoute, NavigationEnd, Router, RouterEvent} from "@angular/router";
import {AppRoutes} from "AppRoutes";
import {memoize} from "@decorators/memoize";
import {BaseLayoutItemComponent} from "@layout/base-layout-item.component";

enum NewsTab {
    Rss,
    News
}

@Component({
    selector: 'news',
    templateUrl: 'news.component.html',
    styleUrls: ['news.component.scss'],
    providers: [
        {
            provide: TranslateService,
            useExisting: NewsTranslateService
        },
    ]
})

export class NewsComponent {
    static componentName = 'News';
    static previewImgClass = 'crypto-icon-news';

    @ViewChild('newsContentContainer', {static: false}) newsContent: ElementRef;

    private subscription;
    private _autoRefresh: any;
    private _interval: number;

    readonly format: string = 'MMMM, DD, HH:mm';
    newsMessages: INewsMessage[] = [];
    customNews: INews[];
    channel: IChannel;

    theme: Theme;
    date: Date;

    excludedColumns: string[] = [];
    hiddenColumns: string[] = [];
    rssFeeds: IRSSFeed[] = [];
    selectedRssFeed: IRSSFeed;
    lastUpdateTime: number;
    selectedTab = NewsTab.Rss;
    paginationHandler = new PaginationHandler();
    loading = false;

    isPlatformRoot$ = this._router.events
        .pipe(
            startWith(new NavigationEnd(0, this._router.url, this._router.url)),
            filter((e: RouterEvent) => e instanceof NavigationEnd),
            map((e: NavigationEnd) => {
                return e.urlAfterRedirects === `/${AppRoutes.Platform}`;
            }),
        );

    get ComponentIdentifier() {
        return ComponentIdentifier;
    }

    constructor(
        private _themeService: ThemeService,
        private _newsRestService: NewsRestService,
        private _localizationService: LocalizationService,
        private _timeZoneManager: TimeZoneManager,
        private _translateService: TranslateService,
        private _newsManagerService: NewsService,
        private _newsConfigService: NewsConfigService,
        private _router: Router,
        ) {

        this.theme = this._themeService.getActiveTheme();
    }

    ngOnInit() {
        this._newsConfigService.getAvailableFeeds().subscribe((value: IRSSFeed[]) => {
            this.rssFeeds = value;
            this.selectedRssFeed = value[0];
        });

        this._getRSSNews(this.selectedRssFeed.link);

        console.log(this.excludedColumns);

    }


    formatDate(time: number): string {
        const timeZoneDate = TzUtils.convertDateTz(new Date(time), LocalTimeZone, this._timeZoneManager.timeZone);
        return JsUtil.formatMomentDate(timeZoneDate, this.format);
    }

    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }

        clearInterval(this._autoRefresh);
    }

    @bind
    columnCaption(columnName: string): Observable<string> {
        return this._translateService.get(columnName);
    }

    feedCaption(value: IRSSFeed) {
        return of(value ? value.name : '');
    }

    setFeed(value: IRSSFeed) {
        if (value) {
            this.selectedRssFeed = value;
            if (value.name === "Coindesk") {
                this.excludedColumns = ['image'];
                this.hiddenColumns = ['image'];
            } else {
                this.excludedColumns = [];
                this.hiddenColumns = [];
            }
            this._getRSSNews(this.selectedRssFeed.link);
        }
    }

    private _handleRSSNewsResponse(channel: IChannel) {
        this.channel = channel;
        this.newsMessages = channel.items;
        this.lastUpdateTime = new Date().getTime();
        this.loading = false;
    }

    private _handleCustomNewsResponse(res: IPaginationResponse<INews>) {
        this.customNews = res.items;
        this.lastUpdateTime = new Date().getTime();
        this.loading = false;
    }

    private _resetAutoRefresh() {
        clearInterval(this._autoRefresh);
        this._autoRefresh = setInterval(() => {
            this._refreshNews();
        }, this._interval);
    }

    private _getCustomAndRSSNews() {
        this.loading = true;
        return combineLatest(this._newsManagerService.getNewsList(new PaginationParams(0, 50)), this._newsRestService.getNews())
            .pipe(
                catchError(() => of(null)),
                filter(news => !!news)
            ).subscribe((res: [IPaginationResponse<INews>, IChannel]) => {
                this._handleCustomNewsResponse(res[0]);
                this._handleRSSNewsResponse(res[1]);
            });
    }

    private _getRSSNews(source?: string) {
        this.loading = true;
        this._newsRestService.getNewsBySource(source)
            .subscribe((channel: IChannel) => {
                this._handleRSSNewsResponse(channel);
            });
    }


    private _refreshNews() {
        this._scrollTop();
        this._getCustomAndRSSNews();
    }

    private _scrollTop() {
        if (this.newsMessages.length) {
            $(this.newsContent.nativeElement.parentElement).stop().animate({scrollTop: 0}, 100, 'swing');
        }
    }
}

