import {InjectionToken, Injector, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {DashboardComponent} from "./components/dashboard/dashboard.component";
import {BottomPanelComponent} from "./components/bottom-panel/bottom-panel.component";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {LoadingModule} from "ngx-loading";
import {ChartModule, TcdComponent} from "Chart";
import {UIModule} from "UI";
import {TradingModule} from "Trading";
import {WatchlistModule} from "Watchlist";
import {StorageModule} from "Storage";
import {OrderBookChartComponent, OrderBookChartModule} from "../OrderBookChart";
import {ScriptingModule} from "@scripting/scripting.module";
import {BacktestModule} from "../backtest/backtest.module";
import {HistoryStorageModule} from "@historyStorage/historyStorage.module";
import {LocalizationModule, LocalizationService, TranslateServiceFactory} from "Localization";
import {SharedModule} from "Shared";
import {CalendarEventsModule} from "@calendarEvents/calendar-events.module";
import {AngularSplitModule} from "angular-split";
import {NotificationsModule} from "../Notifications/notifications.module";
import {ChatModule} from "../Chat/chat.module";
import {ScrollerModule} from "@scroller/scroller.module";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatMenuModule} from "@angular/material/menu";
import {PlatformRoutingModule} from "./platform.router";
import {ComponentSelectorComponent} from "./components/component-selector/component-selector.component";
import {NavigationModule} from "../navigation/navigation.module";
import {LinkingModule} from "@linking/linking.module";
import {AppTranslateService} from "@app/localization/token";
import {AudioService} from "@app/services/audio.service";
import {SignalService} from "@app/services/signal.service";
import {NotificationService} from "@app/services/notification.service";
import {NotificationWebSocketService} from "@app/services/socket/notification.socket.service";
import {AutoTradingAlertsModule} from "../AutoTradingAlerts/auto-trading-alerts.module";
import {CookieService} from "@app/services/сookie.service";
import {HealthCheckService} from "@app/services/health-check.service";
import {EffectsModule} from "@ngrx/effects";
import {FooterComponent} from './components/footer/footer.component';
import {PlatformEffects} from "./store/effects/platform.effect";
import {ScriptsEffects} from './store/effects/scripts.effect';
import {MarketTradesModule} from "@market-trades/market-trades.module";
import {OrderBookModule} from "@order-book/order-book.module";


