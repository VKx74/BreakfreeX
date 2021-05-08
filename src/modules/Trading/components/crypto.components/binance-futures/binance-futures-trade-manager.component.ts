import { Component } from "@angular/core";
import { TradingTranslateService } from "../../../localization/token";
import { TranslateService } from "@ngx-translate/core";
import { MatDialog } from "@angular/material/dialog";
import { BrokerService } from "@app/services/broker.service";
import { IPosition, TradeManagerTab } from 'modules/Trading/models/models';
import { AlertService } from '@alert/services/alert.service';
import { InstrumentService } from '@app/services/instrument.service';
import { DataHighlightService, ITradePanelDataHighlight } from "modules/Trading/services/dataHighlight.service";
import { BinanceFuturesBroker } from "@app/services/binance-futures/binance-futures.broker";
import { BinanceTradeManagerComponentBase } from "../common/binance-trade-manager.component";
import { ConfirmModalComponent } from "modules/UI/components/confirm-modal/confirm-modal.component";

@Component({
    selector: 'binance-futures-trade-manager',
    templateUrl: 'binance-futures-trade-manager.component.html',
    styleUrls: ['binance-futures-trade-manager.component.scss'],
    providers: [
        {
            provide: TranslateService,
            useExisting: TradingTranslateService
        }
    ]
})
export class BinanceFuturesTradeManagerComponent extends BinanceTradeManagerComponentBase {
    protected get _binanceBroker(): BinanceFuturesBroker {
        return this._brokerService.activeBroker as BinanceFuturesBroker;
    }

    get positionsAmount(): number {
        const broker = this._binanceBroker;
        if (!broker || !broker.positions) {
            return 0;
        }

        return broker.positions.length;
    }

    public get pendingAmount(): number {
        const broker = this._brokerService.activeBroker;
        if (!broker || !broker.orders) {
            return 0;
        }

        return broker.orders.length;
    }

    constructor(protected _dialog: MatDialog,
        protected _brokerService: BrokerService,
        protected _alertService: AlertService,
        protected _instrumentService: InstrumentService,
        protected _dataHighlightService: DataHighlightService) {
            super(_dialog, _brokerService, _alertService, _instrumentService, _dataHighlightService);
    }


    public handlePositionClose(position: IPosition) {
        const broker = this._binanceBroker;
        this._dialog.open(ConfirmModalComponent, {
            data: {
                title: 'Close position',
                message: `Are you sure you want close '${position.Symbol}' position?`,
                onConfirm: () => {
                    broker.closePosition(position.Symbol).subscribe((result) => {
                        if (result.result) {
                            this._alertService.success("Position closed");
                        } else {
                            this._alertService.error("Failed to close position: " + result.msg);
                        }
                    }, (error) => {
                        this._alertService.error("Failed to close position: " + error);
                    });
                }
            }
        });
    }

    protected _handleHighlight(data: ITradePanelDataHighlight) {
        if (!data) {
            return;
        }

        switch (data.ActivateTab) {
            case TradeManagerTab.Positions: this.selectedIndex = 0; break;
            case TradeManagerTab.ActiveOrders: this.selectedIndex = 1; break;
            case TradeManagerTab.OrderHistory: this.selectedIndex = 2; break;
            case TradeManagerTab.TradeHistory: this.selectedIndex = 3; break;
            case TradeManagerTab.Assets: this.selectedIndex = 4; break;
            case TradeManagerTab.AccountInfo: this.selectedIndex = 5; break;
        }
    }
}
