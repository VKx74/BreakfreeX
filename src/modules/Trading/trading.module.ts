import {Injector, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TradeManagerComponent} from "./components/trade-manager/trade-manager.component";
import {UIModule} from "UI";
import {Level2Component} from "./components/level2/level2.component";
import {Level2SimulateService} from "./services/level2-simulate.service";
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
import {TimeZoneManager, TimeZonesModule} from "TimeZones";
import { TestOandaComponent } from './components/forex.components/test-oanda/test-oanda.component';
import { OandaAccountInfoBarComponent } from './components/forex.components/oanda/account-info-bar/oanda-account-info-bar.component';
import { MT5TradeManagerComponent } from './components/forex.components/mt5/mt5-trade-manager.component';
import { MT5AccountInfoComponent } from './components/forex.components/mt5/account-info/mt5-account-info.component';
import { MT5AccountInfoBarComponent } from './components/forex.components/mt5/account-info-bar/mt5-account-info-bar.component';
import { MT5OpenOrdersComponent } from './components/forex.components/mt5/open-orders/mt5-open-orders.component';
import { MT5HistoryOrdersComponent } from './components/forex.components/mt5/history-orders/mt5-history-orders.component';
import { MT5PositionsComponent } from './components/forex.components/mt5/positions/mt5-positions.component';
import { MT5OrderConfiguratorModalComponent } from './components/forex.components/mt5/order-configurator-modal/mt5-order-configurator-modal.component';
import { MT5OrderConfiguratorComponent } from './components/forex.components/mt5/order-configurator/mt5-order-configurator.component';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import {NgxMaterialTimepickerModule} from "ngx-material-timepicker";
import { MT5OrderCloseModalComponent } from './components/forex.components/mt5/order-close-modal/mt5-order-close-modal.component';
import { MT5PendingOrdersComponent } from './components/forex.components/mt5/pending-orders/mt5-pending-orders.component';
import { MT5PositionCloseModalComponent } from './components/forex.components/mt5/position-close-modal/mt5-position-close-modal.component';

const components = [
    TradeManagerComponent,
    Level2Component,
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

    ForexTradeManagerComponent,
    OandaTradeManagerComponent,
    ForexOrderConfiguratorModalComponent,
    ForexOrderConfiguratorComponent,
    TestOandaComponent,
    MT5TradeManagerComponent,
    MT5OrderConfiguratorModalComponent,
    MT5OrderConfiguratorComponent,
    MT5OrderCloseModalComponent,
    MT5PositionCloseModalComponent,
    
    OandaAccountInfoComponent,
    OandaAccountInfoBarComponent,
    OandaOpenOrdersComponent,
    OandaHistoryOrdersComponent,
    OandaPositionsComponent,
    
    MT5AccountInfoComponent,
    MT5AccountInfoBarComponent,
    MT5OpenOrdersComponent,
    MT5PendingOrdersComponent,
    MT5HistoryOrdersComponent,
    MT5PositionsComponent,
];

@NgModule({
    declarations: [
        ...components,
        OrderTypePipe,
        OrdersComponent,
        OrderComponent,
        OrderSideComponent,
        TradingCloseButtonComponent,
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
        NgxMaterialTimepickerModule
        // TimeZonesModule,
    ],
    exports: [
        ...components
    ],
    providers: [
        Level2SimulateService,
        {
            provide: TradingTranslateService,
            useFactory: TranslateServiceFactory('trading'),
            deps: [Injector, SharedTranslateService]
        }
    ],
    entryComponents: [
        ...components
    ]
})
export class TradingModule {
}
