import {Injector, ModuleWithProviders, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from "@angular/forms";
import {TradingModule} from "Trading";
import {TcdComponent} from "./components/tcd/tcd.component";
import {TemplatesDataProviderService} from "./services/templates-data-provider.service";
import {TcdBacktestComponent} from "./components/tcd.backtest/tcd.backtest.component";
import {LoadingModule} from "ngx-loading";
import {TranslateServiceFactory} from "Localization";
import {ChartTranslateService} from "./localization/token";
import {LinkingModule} from "../Linking";
import { AutoTradingAlertConfigurationService } from 'modules/AutoTradingAlerts/services/auto-trading-alert-configuration.service';
import {sharedProviderResolver} from "../popup-window/functions";
import {LoaderModule} from "../loader/loader.module";
import { IndicatorRestrictionService } from './services/indicator-restriction.service';

export function sharedTemplatesDataProviderService() {
    return sharedProviderResolver('chartTemplatesDataProviderService');
}

@NgModule({
    declarations: [
        TcdComponent,
        TcdBacktestComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        TradingModule,
        LoadingModule,
        LinkingModule,
        LoaderModule,
    ],
    exports: [
        TcdComponent,
        TcdBacktestComponent
    ],
    entryComponents: [
        TcdComponent
    ],
    providers: [
        {
            provide: ChartTranslateService,
            useFactory: TranslateServiceFactory('chart'),
            deps: [Injector]
        },
        AutoTradingAlertConfigurationService,
        IndicatorRestrictionService
    ]
})
export class ChartModule {
    static forRoot(): ModuleWithProviders {
        return {
            ngModule: ChartModule,
            providers: [
                TemplatesDataProviderService
            ]
        };
    }

    static forPopupRoot(): ModuleWithProviders {
        return {
            ngModule: ChartModule,
            providers: [
                {
                    provide: TemplatesDataProviderService,
                    useFactory: sharedTemplatesDataProviderService
                }
            ]
        };
    }
}
