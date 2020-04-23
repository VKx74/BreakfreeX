import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {TranslateService} from "@ngx-translate/core";
import {TradingTranslateService} from "../Trading/localization/token";
import {TrendsComponent} from "./components/trends/trends.component";

const routes: Routes = [
    {
        path: '',
        component: TrendsComponent,
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
    providers: [
        {
            provide: TranslateService,
            useExisting: TradingTranslateService,
        }
    ]
})
export class TrendsRoutingModule {
}
