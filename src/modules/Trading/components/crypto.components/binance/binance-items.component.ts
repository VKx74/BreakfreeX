import { ChangeDetectorRef, Inject } from "@angular/core";
import { AlertService } from "@alert/services/alert.service";
import { MatDialog } from "@angular/material/dialog";
import { BrokerService } from '@app/services/broker.service';
import { DataHighlightService } from "modules/Trading/services/dataHighlight.service";
import { ItemsComponent } from "../../trade-manager/items.component";
import { BinanceBroker } from "@app/services/binance/binance.broker";

export abstract class BinanceItemsComponent<T> extends ItemsComponent<T> {
    protected get _binanceBroker(): BinanceBroker {
        return this._broker.activeBroker as BinanceBroker;
    }

    constructor(protected _broker: BrokerService,
        protected _dataHighlightService: DataHighlightService,
        @Inject(AlertService) protected _alertService: AlertService,
        protected _dialog: MatDialog, 
        protected _cdr: ChangeDetectorRef) {
            super(_broker, _dataHighlightService, _alertService, _dialog, _cdr);
    }
}
