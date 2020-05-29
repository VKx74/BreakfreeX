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
import { BreakfreeTradingProService } from './services/breakfreeTradingPro.service';
import { BreakfreeTradingDiscoveryService } from './services/breakfreeTradingDiscovery.service';
import { BreakfreeTradingNavigatorService } from './services/breakfreeTradingNavigator.service';
import { BreakfreeTradingProComponent, BreakfreeTradingDiscoveryComponent, BreakfreeTradingNavigatorComponent } from './components';
import { ModuleWithProviders } from '@angular/compiler/src/core';

@NgModule({
    // components here
    declarations: [
        BreakfreeTradingProComponent,
        BreakfreeTradingDiscoveryComponent,
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
        SharedModule,
        UIModule,
        FormsModule,
        ReactiveFormsModule
    ],
    // components here
    entryComponents: [
        BreakfreeTradingProComponent,
        BreakfreeTradingDiscoveryComponent,
        BreakfreeTradingNavigatorComponent,
    ],
    // components here
    exports: [
        BreakfreeTradingProComponent,
        BreakfreeTradingDiscoveryComponent,
        BreakfreeTradingNavigatorComponent,
    ],
    providers: [
        HistoryService,
        InstrumentService,
        RealtimeService,
        BreakfreeTradingService,
        BreakfreeTradingProService,
        BreakfreeTradingDiscoveryService,
        BreakfreeTradingNavigatorService,
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
