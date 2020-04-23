import {Injector, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {WatchlistComponent} from "./components";
import {InstrumentService} from "app/services/instrument.service";
import {LocalizationModule, TranslateServiceFactory} from "Localization";
import {WatchListTranslateService} from "./localization/token";
import {LinkingModule} from "../Linking";
import {InstrumentSearchModule} from "@instrument-search/instrument-search.module";
import {WatchlistTileComponent} from "./components";
import {WatchlistChartComponent} from "./components";
import {DatatableModule} from "../datatable/datatable.module";
import {EducationalTipsModule} from "../educational-tips/educational-tips.module";
import {SharedTranslateService} from "@app/localization/shared.token";
import {TimeZonesModule} from "TimeZones";
import {MatDialogModule} from "@angular/material/dialog";
import {MatMenuModule} from "@angular/material/menu";
import {HistoryService} from "@app/services/history.service";
import {RealtimeService} from "@app/services/realtime.service";
import {SharedModule} from "Shared";

@NgModule({
    declarations: [
        WatchlistTileComponent,
        WatchlistChartComponent,
        WatchlistComponent
    ],
    imports: [
        CommonModule,
        LocalizationModule,
        InstrumentSearchModule,
        DatatableModule,
        EducationalTipsModule,
        MatDialogModule,
        LinkingModule,
        TimeZonesModule,
        MatMenuModule,
        SharedModule
    ],
    entryComponents: [
        WatchlistComponent
    ],
    exports: [
        WatchlistComponent
    ],
    providers: [
        {
            provide: WatchListTranslateService,
            useFactory: TranslateServiceFactory('watchlist'),
            deps: [Injector, SharedTranslateService]
        }
    ]
})
export class WatchlistModule {
}
