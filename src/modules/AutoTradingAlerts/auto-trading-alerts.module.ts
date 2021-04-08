import { Injector, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UIModule } from "UI";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LocalizationModule, TranslateServiceFactory } from "Localization";
import { PriceAlertDialogComponent } from './components/price-alert-dialog/price-alert-dialog.component';
import { AutoTradingAlertsTranslateService } from "./localization/token";
import { SharedModule } from "Shared";
import { NgxMaterialTimepickerModule } from "ngx-material-timepicker";
import { MatInputModule } from "@angular/material/input";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { InstrumentSearchModule } from "@instrument-search/instrument-search.module";
import { SharedTranslateService } from "@app/localization/shared.token";
import { EducationalTipsModule } from "../educational-tips/educational-tips.module";
import { MatMenuModule } from "@angular/material/menu";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { CalendarEventsModule } from "@calendarEvents/calendar-events.module";
import { IDEModule } from "../ide/ide.module";
import { ScriptingModule } from "@scripting/scripting.module";
import { MatTabsModule } from "@angular/material/tabs";
import { LoaderModule } from "../loader/loader.module";
import { DatatableModule } from "../datatable/datatable.module";
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { NumericInputModule } from '@numeric-input/numeric-input.module';
import { AlertsService } from './services/alerts.service';
import { PriceAlertGridComponent } from './components/price-alert-grid/price-alert-grid.component';
import { AlertWidgetComponent } from './components/alert-widget/alert-widget.component';
import { AlertSetupBaseComponent } from './components/alert-setup-base/alert-setup-base.component';
import { SonarAlertDialogComponent } from './components/sonar-alert-dialog/sonar-alert-dialog.component';
import { MatRadioModule } from '@angular/material/radio';
import { AlertRestClient } from './services/alert.rest.client';
import { AlertGridActionsComponent } from './components/alert-grid-actions/alert-grid-actions.component';
import { SonarAlertGridComponent } from './components/sonar-alert-grid/sonar-alert-grid.component';
import { AlertLogGridComponent } from './components/alert-log-grid/alert-log-grid.component';
import { NotificationsLogGridComponent } from './components/notifications-log-grid/notifications-log-grid.component';

@NgModule({
    declarations: [
        PriceAlertDialogComponent,
        SonarAlertDialogComponent,
        PriceAlertGridComponent,
        SonarAlertGridComponent,
        AlertLogGridComponent,
        AlertWidgetComponent,
        AlertSetupBaseComponent,
        AlertGridActionsComponent,
        NotificationsLogGridComponent
    ],
    imports: [
        CommonModule,
        UIModule,
        ReactiveFormsModule,
        FormsModule,
        MatRadioModule,
        LocalizationModule,
        InstrumentSearchModule,
        SharedModule,
        EducationalTipsModule,

        NgxMaterialTimepickerModule,
        MatInputModule,
        MatMenuModule,
        MatCheckboxModule,
        MatDatepickerModule,
        MatSlideToggleModule,
        CalendarEventsModule,
        IDEModule,
        ScriptingModule,
        MatTabsModule,
        LoaderModule,
        DatatableModule,
        MatFormFieldModule,
        MatSelectModule,
        NumericInputModule
    ],
    entryComponents: [
        PriceAlertDialogComponent,
        SonarAlertDialogComponent,
        AlertWidgetComponent,
        PriceAlertGridComponent
    ],
    exports: [
        PriceAlertGridComponent,
        AlertWidgetComponent
    ],
    providers: [
        {
            provide: AutoTradingAlertsTranslateService,
            useFactory: TranslateServiceFactory('autoTradingAlerts'),
            deps: [Injector, SharedTranslateService]
        },
        AlertsService,
        AlertRestClient
    ]
})
export class AutoTradingAlertsModule {
}
