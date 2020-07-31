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
import { BreakfreeTradingNavigatorService } from './services/breakfreeTradingNavigator.service';
import { BreakfreeTradingBacktestComponent, BreakfreeTradingNavigatorComponent } from './components';
import { ModuleWithProviders } from '@angular/compiler/src/core';
import { ClipboardModule, ClipboardService } from 'ngx-clipboard';
import { BreakfreeTradingBacktestService } from './services/breakfreeTradingBacktest.service';
import { ChartTrackerService } from './services/chartTracker.service';
import { MatInputModule } from '@angular/material/input';
import { LoaderModule } from 'modules/loader/loader.module';

@NgModule({
    // components here
    declarations: [
        BreakfreeTradingBacktestComponent,
        BreakfreeTradingNavigatorComponent,
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
        MatInputModule,
        SharedModule,
        UIModule,
        FormsModule,
        ReactiveFormsModule,
        LoaderModule,
        ClipboardModule
    ],
    // components here
    entryComponents: [
        BreakfreeTradingBacktestComponent,
        BreakfreeTradingNavigatorComponent,
    ],
    // components here
    exports: [
        BreakfreeTradingBacktestComponent,
        BreakfreeTradingNavigatorComponent,
    ],
    providers: [
        HistoryService,
        ClipboardService,
        InstrumentService,
        RealtimeService,
        BreakfreeTradingService,
        BreakfreeTradingNavigatorService,
        ChartTrackerService,
        BreakfreeTradingBacktestService,
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
