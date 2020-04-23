import {Injector, NgModule} from '@angular/core';
import {HistoryStorageService} from "./services/history.storage.service";
import {HistoryUploaderService} from "./services/history.uploader.service";
import {LoadingModule} from "ngx-loading";
import {CommonModule} from "@angular/common";
import {UIModule} from "UI";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {LocalizationModule, TranslateServiceFactory} from "Localization";
import {HistoryStorageTranslateService} from "./localization/token";
import {HistoryDataManagerComponent} from "./components/history-data-manager/history-data-manager.component";
import {SharedModule} from "Shared";
import {LoadDatafeedHistoryComponent} from './components/load-datafeed-history/load-datafeed-history.component';
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatDatepickerModule} from "@angular/material/datepicker";
import {FormErrorDirectiveModule} from "@form-error-directive/form-error-directive.module";
import {InstrumentSearchModule} from "@instrument-search/instrument-search.module";
import {EducationalTipsModule} from "../educational-tips/educational-tips.module";
import {SharedTranslateService} from "@app/localization/shared.token";

@NgModule({
    imports: [
        CommonModule,
        LoadingModule,
        UIModule,
        FormsModule,
        ReactiveFormsModule,
        InstrumentSearchModule,
        LocalizationModule,
        FormErrorDirectiveModule,
        EducationalTipsModule,

        MatFormFieldModule,
        MatInputModule,
        MatDatepickerModule,
        SharedModule
    ],
    declarations: [
        HistoryDataManagerComponent,
        LoadDatafeedHistoryComponent,
    ],
    exports: [
        HistoryDataManagerComponent
    ],
    entryComponents: [
        LoadDatafeedHistoryComponent
    ],
    providers: [
        HistoryStorageService,
        HistoryUploaderService,
        {
            provide: HistoryStorageTranslateService,
            useFactory: TranslateServiceFactory("historyStorage"),
            deps: [Injector, SharedTranslateService]
        }
    ]
})
export class HistoryStorageModule {

}
