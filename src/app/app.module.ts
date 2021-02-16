import {APP_INITIALIZER, InjectionToken, Injector, NgModule, ErrorHandler} from '@angular/core';
import {AppComponent} from './app.component';
import {AppRoutingModule} from "./app.router";
import {AuthGuard} from "./services/auth/auth.guard";
import {RouteReuseStrategy} from "@angular/router";
import {CustomRouteReuseStrategy} from "@app/router/reuse-strategy";
import {MAT_FORM_FIELD_DEFAULT_OPTIONS} from "@angular/material/form-field";
import {MAT_CHIPS_DEFAULT_OPTIONS} from "@angular/material/chips";
import {MAT_TABS_CONFIG} from '@angular/material/tabs';
import {COMMA, ENTER} from "@angular/cdk/keycodes";
import {ThemeService} from "@app/services/theme.service";
import {UnauthorizedGuard} from "@app/services/auth/unauthorized.guard";
import {BrowserModule} from "@angular/platform-browser";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {HTTP_INTERCEPTORS, HttpClientModule} from "@angular/common/http";
import {AppConfigService} from "@app/services/app.config.service";
import {IdentityService} from "@app/services/auth/identity.service";
import {AuthenticationService} from "@app/services/auth/auth.service";
import {CookieService} from "@app/services/сookie.service";
import {isPopupWindow, sharedProviderResolver} from "../modules/popup-window/functions";
import {catchError, switchMap} from "rxjs/operators";
import {forkJoin, of, throwError} from "rxjs";
import {AuthHttpInterceptorService} from "@app/services/auth/auth.http.interceptor";
import {BlockIfPopupWindowGuard} from "../modules/popup-window/block-if-popup-window.guard";
import {PopupWindowGuard} from "../modules/popup-window/popup-window.guard";
import {RoleGuard} from "@app/services/role/role.guard";
import {SharedTranslateService} from "@app/localization/shared.token";
import {LocalizationModule, TranslateServiceFactory} from "Localization";
import {BrokerService} from "@app/services/broker.service";
import {BrokerFactory} from "@app/factories/broker.factory";
import {ApplicationTypeService} from "@app/services/application-type.service";
import {AppTranslateService} from "@app/localization/token";
import {UserSettingsResolver} from "@app/services/user-settings.resolver";
import {UserSettingsService} from "@app/services/user-settings/user-settings.service";
import {TimeZonesModule} from "TimeZones";
import {RealtimeService} from "@app/services/realtime.service";
import {EducationalTipsService} from "@app/services/educational-tips.service";
import {BrokerStorage} from "@app/services/broker.storage";
import {LayoutStorage} from "@app/services/layout.storage";
import {LocalStorageService} from "Storage";
import {SessionStorageService} from "Storage";
import {TranslateModule, TranslateService} from "@ngx-translate/core";
import {MatNativeDateModule} from "@angular/material/core";
import {BitmexBrokerService} from "@app/services/bitmex.exchange/bitmex.broker.service";
import {BitmexInstrumentService} from "@app/services/bitmex.exchange/bitmex.instrument.service";
import {ExchangeFactory} from "@app/factories/exchange.factory";
import {BitmexRealtimeService} from "@app/services/bitmex.exchange/bitmex.realtime.service";
import {BitmexHistoryService} from "@app/services/bitmex.exchange/bitmex.history.service";
import {InstrumentService} from "@app/services/instrument.service";
import {HistoryService} from "@app/services/history.service";
import {UssSocketService} from "@app/services/socket/uss.socket.service";
import {StoreModule} from "@ngrx/store";


import * as fromPlatform from './store/reducers/platform.reducer';
import * as fromScripts from './store/reducers/scripts.reducer';
import {UploadFileInputConfig} from "@file-uploader/components/upload-file-input/upload-file-input-config.token";
import {AlertService, AlertType} from "@alert/services/alert.service";
import {UploadFile} from "@file-uploader/data/UploadFIle";
import {IUploadFileInputConfig} from "@file-uploader/components/upload-file-input/upload-file-input.component";
import {FileUploaderTranslateService} from "@file-uploader/localization/token";
import {ToasterAlertService} from "@alert/services/toaster-alert.service";
import {FileUploaderLocalizationModule, FileUploaderModule} from "@file-uploader/file-uploader.module";
import {OandaBrokerService} from "@app/services/oanda.exchange/oanda.broker.service";
import {OandaInstrumentService} from "@app/services/oanda.exchange/oanda.instrument.service";
import {OandaHistoryService} from "@app/services/oanda.exchange/oanda.history.service";
import {OandaRealtimeService} from "@app/services/oanda.exchange/oanda.realtime.service";
import {BitmexSocketService} from "@app/services/socket/bitmex.socket.service";
import {OandaSocketService} from "@app/services/socket/oanda.socket.service";
import {PolygonSocketService} from "@app/services/socket/polygon.socket.service";
import {TwelvedataSocketService} from "@app/services/socket/twelvedata.socket.service";

