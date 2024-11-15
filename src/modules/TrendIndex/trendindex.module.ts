import {Injector, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {LocalizationModule, TranslateServiceFactory} from "Localization";
import {LinkingModule} from "../Linking";
import {InstrumentSearchModule} from "@instrument-search/instrument-search.module";
import {DatatableModule} from "../datatable/datatable.module";
import {EducationalTipsModule} from "../educational-tips/educational-tips.module";
import {TimeZonesModule} from "TimeZones";
import {MatDialogModule} from "@angular/material/dialog";
import {MatMenuModule} from "@angular/material/menu";
import {SharedModule} from "Shared";
import { UIModule } from 'UI';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { LoaderModule } from 'modules/loader/loader.module';
import { TrendIndexComponent } from './components/trendIndex/trendIndex.component';
import { TrendIndexWidgetComponent } from './components/widget/trendIndexWidget.component';
import { TrendIndexTranslateService } from './localization/token';
import { SharedTranslateService } from '@app/localization/shared.token';
import { TrendColumnComponent } from './components/trendColumn/trendColumn.component';
import { TrendIndexBarChartComponent } from './components/trendIndexBarChart/trendIndexBarChart.component';
import { TrendIndexChartComponent } from './components/trendIndexChart/trendIndexChart.component';
import { JSONViewDialogComponent } from 'modules/Shared/components/json-view/json-view-dialog.component';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

@NgModule({
    declarations: [
        TrendIndexComponent,
        TrendIndexWidgetComponent,
        TrendColumnComponent,
        TrendIndexBarChartComponent,
        TrendIndexChartComponent
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
        LoaderModule,
        MatSlideToggleModule
    ],
    entryComponents: [
        TrendIndexComponent,
        TrendIndexWidgetComponent,
        JSONViewDialogComponent
    ],
    exports: [
        TrendIndexComponent,
        TrendIndexWidgetComponent
    ],
    providers: [
        {
            provide: TrendIndexTranslateService,
            useFactory: TranslateServiceFactory('trend-index'),
            deps: [Injector, SharedTranslateService]
        }
    ]
})
export class TrendIndexModule {
}
