import { ChangeDetectorRef, Inject } from "@angular/core";
import { AlertService } from "@alert/services/alert.service";
import { MatDialog } from "@angular/material/dialog";
import { BrokerService } from '@app/services/broker.service';
import { DataHighlightService } from "modules/Trading/services/dataHighlight.service";
import { ItemsComponent } from "../../trade-manager/items-component/items.component";
import { BinanceFuturesBroker } from "@app/services/binance-futures/binance-futures.broker";

export abstract class BinanceFuturesItemsComponent<T> extends ItemsComponent<T> {
    protected get _binanceBroker(): BinanceFuturesBroker {
        return this._broker.activeBroker as BinanceFuturesBroker;
    }

    public get decimals(): number {
        return 8;
    }

    constructor(protected _broker: BrokerService,
        protected _dataHighlightService: DataHighlightService,
        @Inject(AlertService) protected _alertService: AlertService,
        protected _dialog: MatDialog, 
        protected _cdr: ChangeDetectorRef) {
            super(_broker, _dataHighlightService, _alertService, _dialog, _cdr);
    }
}