import {PolygonInstrumentService} from "@app/services/polygon.exchange/polygon.instrument.service";
import {PolygonHistoryService} from "@app/services/polygon.exchange/polygon.history.service";
import {PolygonRealtimeService} from "@app/services/polygon.exchange/polygon.realtime.service";

import {TwelvedataInstrumentService} from "@app/services/twelvedata.exchange/twelvedata.instrument.service";
import {TwelvedataHistoryService} from "@app/services/twelvedata.exchange/twelvedata.history.service";
import {TwelvedataRealtimeService} from "@app/services/twelvedata.exchange/twelvedata.realtime.service";
import { SingleSessionService } from './services/single-session.service';
import { BFTSocketService } from './services/socket/bft.socket.service';
import { IntercomModule } from 'ng-intercom';
import { Angulartics2Module } from 'angulartics2';
import { Angulartics2Segment } from 'angulartics2/segment';
import { SettingsStorageService } from './services/settings-storage.servic';
import { GlobalErrorHandler } from './services/GlobalErrorHandler';
import { AlgoService } from './services/algo.service';
import { KaikoInstrumentService } from './services/kaiko.exchange/kaiko.instrument.service';
import { KaikoHistoryService } from './services/kaiko.exchange/kaiko.history.service';
import { KaikoRealtimeService } from './services/kaiko.exchange/kaiko.realtime.service';
import { KaikoSocketService } from './services/socket/kaiko.socket.service';
import { MT5SocketService } from './services/socket/mt5.socket.service';
import { MTBroker } from './services/mt/mt.broker';
import { MT5BrokerServersProvider } from './services/mt/mt5.servers.service';
import { MT4SocketService } from './services/socket/mt4.socket.service';
import { MTSocketService } from './services/socket/mt.socket.service';
import { MTBrokerServersProvider } from './services/mt/mt.servers.service';
import { MT4BrokerServersProvider } from './services/mt/mt4.servers.service';
import { MT4Broker } from './services/mt/mt4.broker';
import { MT5Broker } from './services/mt/mt5.broker';
import { Angulartics2GoSquared } from 'angulartics2/gosquared';
import { TradingProfileService } from 'modules/BreakfreeTrading/services/tradingProfile.service';
import { NotificationsService } from '@alert/services/notifications.service';
import { ToasterNotificationsService } from '@alert/services/toaster-notifications.service';
import { MissionTrackingService } from './services/missions-tracking.service';
import { InstrumentMappingService } from './services/instrument-mapping.service';
import { SymbolMappingStorageService } from './services/instrument-mapping-storage.service';
import { FBPixelTrackingService } from './services/traking/fb.pixel.tracking.service';

export const REDUCER_TOKEN = new InjectionToken('App Reducer token');

const FILE_INPUT_CONFIG_PROVIDER = {
    provide: UploadFileInputConfig,
    useFactory: (alertService: AlertService, translateService: TranslateService) => {
        return {
            maxSizeMb: 5,
            maxFileSizeMb: 5,
            allowedFiles: [], // all files
            allowMultipleFiles: false,
            incorrectFileSizeHandler: (file: UploadFile | UploadFile[], maxFileSizeMB: number) => {
                alertService.warning(`${translateService.instant('uploadFileItem.incorrectSize')} ${maxFileSizeMB} MB`);
            },
            incorrectFileTypeHandler: (file: UploadFile | UploadFile[], allowedTypes: string[]) => {
                alertService.warning(`${translateService.instant('uploadFileItem.incorrectType')} ${allowedTypes.join(', ')}`);
            }
        } as IUploadFileInputConfig;
    },
    deps: [
        AlertService,
        FileUploaderTranslateService
    ]
};

