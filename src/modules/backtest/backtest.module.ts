import {Injector, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {BacktestSummaryComponent} from './components/backtest-summary/backtest-summary.component';
import {BacktestResultSelectorComponent} from './components/backtest-result-selector/backtest-result-selector.component';
import {BacktestResultOverviewComponent} from './components/backtest-result-overview/backtest-result-overview.component';
import {UIModule} from "UI";
import {BacktestTradesComponent} from "./components/backtest-trades/backtest-trades.component";
import {BacktestChartComponent} from "./components/backtest-chart/backtest-chart.component";
import {ChartModule} from "Chart";
import {RunBacktestComponent} from "./components/run-backtest/run-backtest.component";
import {LoadingModule} from "ngx-loading";
import {LocalizationModule, TranslateServiceFactory} from "Localization";
import {BacktestTranslateService} from "./localization/token";
import {SharedModule} from "Shared";
import {MatTabsModule} from "@angular/material/tabs";
import {MatFormFieldModule} from "@angular/material/form-field";
import {BacktestParamsModalComponent} from './components/backtest-params-modal/backtest-params-modal.component';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {InstrumentSearchModule} from "@instrument-search/instrument-search.module";
import {SharedTranslateService} from "@app/localization/shared.token";
import {BacktestApiService} from "./services/backtest-api.service";
import {BacktestExecutor} from "./services/backtest-executor";
import {BacktestNotificationService} from "./services/backtest-notification.service";
import {FormErrorDirectiveModule} from "@form-error-directive/form-error-directive.module";
import {MatInputModule} from "@angular/material/input";
import {BacktestOrdersComponent} from './components/backtest-orders/backtest-orders.component';
import {OrderTypePipe} from './pipes/order-type.pipe';
import {OrderActionPipe} from './pipes/order-action.pipe';
import {ScriptParametersModule} from "@scripting/scripting.module";
import {EducationalTipsModule} from "../educational-tips/educational-tips.module";
import {DatatableModule} from "../datatable/datatable.module";


@NgModule({
    imports: [
        CommonModule,
        ChartModule,
        LoadingModule,
        UIModule,
        LocalizationModule,
        FormsModule,
        ReactiveFormsModule,
        InstrumentSearchModule,
        FormErrorDirectiveModule,
        ScriptParametersModule,
        EducationalTipsModule,
        DatatableModule,

        SharedModule,
        MatTabsModule,
        MatFormFieldModule,
        MatInputModule
    ],
    declarations: [
        BacktestSummaryComponent,
        BacktestTradesComponent,
        BacktestResultSelectorComponent,
        BacktestResultOverviewComponent,
        BacktestChartComponent,
        RunBacktestComponent,
        BacktestParamsModalComponent,
        BacktestOrdersComponent,
        OrderTypePipe,
        OrderActionPipe
    ],
    exports: [
        BacktestSummaryComponent,
        BacktestTradesComponent,
        BacktestResultSelectorComponent,
        BacktestResultOverviewComponent,
        BacktestChartComponent,
        RunBacktestComponent
    ],
    providers: [
        {
            provide: BacktestTranslateService,
            useFactory: TranslateServiceFactory('backtest'),
            deps: [Injector, SharedTranslateService]
        },

        BacktestApiService,
        BacktestExecutor,
        BacktestNotificationService
    ],
    entryComponents: [
        BacktestResultOverviewComponent,
        RunBacktestComponent,
        BacktestParamsModalComponent
    ]
})
export class BacktestModule {
}
