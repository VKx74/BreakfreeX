import {Injector, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MarketTradesComponent} from "./components/market-trades/market-trades.component";
import {LinkingModule} from "@linking/linking.module";
import {LocalizationModule, TranslateServiceFactory} from "Localization";
import {MatSelectModule} from "@angular/material/select";
import {InstrumentSearchModule} from "@instrument-search/instrument-search.module";
import {UIModule} from "UI";
import {SharedModule} from "Shared";
import {MarketTradesTranslateService} from "./localization/token";
import {SharedTranslateService} from "@app/localization/shared.token";
import {EducationalTipsModule} from "../educational-tips/educational-tips.module";
import {DatatableModule} from "../datatable/datatable.module";

@NgModule({
    declarations: [
        MarketTradesComponent
    ],
    imports: [
        CommonModule,
        LinkingModule,
        LocalizationModule,
        MatSelectModule,
        InstrumentSearchModule,
        UIModule,
        EducationalTipsModule,
        SharedModule,
        DatatableModule
    ],
    exports: [
        MarketTradesComponent
    ],
    entryComponents: [
        MarketTradesComponent
    ],
    providers: [
        {
            provide: MarketTradesTranslateService,
            useFactory: TranslateServiceFactory('market-trades'),
            deps: [Injector, SharedTranslateService]
        }
    ]
})
export class MarketTradesModule {
}