@NgModule({
    declarations: [
        AppComponent
    ],
    imports: [
        IntercomModule.forRoot({
            appId: 'sv09ttz9', // from your Intercom config
            updateOnRouterChange: true // will automatically run `update` on router event changes. Default: `false`
        }),
        BrowserModule,
        BrowserAnimationsModule,
        HttpClientModule,
        AppRoutingModule,
        LocalizationModule.forRoot(),
        TranslateModule.forRoot(),
        TimeZonesModule.forRoot(),
        MatNativeDateModule,
        StoreModule.forRoot(REDUCER_TOKEN, {
            runtimeChecks: {
                strictStateImmutability: true,
                strictActionImmutability: true
            }
        }),
        FileUploaderLocalizationModule,
        // added to imports
        Angulartics2Module.forRoot()
    ],
    providers: [
        {
            provide: ErrorHandler, 
            useClass: GlobalErrorHandler
        },
        AuthenticationService,
        Angulartics2Segment,
        Angulartics2GoSquared,
        CookieService,
        AppConfigService,
        {
            provide: IdentityService,
            useFactory: (authService: AuthenticationService, cookieService: CookieService) => {
                if (isPopupWindow()) {
                    return sharedProviderResolver('identityService');
                }

                return new IdentityService(
                    authService,
                    cookieService
                );
            },
            deps: [
                AuthenticationService,
                CookieService
            ]
        },
        // ThemeService,
        {
            provide: APP_INITIALIZER,
            useFactory: (appConfigService: AppConfigService,
                         identityService: IdentityService) => () => {
                return appConfigService.loadConfig()
                    .pipe(
                        switchMap(() => {
                            if (isPopupWindow()) {
                                return of(null);
                            }

                            return forkJoin(
                                identityService.refreshTokenFromStorage()
                            ).pipe(
                                catchError((e) => {
                                    console.error(e, 'failed to refresh token');

                                    return throwError(e);
                                })
                            );
                        })
                    ).toPromise();
            },
            multi: true,
            deps: [AppConfigService, IdentityService]
        },
        {
            provide: HTTP_INTERCEPTORS,
            useClass: AuthHttpInterceptorService,
            multi: true
        },
        {
            provide: RouteReuseStrategy,
            useClass: CustomRouteReuseStrategy
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
            provide: AppTranslateService,
            useFactory: TranslateServiceFactory('app'),
            deps: [Injector, SharedTranslateService]
        },
        // // TODO: Review
        {
            provide: SharedTranslateService,
            useFactory: TranslateServiceFactory('shared'),
            deps: [Injector]
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

        ApplicationTypeService,
        SettingsStorageService,
        AuthGuard,
        BlockIfPopupWindowGuard,
        BrokerService,
        BrokerFactory,
        BrokerStorage,
        EducationalTipsService,
        LayoutStorage,
        LocalStorageService,
        SessionStorageService,
        PopupWindowGuard,
        RealtimeService,
        RoleGuard,
        ThemeService,
        UnauthorizedGuard,
        UserSettingsResolver,
        UserSettingsService,
        SingleSessionService,
        MissionTrackingService,


        ExchangeFactory,
        BitmexRealtimeService,
        BitmexHistoryService,
        BitmexBrokerService,
        BitmexInstrumentService,
        BitmexSocketService,
        BFTSocketService,
        MT5SocketService,
        MT4SocketService,
        AlgoService,
        TradingProfileService,

        OandaInstrumentService,
        OandaHistoryService,
        OandaRealtimeService,
        OandaBrokerService,
        OandaSocketService,
        PolygonSocketService,
        TwelvedataSocketService,
        KaikoSocketService,
        MT4BrokerServersProvider,
        MT5BrokerServersProvider,
        MT4Broker,
        MT5Broker,

        PolygonInstrumentService,
        PolygonHistoryService,
        PolygonRealtimeService,

        TwelvedataInstrumentService,
        TwelvedataHistoryService,
        TwelvedataRealtimeService,

        KaikoInstrumentService,
        KaikoHistoryService,
        KaikoRealtimeService,

        InstrumentService,
        RealtimeService,
        HistoryService,
        InstrumentMappingService,
        SymbolMappingStorageService,
        UssSocketService,
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
            provide: NotificationsService,
            useFactory: (appTranslateService: any) => {
                return new ToasterNotificationsService();
            },
            deps: [AppTranslateService]
        },
        {
            provide: UploadFileInputConfig,
            useFactory: (alertService: AlertService, translateService: TranslateService) => {
                return {
                    maxSizeMb: 5,
                    maxFileSizeMb: 5,
                    allowedFiles: [], // all files
                    allowMultipleFiles: false,
                    incorrectFileSizeHandler: (file: UploadFile | UploadFile[], maxFileSizeMB: number) => {
                        alertService.warning(`${translateService.instant('uploadFileItem.incorrectSize')} ${maxFileSizeMB} MB`);
                    },
                    incorrectFileTypeHandler: (file: UploadFile | UploadFile[], allowedTypes: string[]) => {
                        alertService.warning(`${translateService.instant('uploadFileItem.incorrectType')} ${allowedTypes.join(', ')}`);
                    }
                } as IUploadFileInputConfig;
            },
            deps: [
                AlertService,
                FileUploaderTranslateService
            ]
        },
        FBPixelTrackingService
    ],
    entryComponents: [],
    bootstrap: [AppComponent]
})
export class AppModule {
    constructor() {

    }
}
