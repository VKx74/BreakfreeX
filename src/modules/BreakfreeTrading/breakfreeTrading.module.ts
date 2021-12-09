import {Injector, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {InstrumentService} from "app/services/instrument.service";
import {LocalizationModule, TranslateServiceFactory} from "Localization";
import {BreakfreeTradingTranslateService} from "./localization/token";
import {LinkingModule} from "../Linking";
import {InstrumentSearchModule} from "@instrument-search/instrument-search.module";
import {DatatableModule} from "../datatable/datatable.module";
import {EducationalTipsModule} from "../educational-tips/educational-tips.module";
import {SharedTranslateService} from "@app/localization/shared.token";
import {TimeZonesModule} from "TimeZones";
import {MatDialogModule} from "@angular/material/dialog";
import {MatMenuModule} from "@angular/material/menu";
import {HistoryService} from "@app/services/history.service";
import {RealtimeService} from "@app/services/realtime.service";
import {SharedModule} from "Shared";
import { UIModule } from 'UI';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BreakfreeTradingService } from './services/breakfreeTrading.service';
import { BreakfreeTradingBacktestWidgetComponent, BreakfreeTradingAcademyComponent, BreakfreeTradingScannerComponent } from './components';
import { ModuleWithProviders } from '@angular/compiler/src/core';
import { BreakfreeTradingBacktestService } from './services/breakfreeTradingBacktest.service';
import { ChartTrackerService } from './services/chartTracker.service';
import { MatInputModule } from '@angular/material/input';
import { LoaderModule } from 'modules/loader/loader.module';
import { StrategyModeBacktestComponent } from './components/strategyModeBacktest/strategyModeBacktest.component';
import { MatTabsModule } from '@angular/material/tabs';
import { ExtensionHitTestComponent } from './components/extensionHitTest/extensionHitTest.component';
import { StrategyV2ModeBacktestComponent } from './components/strategyV2ModeBacktest/strategyV2ModeBacktest.component';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { CheckoutComponent } from './components/checkout/checkout.component';
import { MissionsComponent } from './components/missions/missions.component';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { DailyMissionsComponent } from './components/missions/daily-missions/daily-missions.component';
import { MissionCardComponent } from './components/missions/mission-card/mission-card.component';
import { WeeklyMissionsComponent } from './components/missions/weekly-missions/weekly-missions.component';
import { ScannerCardComponent } from './components/breakfreeTradingScanner/scanner-card/scanner-card.component';
import { MissionsInfoComponent } from './components/missions/missions-info/missions-info.component';
import { TradeGuardComponent } from './components/missions/trade-guard/trade-guard.component';
import { SpeedometerComponent } from './components/speedometer/speedometer.component';
import { PlainChartComponent } from './components/plainChart/plainChart.component';
import { TradingPerformanceService, UserTradingPerformanceData } from './services/tradingPerformance.service';
import { TradeGuardService } from './services/tradeGuard.service';
import { TradeGuardRiskClassPipe } from './pipes/currencyGuardRiskClass.pipe';
import { TradingPerformanceComponent } from './components/tradingPerformance/tradingPerformance.component';
import { LeaderDashboardComponent } from './components/missions/leader-dashboard/leader-dashboard.component';
import { AcademyModule } from 'modules/Academy/academy.module';
import { ScannerStrategyBacktestComponent } from './components/scannerModeBacktest/scannerModeBacktest.component';
import { PhoneNumberPopUpComponent } from './components/phoneNumberPopUp/phoneNumberPopUp.component';
import { GuestCheckoutComponent } from './components/guest-checkout/guest-checkout.component';
import { DefaultCheckoutComponent } from './components/default-checkout/default-checkout.component';
import { StorageModule } from 'modules/Storage/storage.module';
import { BreakfreeTradingScannerWidgetComponent } from './components/breakfreeTradingScanner/widget/breakfreeTradingScannerWidget.component';
import { BreakfreeTradingBacktestComponent } from './components/BreakfreeTradingBacktesComponent/BreakfreeTradingBacktest.component';
import { BlackFridayPremiumVideoComponent } from './components/blackFridayPremiumVideo/blackFridayPremiumVideo.component';
import { BinanceScannerComponent } from './components/BinanceScannerComponent/BinanceScanner.component';
import { BinanceScannerWidgetComponent } from './components/BinanceScannerWidget/BinanceScannerWidget.component';
import { BinanceScannerWsService } from './services/binance.scanner/binance.scanner.ws.service';
import { BinanceScannerService } from './services/binance.scanner/binance.scanner.service';
import { PosNegativeNumberColorDirective } from './components/BinanceScannerComponent/directive/color.directive';

