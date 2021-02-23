import {Injector, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TradeManagerComponent} from "./components/trade-manager/trade-manager.component";
import {UIModule} from "UI";
import {LoadingModule} from "ngx-loading";
import {IntervalSelectorComponent} from "./components/interval-selector/interval-selector.component";
import {TradingTranslateService} from "./localization/token";
import {LocalizationModule, TranslateServiceFactory} from "Localization";
import {SharedModule} from "Shared";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {LinkingModule} from "../Linking";
import {TrendsWidgetComponent} from './components/trends-widget/trends-widget.component';
import {MatTabsModule} from "@angular/material/tabs";
import {MatAutocompleteModule} from "@angular/material/autocomplete";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatSelectModule} from "@angular/material/select";
import {MatDatepickerModule} from "@angular/material/datepicker";
import {MatInputModule} from "@angular/material/input";
import {OrderTypePipe} from './pipes/order-type.pipe';
import {NumericInputModule} from "@numeric-input/numeric-input.module";
import {InstrumentSearchModule} from "@instrument-search/instrument-search.module";
import {MatMenuModule} from "@angular/material/menu";
import {DatatableModule} from "../datatable/datatable.module";
import {MatTableModule} from "@angular/material/table";
import {EducationalTipsModule} from "../educational-tips/educational-tips.module";
import {SharedTranslateService} from "@app/localization/shared.token";
import {FormErrorDirectiveModule} from "@form-error-directive/form-error-directive.module";
import {LoaderModule} from "../loader/loader.module";
import { OrderSideComponent } from './components/order-side/order-side.component';
import { TradingCloseButtonComponent } from './components/trading-close-button/trading-close-button.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MTAccountInfoComponent } from './components/forex.components/mt/account-info/mt-account-info.component';
import { MTAccountInfoBarComponent } from './components/forex.components/mt/account-info-bar/mt-account-info-bar.component';
import { MTOpenOrdersComponent } from './components/forex.components/mt/open-orders/mt-open-orders.component';
import { MTHistoryOrdersComponent } from './components/forex.components/mt/history-orders/mt-history-orders.component';
import { MTPositionsComponent } from './components/forex.components/mt/positions/mt-positions.component';
import { MTOrderConfiguratorModalComponent } from './components/forex.components/mt/order-configurator-modal/mt-order-configurator-modal.component';
import { MTOrderConfiguratorComponent } from './components/forex.components/mt/order-configurator/mt-order-configurator.component';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import {NgxMaterialTimepickerModule} from "ngx-material-timepicker";
import { MTOrderCloseModalComponent } from './components/forex.components/mt/order-close-modal/mt-order-close-modal.component';
import { MTPendingOrdersComponent } from './components/forex.components/mt/pending-orders/mt-pending-orders.component';
import { MTPositionCloseModalComponent } from './components/forex.components/mt/position-close-modal/mt-position-close-modal.component';
import { MTOrderEditModalComponent } from './components/forex.components/mt/order-edit-modal/mt-order-edit-modal.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { MTTradeManagerComponent } from './components/forex.components/mt/mt-trade-manager.component';
import { MTCurrencyRiskComponent } from './components/forex.components/mt/currency-risk/mt-currency-risk.component';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { CurrencyGuardRiskClassPipe } from './components/forex.components/mt/pipes/currencyGuardRiskClass.pipe';
import { CurrencyGuardRiskPipe } from './components/forex.components/mt/pipes/currencyGuardRisk.pipe';
import { SymbolMappingComponent } from './components/forex.components/mt/symbol-mapping/symbol-mapping.component';
import { DataHighlightService } from './services/dataHighlight.service';
import { PeriodicitySelectorComponent } from './components/periodicity-selector/periodicity-selector.component';
import { BridgeBrokerTypeSelectorComponent } from './components/bridge-broker-type-selector/bridge-broker-type-selector.component';
import { BridgeBrokerConnectorComponent } from './components/bridge-broker-connector/bridge-broker-connector.component';
import { TradeManagerComponentContainer } from './components/trade-manager/container/trade-manager-container.component';

const components = [
    TradeManagerComponent,
    IntervalSelectorComponent,
    TrendsWidgetComponent,
    SymbolMappingComponent,

    TradeManagerComponentContainer,
    MTTradeManagerComponent,
    MTOrderConfiguratorModalComponent,
    MTOrderConfiguratorComponent,
    MTOrderCloseModalComponent,
    MTPositionCloseModalComponent,
    MTOrderEditModalComponent,
    
    MTAccountInfoComponent,
    MTAccountInfoBarComponent,
    MTOpenOrdersComponent,
    MTCurrencyRiskComponent,
    MTPendingOrdersComponent,
    MTHistoryOrdersComponent,
    MTPositionsComponent,
    PeriodicitySelectorComponent
];

@NgModule({
    declarations: [
        ...components,
        OrderTypePipe,
        OrderSideComponent,
        TradingCloseButtonComponent,
        BridgeBrokerTypeSelectorComponent,
        BridgeBrokerConnectorComponent,
        CurrencyGuardRiskClassPipe,
        CurrencyGuardRiskPipe
    ],
    imports: [
        CommonModule,
        UIModule,
        FormsModule,
        LoadingModule,
        LocalizationModule,
        SharedModule,
        LinkingModule,
        InstrumentSearchModule,

        ReactiveFormsModule,
        MatTabsModule,
        MatAutocompleteModule,
        MatFormFieldModule,
        MatSelectModule,
        MatDatepickerModule,
        MatInputModule,
        EducationalTipsModule,
        NumericInputModule,
        MatMenuModule,
        DatatableModule,
        MatTableModule,
        FormErrorDirectiveModule,
        LoaderModule,
        MatSlideToggleModule,
        NgxMaterialTimepickerModule,
        DragDropModule,
        MatExpansionModule,
        MatProgressBarModule
        // TimeZonesModule,
    ],
    exports: [
        ...components
    ],
    providers: [
        {
            provide: TradingTranslateService,
            useFactory: TranslateServiceFactory('trading'),
            deps: [Injector, SharedTranslateService]
        },
        DataHighlightService
    ],
    entryComponents: [
        ...components
    ]
})
export class TradingModule {
}
