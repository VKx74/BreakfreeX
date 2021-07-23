import {Injector, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {WatchlistComponent} from "./components";
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
import {SharedModule} from "Shared";
import { WatchlistStorageService } from './services/watchlist-storage.service';
import { WatchlistService } from './services/watchlist.service';
import { UIModule } from 'UI';
import { WatchlistNameModalComponent } from './components/watchlist-name-modal/watchlist-name-modal';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { LoaderModule } from 'modules/loader/loader.module';
import { WatchlistWidgetComponent } from './components/widget/watchlistWidget.component';

@NgModule({
    declarations: [
        WatchlistTileComponent,
        WatchlistChartComponent,
        WatchlistNameModalComponent,
        WatchlistComponent,
        WatchlistWidgetComponent
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
        SharedModule,
        UIModule,
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatMenuModule,
        LoaderModule
    ],
    entryComponents: [
        WatchlistComponent,
        WatchlistWidgetComponent,
        WatchlistNameModalComponent
    ],
    exports: [
        WatchlistComponent,
        WatchlistWidgetComponent
    ],
    providers: [
        WatchlistStorageService,
        WatchlistService,
        {
            provide: WatchListTranslateService,
            useFactory: TranslateServiceFactory('watchlist'),
            deps: [Injector, SharedTranslateService]
        }
    ]
})
export class WatchlistModule {
}
