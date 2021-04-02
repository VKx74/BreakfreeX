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
import {sharedProviderResolver} from "../popup-window/functions";
import {LoaderModule} from "../loader/loader.module";
import { IndicatorRestrictionService } from './services/indicator-restriction.service';
import { IndicatorDataProviderService } from './services/indicator-data-provider.service';
import { BreakfreeTradingModule } from 'modules/BreakfreeTrading';
import { BreakfreeTradingService } from 'modules/BreakfreeTrading/services/breakfreeTrading.service';
import { ChartTrackerService } from 'modules/BreakfreeTrading/services/chartTracker.service';
import { TradeFromChartService } from './services/trade-from-chart.service';
import { AlertsService } from 'modules/AutoTradingAlerts/services/alerts.service';

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
        BreakfreeTradingModule
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
        AlertsService,
        IndicatorRestrictionService,
        IndicatorDataProviderService,
        BreakfreeTradingService,
        ChartTrackerService,
        TradeFromChartService
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
