import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {TrendsRoutingModule} from './trends-routing.module';
import {TrendsComponent} from "./components/trends/trends.component";
import {FormsModule} from "@angular/forms";
import {TranslatePipe, TranslateService} from "@ngx-translate/core";
import {TradingTranslateService} from "../Trading/localization/token";
import {SharedModule} from "Shared";
import {LocalizationModule} from "Localization";
import {UIModule} from "UI";
import { TrendIndicatorComponent } from './components/trend-indicator/trend-indicator.component';
import {DatatableModule} from "../datatable/datatable.module";
import {LoaderModule} from "../loader/loader.module";

@NgModule({
    declarations: [TrendsComponent, TrendIndicatorComponent],
    imports: [
        CommonModule,
        TrendsRoutingModule,
        FormsModule,
        SharedModule,
        LocalizationModule,
        UIModule,
        DatatableModule,
        LoaderModule,
    ],
    exports: [
        TrendsComponent,
    ],
    providers: [
        {
            provide: TranslateService,
            useExisting: TradingTranslateService,
        }
    ]
})
export class TrendsModule {
}