import * as fromPlatform from './store/reducers/platform.reducer';
import * as fromScripts from './store/reducers/scripts.reducer';
import {EducationalTipsModule} from "../educational-tips/educational-tips.module";
import {WorkspaceRepository} from "@platform/services/workspace-repository.service";
import {PlatformTranslateService} from "@platform/localization/token";
import {WithdrawalWhitelistService} from "@app/services/withdrawal-whitelist-service";
import {MatTabsModule} from "@angular/material/tabs";
import {MatSlideToggleModule} from "@angular/material/slide-toggle";
import {FormErrorDirectiveModule} from "@form-error-directive/form-error-directive.module";
import {ComponentPreloaderConfigToken} from "../Shared/components/component-preloader/config.token";
import {IComponentPreloaderConfig} from "../Shared/components/component-preloader/component-preloader.component";
import {TranslateModule, TranslateService} from "@ngx-translate/core";
import {NewsModule} from "../News/news.module";
import {FileUploaderModule} from "../file-uploader/file-uploader.module";
import {TagsInputModule} from "@tagsInput/tags-input.module";
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatDatepickerModule} from "@angular/material/datepicker";
import {AuthEffects} from "@platform/store/effects/auth.effect";
import {RolesService} from "@app/services/role/roles.service";
import {TemplatesStorageService} from "@chart/services/templates-storage.service";
import {SharedTranslateService} from "@app/localization/shared.token";
import {ErrorProviderToken} from "@form-error-directive/error-provider.token";
import {FormErrorProviderFactory} from "@app/helpers/form-error-provider.factory";
import {DateFormatPipeUpdateTriggerToken} from "../Shared/pipes/date.pipe";
import {RouteReuseStrategy} from "@angular/router";
import {CustomRouteReuseStrategy} from "@app/router/reuse-strategy";
import {RolesHelper} from "@app/helpers/role.helper";
import {TimeFrameHelper} from "@app/helpers/timeFrame.helper";
import {AlertModule} from "@alert/alert.module";
import {StoreDevtoolsModule} from "@ngrx/store-devtools";
import {MatNativeDateModule} from "@angular/material/core";
import {PlatformComponent} from "@platform/components/platform/platform.component";
import {ProfileActivitiesModule} from "../user-settings/profile-activities.module";
import {PlatformNavComponent} from "@platform/components/platform-nav/platform-nav.component";
import {PlatformSidebarComponent} from "@platform/components/platform-sidebar/platform-sidebar.component";
import {SidebarModule} from "../sidebar/sidebar.module";
import {MatRadioModule} from "@angular/material/radio";
import {DashboardResolver} from "@app/resolvers/dashboard.resolver";
import {ToggleBottomPanelSizeService} from "@platform/components/dashboard/toggle-bottom-panel-size.service";
import {WorkspacesComponent} from "@platform/components/workspaces/workspaces.component";
import {
    GoldenLayoutComponentConfiguration, GoldenLayoutLabels,
    GoldenLayoutModule,
    IGoldenLayoutComponentConfiguration
} from "angular-golden-layout";
import {LayoutTranslateService} from "@layout/localization/token";
import {PopupWindowSharedProvidersKey} from "../popup-window/constants";
import {EducationalTipsService} from "@app/services/educational-tips.service";
import {NewsConfigService} from "../News/services/news.config.service";
import {TemplatesDataProviderService} from "@chart/services/templates-data-provider.service";
import {TimeZoneManager} from "TimeZones";
import {LinkingMessagesBus} from "@linking/services";
import {AlertService} from "@alert/services/alert.service";
import {ThemeService} from "@app/services/theme.service";
import {ISharedProviders} from "../popup-window/interfaces";
import {MatDialog} from "@angular/material/dialog";
import {IdentityService} from "@app/services/auth/identity.service";
import {ComponentIdentifier} from "@app/models/app-config";
import {OrderBookComponent} from "@order-book/components/order-book/order-book.component";
import {MarketTradesComponent} from "@market-trades/components/market-trades/market-trades.component";
import {PrivateChatLayoutWidgetComponent} from "../Chat/components/private-chat-layout-widget/private-chat-layout-widget.component";
import {PublicChatLayoutWidgetComponent} from "../Chat/components/public-chat-layout-widget/public-chat-layout-widget.component";
import {NewsWidgetComponent} from "../News/components/news-widget/news-widget.component";
import { SingleSessionService } from '@app/services/single-session.service';
import { BreakfreeTradingModule } from 'modules/BreakfreeTrading/breakfreeTrading.module';
import { BreakfreeTradingAcademyComponent, BreakfreeTradingBacktestWidgetComponent } from 'modules/BreakfreeTrading/components';
import { MissionTrackingService } from '@app/services/missions-tracking.service';
import { AlertWidgetComponent } from 'modules/AutoTradingAlerts/components/alert-widget/alert-widget.component';
import { AlertsService } from 'modules/AutoTradingAlerts/services/alerts.service';
import { TradeGuardTrackingService } from '@app/services/trade-guard-tracking.service';
import { RightPanelComponent } from './components/right-panel/right-panel.component';
import { BreakfreeTradingScannerWidgetComponent } from 'modules/BreakfreeTrading/components/breakfreeTradingScanner/widget/breakfreeTradingScannerWidget.component';
import { WatchlistWidgetComponent } from 'modules/Watchlist/components/widget/watchlistWidget.component';
import { AcademyModule } from 'modules/Academy/academy.module';
import { LayoutNameModalComponent } from './components/layout-name-component/layout-name.component';
import { OpenLayoutModalComponent } from './components/open-layout-component/open-layout.component';
import { DatatableModule } from 'modules/datatable/datatable.module';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { LoaderModule } from 'modules/loader/loader.module';
import { RightSidePanelStateService } from './services/right-side-panel-state.service';

export const REDUCER_TOKEN = new InjectionToken('Reducer token');

