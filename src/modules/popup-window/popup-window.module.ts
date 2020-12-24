import {Injector, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {PopupWindowRootComponent} from './components/popup-window-root/popup-window-root.component';
import {LocalizationModule, LocalizationService, TranslateServiceFactory} from "Localization";
import {ThemeService} from "@app/services/theme.service";
import {sharedProviderResolver} from "./functions";
import {LinkingModule} from "@linking/linking.module";
import {TranslateModule, TranslateService} from "@ngx-translate/core";
import {WatchlistComponent, WatchlistModule} from "Watchlist";
import {SharedTranslateService} from "@app/localization/shared.token";
import {AppTranslateService} from "@app/localization/token";
import {PopupWindowRoutingModule} from "./popup-window.router";
import {TimeZoneManager, TimeZonesModule} from "TimeZones";
import {AlertModule} from "@alert/alert.module";
import {RolesService} from "@app/services/role/roles.service";
import {EducationalTipsService} from "@app/services/educational-tips.service";
import {RolesHelper} from "@app/helpers/role.helper";
import {TimeFrameHelper} from "@app/helpers/timeFrame.helper";
import {DateFormatPipeUpdateTriggerToken} from "../Shared/pipes/date.pipe";
import {RouteReuseStrategy} from "@angular/router";
import {CustomRouteReuseStrategy} from "@app/router/reuse-strategy";
import {MAT_CHIPS_DEFAULT_OPTIONS} from '@angular/material/chips';
import {MAT_TABS_CONFIG} from '@angular/material/tabs';
import {MatPaginatorIntl} from '@angular/material/paginator';
import {MAT_FORM_FIELD_DEFAULT_OPTIONS} from "@angular/material/form-field";
import {COMMA, ENTER} from "@angular/cdk/keycodes";
import {MatPaginatorIntlCustom} from "@app/mat-paginator-intl";
import {ErrorProviderToken} from "@form-error-directive/error-provider.token";
import {FormErrorProviderFactory} from "@app/helpers/form-error-provider.factory";
import {AlertService, AlertType} from "@alert/services/alert.service";
import {ToasterAlertService} from "@alert/services/toaster-alert.service";
import {ChartModule, TcdComponent} from "Chart";
import {NewsComponent, NewsModule, NewsRootComponent} from "News";
import {OrderBookChartComponent, OrderBookChartModule} from "../OrderBookChart";
import {OrderBookModule} from "@order-book/order-book.module";
import {MarketTradesModule} from "@market-trades/market-trades.module";
import {ChatModule} from "../Chat/chat.module";
import {NotificationService} from "@app/services/notification.service";
import {NotificationWebSocketService} from "@app/services/socket/notification.socket.service";
import {StoreModule} from "@ngrx/store";
import {StoreDevtoolsModule} from "@ngrx/store-devtools";
import {EffectsModule} from "@ngrx/effects";
import {
    GoldenLayoutComponentConfiguration,
    GoldenLayoutLabels,
    GoldenLayoutModule,
    IGoldenLayoutComponentConfiguration
} from "angular-golden-layout";
import {LayoutTranslateService} from "@layout/localization/token";
import {IdentityService} from "@app/services/auth/identity.service";
import {MatDialog} from "@angular/material/dialog";
import {ISharedProviders} from "./interfaces";
import {LinkingMessagesBus} from "@linking/services";
import {NewsConfigService} from "../News/services/news.config.service";
import {TemplatesStorageService} from "@chart/services/templates-storage.service";
import {TemplatesDataProviderService} from "@chart/services/templates-data-provider.service";
import {ComponentIdentifier} from "@app/models/app-config";
import {OrderBookComponent} from "@order-book/components/order-book/order-book.component";
import {MarketTradesComponent} from "@market-trades/components/market-trades/market-trades.component";
import {Level2Component} from "Trading";
import {PublicChatLayoutWidgetComponent} from "../Chat/components/public-chat-layout-widget/public-chat-layout-widget.component";
import {PrivateChatLayoutWidgetComponent} from "../Chat/components/private-chat-layout-widget/private-chat-layout-widget.component";
import {NewsWidgetComponent} from "../News/components/news-widget/news-widget.component";
import { BreakfreeTradingModule } from 'modules/BreakfreeTrading/breakfreeTrading.module';
import { BreakfreeTradingAcademyComponent, BreakfreeTradingBacktestComponent } from 'modules/BreakfreeTrading';
import { ForexTradeManagerComponent } from '../Trading/components/forex.components/forex-trade-manager.component';
import { BreakfreeTradingScannerComponent } from 'modules/BreakfreeTrading/components/breakfreeTradingScanner/breakfreeTradingScanner.component';


export function sharedThemeService() {
    return sharedProviderResolver('themeService');
}

export function sharedEducationalTipsService() {
    return sharedProviderResolver('educationalTipsService');
}

@NgModule({
    declarations: [PopupWindowRootComponent],
    imports: [
        CommonModule,
        PopupWindowRoutingModule,
        GoldenLayoutModule.forRoot(),
        TimeZonesModule.forPopupRoot(),
        LinkingModule.forPopupRoot(),
        TranslateModule.forRoot(),
        LocalizationModule.forPopupRoot(),
        AlertModule.forRoot(),

        WatchlistModule,
        ChartModule.forPopupRoot(),
        NewsModule.forPopupRoot(),
        OrderBookChartModule,
        OrderBookModule,
        MarketTradesModule,
        ChatModule,
        BreakfreeTradingModule.forPopupRoot(),

        StoreDevtoolsModule.instrument({
            maxAge: 30
        }),
        EffectsModule.forRoot([]),
    ],
    providers: [
        {
            provide: SharedTranslateService,
            useFactory: TranslateServiceFactory('shared'),
            deps: [Injector]
        },
        {
            provide: AppTranslateService,
            useFactory: TranslateServiceFactory('app'),
            deps: [Injector, SharedTranslateService]
        },
        // TODO: Test
        {
            provide: ThemeService,
            useFactory: sharedThemeService
        },
        {
            provide: AlertService,
            useFactory: (appTranslateService: any) => {
                return new ToasterAlertService({
                    getTitle: (type: AlertType) => {
                        return appTranslateService.get(type);
                    }
                });
            },
            deps: [AppTranslateService]
        },
        {
            provide: EducationalTipsService,
            useFactory: sharedEducationalTipsService
        },

        NotificationService,
        NotificationWebSocketService,
        RolesService,
        RolesHelper,
        TimeFrameHelper,

        {
            provide: DateFormatPipeUpdateTriggerToken,
            useFactory: (localizationService: LocalizationService) => {
                return localizationService.localeChange$;
            },
            deps: [
                LocalizationService
            ]
        },
        {
            provide: RouteReuseStrategy,
            useClass: CustomRouteReuseStrategy
        },

        {
            provide: LayoutTranslateService,
            useFactory: TranslateServiceFactory('layout'),
            deps: [Injector, SharedTranslateService]
        },
        {
            provide: MAT_TABS_CONFIG,
            useValue: {
                animationDuration: '0ms'
            }
        },
        {
            provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
            useValue: {
                appearance: 'outline'
            }
        },
        {
            provide: MAT_CHIPS_DEFAULT_OPTIONS,
            useValue: {
                separatorKeyCodes: [ENTER, COMMA]
            }
        },
        {
            provide: MatPaginatorIntl,
            useClass: MatPaginatorIntlCustom
        },
        {
            provide: ErrorProviderToken,
            useFactory: FormErrorProviderFactory,
            deps: [SharedTranslateService]
        },
        {
            provide: GoldenLayoutComponentConfiguration,
            useFactory: (injector: Injector) => {
                const identityService: IdentityService = injector.get(IdentityService);
                const layoutTranslateService = injector.get(LayoutTranslateService) as TranslateService;
                const dialog = injector.get(MatDialog) as MatDialog;

                const getSharedProviders = (): ISharedProviders => {
                    return {
                        identityService: injector.get(IdentityService),
                        themeService: injector.get(ThemeService),
                        alertService: injector.get(AlertService),
                        localizationService: injector.get(LocalizationService),
                        linkingMessageBus: injector.get(LinkingMessagesBus),
                        templatesStorageService: injector.get(TemplatesStorageService),
                        timeZoneManager: injector.get(TimeZoneManager),
                        chartTemplatesDataProviderService: injector.get(TemplatesDataProviderService),
                        newsConfigService: injector.get(NewsConfigService),
                        educationalTipsService: injector.get(EducationalTipsService)
                    };
                };

                return {
                    settings: {
                        showPopinIcon: true,
                        showPopoutIcon: false,
                        reorderEnabled: false,
                        tabControlOffset: 100,
                        selectionEnabled: false,
                        responsiveMode: 'none',
                        showAddBtn: false,
                        dimensions: {
                            borderWidth: 5,
                            minItemHeight: 0,
                            minItemWidth: 0,
                            headerHeight: 28,
                            dragProxyWidth: 300,
                            dragProxyHeight: 200
                        },
                        popupWindowUrl: `${window.location.origin}${window.location.pathname}#/popup-window`,
                        getCloseTabIcon: () => $(`<i class="crypto-icon crypto-icon-layout-close"></i>`),
                        getCloseIcon: () => $(`<i class="crypto-icon crypto-icon-layout-close"></i>`),
                        getAddComponentBtnIcon: () => $(`<i class="crypto-icon crypto-icon-add"></i>`),
                        getMaximiseIcon: () => $(`<i class="crypto-icon crypto-icon-layout-maximise"></i>`),
                        getMinimiseIcon: () => $(`<i class="crypto-icon crypto-icon-layout-minimise"></i>`),
                        getPopoutIcon: () => $(`<i class="crypto-icon crypto-icon-layout-popup"></i>`),
                        getPopinIcon: () => $(`<i class="crypto-icon crypto-icon-layout-popin"></i>`)
                    },
                    labels: {
                        addComponent: layoutTranslateService.stream('addComponent'),
                        close: layoutTranslateService.stream('close'),
                        maximise: layoutTranslateService.stream('maximise'),
                        minimise: layoutTranslateService.stream('minimise'),
                        additionalTabs: layoutTranslateService.stream('additionalTabs'),
                        popout: layoutTranslateService.stream('popout'),
                        popin: layoutTranslateService.stream('popin'),
                        loading: layoutTranslateService.stream('loading'),
                        failedToLoadComponent: layoutTranslateService.stream('failedToLoad')
                    } as GoldenLayoutLabels,
                    components: [
                        {
                            componentName: ComponentIdentifier.chart,
                            component: TcdComponent
                        },
                        {
                            componentName: ComponentIdentifier.watchlist,
                            component: WatchlistComponent
                        },
                        {
                            componentName: ComponentIdentifier.orderBookChart,
                            component: OrderBookChartComponent
                        },
                        {
                            componentName: ComponentIdentifier.orderBook,
                            component: OrderBookComponent
                        },
                        {
                            componentName: ComponentIdentifier.marketTrades,
                            component: MarketTradesComponent
                        },
                        {
                            componentName: ComponentIdentifier.level2View,
                            component: Level2Component
                        },
                        {
                            componentName: ComponentIdentifier.news,
                            component: NewsWidgetComponent
                        },
                        {
                            componentName: ComponentIdentifier.publicChat,
                            component: PublicChatLayoutWidgetComponent
                        },
                        {
                            componentName: ComponentIdentifier.privateChat,
                            component: PrivateChatLayoutWidgetComponent
                        },
                        {
                            componentName: ComponentIdentifier.breakfreeTradingAcademy,
                            component: BreakfreeTradingAcademyComponent
                        }, 
                        {
                            componentName: ComponentIdentifier.breakfreeTradingScanner,
                            component: BreakfreeTradingScannerComponent
                        }, 
                        {
                            componentName: ComponentIdentifier.breakfreeTradingBacktest,
                            component: BreakfreeTradingBacktestComponent
                        },
                        {
                            componentName: ComponentIdentifier.forexTradeManager,
                            component: ForexTradeManagerComponent
                        },
                    ]
                } as IGoldenLayoutComponentConfiguration;
            },
            deps: [Injector]
        },
    ]
})
export class PopupWindowModule {
}
