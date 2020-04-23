import {Injector, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {OrderBookTranslateService} from "./localization/token";
import {SharedTranslateService} from "@app/localization/shared.token";
import {OrderBookComponent} from "./components/order-book/order-book.component";
import {InstrumentSearchModule} from "@instrument-search/instrument-search.module";
import {LocalizationModule, TranslateServiceFactory} from "Localization";
import {UIModule} from "UI";
import {EducationalTipsModule} from "../educational-tips/educational-tips.module";
import {MatMenuModule} from "@angular/material/menu";

@NgModule({
    declarations: [
        OrderBookComponent
    ],
    imports: [
        CommonModule,
        InstrumentSearchModule,
        LocalizationModule,
        EducationalTipsModule,
        MatMenuModule,
        UIModule
    ],
    entryComponents: [
        OrderBookComponent
    ],
    exports: [
        OrderBookComponent
    ],
    providers: [
        {
            provide: OrderBookTranslateService,
            useFactory: TranslateServiceFactory('order-book'),
            deps: [Injector, SharedTranslateService]
        }
    ]
})
export class OrderBookModule {
}