@NgModule({
    // components here
    declarations: [
        StrategyModeBacktestComponent,
        StrategyV2ModeBacktestComponent,
        ScannerStrategyBacktestComponent,
        ExtensionHitTestComponent,
        BreakfreeTradingBacktestWidgetComponent,
        BreakfreeTradingBacktestComponent,
        BreakfreeTradingAcademyComponent,
        BreakfreeTradingScannerComponent,
        BreakfreeTradingScannerWidgetComponent,
        CheckoutComponent,
        GuestCheckoutComponent,
        DefaultCheckoutComponent,
        BlackFridayPremiumVideoComponent,
        PhoneNumberPopUpComponent,
        MissionsComponent,
        DailyMissionsComponent,
        WeeklyMissionsComponent,
        MissionCardComponent,
        MissionsInfoComponent,
        ScannerCardComponent,
        TradeGuardComponent,
        SpeedometerComponent,
        PlainChartComponent,
        TradeGuardRiskClassPipe,
        TradingPerformanceComponent,
        LeaderDashboardComponent,
        BinanceScannerComponent,
        BinanceScannerWidgetComponent,
        PosNegativeNumberColorDirective
    ],
    imports: [
        CommonModule,
        StorageModule,
        LocalizationModule,
        InstrumentSearchModule,
        DatatableModule,
        EducationalTipsModule,
        MatDialogModule,
        LinkingModule,
        TimeZonesModule,
        MatMenuModule,
        MatInputModule,
        MatSlideToggleModule,
        MatProgressBarModule,
        SharedModule,
        MatTabsModule,
        UIModule,
        FormsModule,
        ReactiveFormsModule,
        LoaderModule,
        MatFormFieldModule,
        MatSelectModule,
        UIModule,
        AcademyModule
    ],
    // components here
    entryComponents: [
        StrategyModeBacktestComponent,
        StrategyV2ModeBacktestComponent,
        ScannerStrategyBacktestComponent,
        ExtensionHitTestComponent,
        BreakfreeTradingBacktestWidgetComponent,
        BreakfreeTradingBacktestComponent,
        BreakfreeTradingAcademyComponent,
        BreakfreeTradingScannerComponent,
        BreakfreeTradingScannerWidgetComponent,
        CheckoutComponent,
        GuestCheckoutComponent,
        DefaultCheckoutComponent,
        BlackFridayPremiumVideoComponent,
        PhoneNumberPopUpComponent,
        MissionsComponent,
        MissionsInfoComponent,
        TradeGuardComponent,
        BinanceScannerComponent,
        BinanceScannerWidgetComponent
    ],
    // components here
    exports: [
        StrategyModeBacktestComponent,
        StrategyV2ModeBacktestComponent,
        ScannerStrategyBacktestComponent,
        ExtensionHitTestComponent,
        BreakfreeTradingBacktestWidgetComponent,
        BreakfreeTradingBacktestComponent,
        BreakfreeTradingAcademyComponent,
        BreakfreeTradingScannerComponent,
        BreakfreeTradingScannerWidgetComponent,
        CheckoutComponent,
        GuestCheckoutComponent,
        DefaultCheckoutComponent,
        BlackFridayPremiumVideoComponent,
        PhoneNumberPopUpComponent,
        MissionsInfoComponent,
        MissionsComponent,
        TradeGuardComponent,
        SpeedometerComponent,
        // ChartWrapperComponent,
        TradingPerformanceComponent,
        BinanceScannerComponent,
        BinanceScannerWidgetComponent
    ],
    providers: [
        HistoryService,
        InstrumentService,
        BreakfreeTradingService,
        ChartTrackerService,
        TradeGuardService,
        BreakfreeTradingBacktestService,
        BinanceScannerWsService,
        BinanceScannerService,
        TradingPerformanceService,
        {
            provide: BreakfreeTradingTranslateService,
            useFactory: TranslateServiceFactory('breakfreeTrading'),
            deps: [Injector, SharedTranslateService]
        }
    ]
})
export class BreakfreeTradingModule {
    static forRoot(): ModuleWithProviders {
        return {
            ngModule: BreakfreeTradingModule,
            providers: [
            ]
        };
    }

    static forPopupRoot(): ModuleWithProviders {
        return {
            ngModule: BreakfreeTradingModule,
            providers: [
            ]
        };
    }
}
