import { Component } from "@angular/core";
import { TradingTranslateService } from "../../../localization/token";
import { TranslateService } from "@ngx-translate/core";
import { MatDialog } from "@angular/material/dialog";
import { BrokerService } from "@app/services/broker.service";
import { OrderTypes, TradeManagerTab } from 'modules/Trading/models/models';
import { AlertService } from '@alert/services/alert.service';
import { InstrumentService } from '@app/services/instrument.service';
import { DataHighlightService, ITradePanelDataHighlight } from "modules/Trading/services/dataHighlight.service";
import { BinanceBroker } from "@app/services/binance/binance.broker";
import { BinanceTradeManagerComponentBase } from "../common/binance-trade-manager.component";

@Component({
    selector: 'binance-trade-manager',
    templateUrl: 'binance-trade-manager.component.html',
    styleUrls: ['binance-trade-manager.component.scss'],
    providers: [
        {
            provide: TranslateService,
            useExisting: TradingTranslateService
        }
    ]
})
export class BinanceTradeManagerComponent extends BinanceTradeManagerComponentBase {
    protected get _binanceBroker(): BinanceBroker {
        return this._brokerService.activeBroker as BinanceBroker;
    }

    get fundsAmount(): number {
        const broker = this._binanceBroker;
        if (!broker || !broker.funds) {
            return 0;
        }
        return broker.funds.length;
    }

    public get pendingAmount(): number {
        const broker = this._brokerService.activeBroker;
        if (!broker || !broker.orders) {
            return 0;
        }

        return broker.orders.filter(_ => _.Type !== OrderTypes.Market).length;
    }

    constructor(protected _dialog: MatDialog,
        protected _brokerService: BrokerService,
        protected _alertService: AlertService,
        protected _instrumentService: InstrumentService,
        protected _dataHighlightService: DataHighlightService) {
            super(_dialog, _brokerService, _alertService, _instrumentService, _dataHighlightService);
    }

    protected _handleHighlight(data: ITradePanelDataHighlight) {
        if (!data) {
            return;
        }

        switch (data.ActivateTab) {
            case TradeManagerTab.Funds: this.selectedIndex = 0; break;
            case TradeManagerTab.ActiveOrders: this.selectedIndex = 1; break;
            case TradeManagerTab.OrderHistory: this.selectedIndex = 2; break;
            case TradeManagerTab.TradeHistory: this.selectedIndex = 3; break;
        }
    }
}