@NgModule({
    declarations: [
        PlatformComponent,
        DashboardComponent,
        BottomPanelComponent,
        RightPanelComponent,

        ComponentSelectorComponent,
        FooterComponent,
        // ChangePhoneComponent,
        // ChangePasswordComponent,
        PlatformNavComponent,
        PlatformSidebarComponent,
        WorkspacesComponent,
        LayoutNameModalComponent,
        OpenLayoutModalComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        SharedModule,
        AlertModule.forRoot(),
        TranslateModule.forRoot(),
        LocalizationModule.forRoot(),
        // TimeZonesModule.forRoot(),

        FileUploaderModule,
        FileUploaderModule.localizationService(),

        // StoreModule.forRoot(REDUCER_TOKEN, {
        //     runtimeChecks: {
        //         strictStateImmutability: true,
        //         strictActionImmutability: true
        //     }
        // }),
        StoreDevtoolsModule.instrument({
            maxAge: 30
        }),
        EffectsModule.forRoot([
            PlatformEffects,
            ScriptsEffects,
            AuthEffects
        ]),

        GoldenLayoutModule.forRoot(),
        PlatformRoutingModule,
        LoadingModule,
        ChartModule.forRoot(),
        UIModule,
        TradingModule,
        WatchlistModule,
        BreakfreeTradingModule.forRoot(),
        MarketTradesModule,
        OrderBookModule,
        NewsModule.forRoot(),
        StorageModule,
        OrderBookChartModule,
        ScriptingModule,
        BacktestModule,
        HistoryStorageModule,
        LocalizationModule,
        CalendarEventsModule,
        AngularSplitModule.forRoot(),
        NotificationsModule,
        LinkingModule.forRoot(),
        ChatModule,
        ScrollerModule,
        AutoTradingAlertsModule,
        EducationalTipsModule,
        TagsInputModule,

        MatMenuModule,
        MatProgressBarModule,
        MatDatepickerModule,
        MatFormFieldModule,
        MatInputModule,
        MatTabsModule,
        MatSlideToggleModule,
        FormErrorDirectiveModule,
        MatNativeDateModule,

        ProfileActivitiesModule.forPlatform(),
        NavigationModule,
        SidebarModule,
        MatRadioModule,
        AcademyModule,
        DatatableModule,
        DragDropModule,
        LoaderModule
    ],
    entryComponents: [
        ComponentSelectorComponent,
        LayoutNameModalComponent,
        OpenLayoutModalComponent
    ],
    providers: [
        RolesService,
        TemplatesStorageService,
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
        {
            provide: ErrorProviderToken,
            useFactory: FormErrorProviderFactory,
            deps: [SharedTranslateService]
        },
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
            provide: LayoutTranslateService,
            useFactory: TranslateServiceFactory('layout'),
            deps: [Injector, SharedTranslateService]
        },
        {
            provide: RouteReuseStrategy,
            useClass: CustomRouteReuseStrategy
        },
        RolesHelper,
        TimeFrameHelper,

        CookieService,
        HealthCheckService,

        AudioService,
        AlertsService,
        SignalService,
        SingleSessionService,
        MissionTrackingService,
        TradeGuardTrackingService,

        NotificationService,
        NotificationWebSocketService,
        WorkspaceRepository,
        WithdrawalWhitelistService,

        {
            provide: PlatformTranslateService,
            useFactory: TranslateServiceFactory('platform'),
            deps: [Injector, AppTranslateService]
        },

        {
            provide: REDUCER_TOKEN,
            useFactory: () => {
                return {
                    platform: fromPlatform.reducer,
                    scripts: fromScripts.reducer
                };
            }
        },
        {
            provide: ComponentPreloaderConfigToken,
            useFactory: (translateService: TranslateService) => {
                return {
                    getPendingCaption: () => {
                        return translateService.stream('loading');
                    },
                    getErrorCaption: () => {
                        return translateService.stream('failedToLoadData');
                    }
                } as IComponentPreloaderConfig;
            },
            deps: [AppTranslateService]
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
                        showPopinIcon: false,
                        showPopoutIcon: true,
                        reorderEnabled: true,
                        tabControlOffset: 100,
                        selectionEnabled: false,
                        responsiveMode: 'none',
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
                        getPopinIcon: () => $(`<i class="crypto-icon crypto-icon-layout-popin"></i>`),
                        openPopupFailureHandler: () => {
                            // injector.get(AlertService).warning((injector.get(LayoutTranslateService) as TranslateService).get('openPopupFailed'));
                        },
                        openPopupHook: (popupWindow: Window) => {
                            popupWindow[PopupWindowSharedProvidersKey] = getSharedProviders();
                        },
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
                            componentName: ComponentIdentifier.watchlistWidget,
                            component: WatchlistWidgetComponent
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
                            componentName: ComponentIdentifier.BreakfreeTradingScannerWidget,
                            component: BreakfreeTradingScannerWidgetComponent
                        }, 
                        {
                            componentName: ComponentIdentifier.breakfreeTradingBacktest,
                            component: BreakfreeTradingBacktestWidgetComponent
                        },
                        {
                            componentName: ComponentIdentifier.alertsManager,
                            component: AlertWidgetComponent
                        }
                    ]
                } as IGoldenLayoutComponentConfiguration;
            },
            deps: [Injector]
        },
        DashboardResolver,
        ToggleBottomPanelSizeService,
        RightSidePanelStateService
    ]
})
export class PlatformModule {
}
