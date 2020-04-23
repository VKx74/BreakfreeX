import {Injector, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {UIModule} from "UI";
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {LocalizationModule, TranslateServiceFactory} from "Localization";
import {AlertDataSourceFactory} from "./factories/alert-data-source.factory";
import {AlertsFactory} from "./factories/alerts.factory";
import {AlertDialogComponent} from './components/alert-dialog/alert-dialog.component';
import {AutoTradingAlertsTranslateService} from "./localization/token";
import {SharedModule} from "Shared";
import {NgxMaterialTimepickerModule} from "ngx-material-timepicker";
import {RealtimeDataSource} from "./models/dataSources/RealtimeDataSource";
import {PriceAlert} from "./models/alerts/PriceAlert";
import {CancelOrderComponent} from './components/cancel-order/cancel-order.component';
import {AlertCloudExecutorService} from "./services/alert-cloud-executor.service";
import {StartAlertComponent} from "./components/start-alert/start-alert.component";
import {MatInputModule} from "@angular/material/input";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {MatDatepickerModule} from "@angular/material/datepicker";
import {InstrumentSearchModule} from "@instrument-search/instrument-search.module";
import {SharedTranslateService} from "@app/localization/shared.token";
import {EducationalTipsModule} from "../educational-tips/educational-tips.module";
import {MatMenuModule} from "@angular/material/menu";
import {MatSlideToggleModule} from "@angular/material/slide-toggle";
import {AlertWidgetComponent} from "./components/new-alert-widget/alert-widget.component";
import {Route, RouterModule} from "@angular/router";
import {CalendarEventsModule} from "@calendarEvents/calendar-events.module";
import {IDEModule} from "../ide/ide.module";
import { ModalAlertCodeComponent } from './components/modal-alert-code/modal-alert-code.component';
import {ScriptingModule} from "@scripting/scripting.module";
import { TabsAlertsComponent } from './components/tabs-alerts/tabs-alerts.component';
import { AlertLogWidgetComponent } from './components/alert-log-widget/alert-log-widget.component';
import {MatTabsModule} from "@angular/material/tabs";
import {AutoTradingAlertsRouterModule} from "./auto-trading-alerts.router";
import {LoaderModule} from "../loader/loader.module";
import {DatatableModule} from "../datatable/datatable.module";

const ROUTES: Route[] = [
    {
        path: '',
        component: TabsAlertsComponent
    }
];

@NgModule({
    declarations: [
        AlertDialogComponent,
        CancelOrderComponent,
        StartAlertComponent,
        AlertWidgetComponent,
        ModalAlertCodeComponent,
        TabsAlertsComponent,
        AlertLogWidgetComponent,
    ],
    imports: [
        CommonModule,
        UIModule,
        ReactiveFormsModule,
        FormsModule,
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
        RouterModule.forChild(ROUTES),
        CalendarEventsModule,
        IDEModule,
        ScriptingModule,
        MatTabsModule,
        AutoTradingAlertsRouterModule,
        LoaderModule,
        DatatableModule
    ],
    entryComponents: [
        AlertDialogComponent,
        CancelOrderComponent,
        StartAlertComponent,
        ModalAlertCodeComponent
    ],
    exports: [
        AlertWidgetComponent
    ],
    providers: [
        {
            provide: AutoTradingAlertsTranslateService,
            useFactory: TranslateServiceFactory('autoTradingAlerts'),
            deps: [Injector, SharedTranslateService]
        },
        AlertCloudExecutorService,
        RealtimeDataSource,
        PriceAlert,
        AlertDataSourceFactory,
        AlertsFactory
    ]
})
export class AutoTradingAlertsModule {
}
