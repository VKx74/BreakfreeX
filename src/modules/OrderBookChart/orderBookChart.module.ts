import {Injector, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {UIModule} from "UI";
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import {OrderBookChartComponent} from "./components/orderBookChart/orderBookChart.component";
import {OrderBookChartTranslateService} from "./localization/token";
import {LocalizationModule, TranslateServiceFactory} from "Localization";
import {LinkingModule} from "../Linking";
import {InstrumentSearchModule} from "@instrument-search/instrument-search.module";
import {EducationalTipsModule} from "../educational-tips/educational-tips.module";
import {SharedTranslateService} from "@app/localization/shared.token";

@NgModule({
    declarations: [
        OrderBookChartComponent
    ],
    imports: [
        CommonModule,
        UIModule,
        ReactiveFormsModule,
        FormsModule,
        LocalizationModule,
        InstrumentSearchModule,
        EducationalTipsModule,
        LinkingModule
    ],
    entryComponents: [
        OrderBookChartComponent
    ],
    exports: [
        OrderBookChartComponent
    ],
    providers: [
        {
            provide: OrderBookChartTranslateService,
            useFactory: TranslateServiceFactory('chartOB'),
            deps: [Injector, SharedTranslateService]
        }
    ]
})
export class OrderBookChartModule {
}
