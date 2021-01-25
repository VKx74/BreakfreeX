import {Injector, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TradeManagerComponent} from "./components/trade-manager/trade-manager.component";
import {UIModule} from "UI";
import {LoadingModule} from "ngx-loading";
import {IntervalSelectorComponent} from "./components/interval-selector/interval-selector.component";
import {PeriodicitySelectorComponent} from "./components/periodicity-selector/periodicity-selector.component";
import {TradingTranslateService} from "./localization/token";
import {LocalizationModule, TranslateServiceFactory} from "Localization";
import {SharedModule} from "Shared";

import {CryptoWalletComponent} from './components/crypto.components/crypto.wallet/crypto.wallet.component';
import {CryptoDepositDialogComponent} from './components/crypto.components/crypto.deposit-dialog/crypto.deposit-dialog.component';
import {CryptoWithdrawDialogComponent} from './components/crypto.components/crypto.withdraw-dialog/crypto.withdraw-dialog.component';
import {CryptoTradeManagerComponent} from "./components/crypto.components/crypto.trade-manager/crypto.trade-manager.component";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {CryptoOrderConfiguratorModalComponent} from './components/crypto.components/crypto-order-configurator-modal/crypto-order-configurator-modal.component';
import {CryptoOrderTableComponent} from './components/crypto.components/crypto.order-table/crypto.order-table.component';
import {LinkingModule} from "../Linking";
import {CryptoTradeTableComponent} from "./components/crypto.components/crypto.trade-table/crypto.trade-table.component";
import {CryptoOrderConfiguratorComponent} from './components/crypto.components/crypto-order-configurator/crypto-order-configurator.component';
import {CryptoWalletTableComponent} from './components/crypto.components/crypto-wallet-table/crypto-wallet-table.component';
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
import {ForexTradeManagerComponent} from "./components/forex.components/forex-trade-manager.component";
import {OandaTradeManagerComponent} from "./components/forex.components/oanda/oanda-trade-manager.component";
import {OandaAccountInfoComponent} from "./components/forex.components/oanda/account-info/oanda-account-info.component";
import {OandaOpenOrdersComponent} from "./components/forex.components/oanda/open-orders/oanda-open-orders.component";
import {OandaPositionsComponent} from "./components/forex.components/oanda/positions/oanda-positions.component";
import {OandaHistoryOrdersComponent} from "./components/forex.components/oanda/history-orders/oanda-history-orders.component";
import {MatMenuModule} from "@angular/material/menu";
import {ForexOrderConfiguratorModalComponent} from './components/forex.components/forex-order-configurator-modal/forex-order-configurator-modal.component';
import {ForexOrderConfiguratorComponent} from './components/forex.components/forex-order-configurator/forex-order-configurator.component';
import {DatatableModule} from "../datatable/datatable.module";
import {MatTableModule} from "@angular/material/table";
import {EducationalTipsModule} from "../educational-tips/educational-tips.module";
import {SharedTranslateService} from "@app/localization/shared.token";
import {FormErrorDirectiveModule} from "@form-error-directive/form-error-directive.module";
import { OrdersComponent } from './components/crypto.components/orders/orders.component';
import { OrderComponent } from './components/order/order.component';
import {LoaderModule} from "../loader/loader.module";
import { OrderSideComponent } from './components/order-side/order-side.component';
import { TradingCloseButtonComponent } from './components/trading-close-button/trading-close-button.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { TestOandaComponent } from './components/forex.components/test-oanda/test-oanda.component';
import { OandaAccountInfoBarComponent } from './components/forex.components/oanda/account-info-bar/oanda-account-info-bar.component';
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
import { ForexBrokerConnectorComponent } from './components/forex.components/forex-broker-connector/forex-broker-connector.component';
import { MTBrokerTypeSelectorComponent } from './components/forex.components/mt/broker-type-selector/mt-broker-type-selector.component';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { CurrencyGuardRiskClassPipe } from './components/forex.components/mt/pipes/currencyGuardRiskClass.pipe';
import { CurrencyGuardRiskPipe } from './components/forex.components/mt/pipes/currencyGuardRisk.pipe';
import { MTOrderScoreComponent } from './components/forex.components/mt/order-score/mt-order-score.component';
import { SymbolMappingComponent } from './components/forex.components/mt/symbol-mapping/symbol-mapping.component';
import { DataHighlightService } from './services/dataHighlight.service';

const components = [
    TradeManagerComponent,
    IntervalSelectorComponent,
    PeriodicitySelectorComponent,
    CryptoTradeManagerComponent,
    CryptoWalletComponent,
    CryptoDepositDialogComponent,
    CryptoWithdrawDialogComponent,
    CryptoOrderConfiguratorModalComponent,
    CryptoOrderTableComponent,
    CryptoTradeTableComponent,
    CryptoOrderConfiguratorComponent,
    CryptoWalletTableComponent,
    TrendsWidgetComponent,
    SymbolMappingComponent,

    ForexTradeManagerComponent,
    OandaTradeManagerComponent,
    ForexOrderConfiguratorModalComponent,
    ForexOrderConfiguratorComponent,
    ForexBrokerConnectorComponent,
    TestOandaComponent,
    MTBrokerTypeSelectorComponent,
    MTTradeManagerComponent,
    MTOrderConfiguratorModalComponent,
    MTOrderConfiguratorComponent,
    MTOrderCloseModalComponent,
    MTPositionCloseModalComponent,
    MTOrderEditModalComponent,
    
    OandaAccountInfoComponent,
    OandaAccountInfoBarComponent,
    OandaOpenOrdersComponent,
    OandaHistoryOrdersComponent,
    OandaPositionsComponent,
    
    MTAccountInfoComponent,
    MTAccountInfoBarComponent,
    MTOpenOrdersComponent,
    MTCurrencyRiskComponent,
    MTPendingOrdersComponent,
    MTHistoryOrdersComponent,
    MTPositionsComponent
];

@NgModule({
    declarations: [
        ...components,
        OrderTypePipe,
        OrdersComponent,
        OrderComponent,
        OrderSideComponent,
        TradingCloseButtonComponent,
        CurrencyGuardRiskClassPipe,
        CurrencyGuardRiskPipe,
        MTOrderScoreComponent
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
