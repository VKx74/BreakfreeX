import {Injector, NgModule} from "@angular/core";
import {EconomicCalendarComponent} from "./components/economic-calendar/economic-calendar.component";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {TranslateModule} from "@ngx-translate/core";
import {MatDatepickerModule} from "@angular/material/datepicker";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {CommonModule} from "@angular/common";
import {EducationalTipsModule} from "../educational-tips/educational-tips.module";
import {DatatableModule} from "../datatable/datatable.module";
import {SharedModule} from "Shared";
import {UIModule} from "UI";
import {LoaderModule} from "../loader/loader.module";
import {LoadingModule} from "ngx-loading";
import { TranslateServiceFactory } from "Localization";
import { SharedTranslateService } from "@app/localization/shared.token";
import { EconomicCalendarService } from "./localization/token";
import { EconomicCalendarWidgetComponent } from "./components/widget/economic-calendar-widget.component";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        EducationalTipsModule,

        MatDatepickerModule,
        MatFormFieldModule,
        MatInputModule,

        TranslateModule,
        DatatableModule,
        SharedModule,
        UIModule,
        LoaderModule,
        LoadingModule,
    ],
    declarations: [
        EconomicCalendarWidgetComponent,
        EconomicCalendarComponent
    ],
    exports: [
        EconomicCalendarWidgetComponent,
        EconomicCalendarComponent
    ],
    providers: [
        {
            provide: EconomicCalendarService,
            useFactory: TranslateServiceFactory('calendar-events'),
            deps: [Injector, SharedTranslateService]
        }
    ]
})
export class CalendarEventsModule {
}
