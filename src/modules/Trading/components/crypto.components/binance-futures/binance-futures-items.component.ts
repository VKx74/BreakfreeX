import { ChangeDetectorRef, Inject } from "@angular/core";
import { AlertService } from "@alert/services/alert.service";
import { MatDialog } from "@angular/material/dialog";
import { BrokerService } from '@app/services/broker.service';
import { DataHighlightService } from "modules/Trading/services/dataHighlight.service";
import { ItemsComponent } from "../../trade-manager/items-component/items.component";
import { BinanceFuturesBroker } from "@app/services/binance-futures/binance-futures.broker";
import { IInstrument } from "@app/models/common/instrument";
import { BinanceItemsComponentWithHeader } from "../common/binance-items-with-header.component";

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

export abstract class BinanceFuturesItemsComponentWithHeader<T> extends BinanceItemsComponentWithHeader<T> {
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

    ngOnInit() {
        super.ngOnInit();

        this._toDate = new Date(new Date().getTime() + (1000 * 24 * 60 * 60));
        this._fromDate = new Date(this._toDate.getTime() - (1000 * 24 * 60 * 60 * 5));

        this._toTime = `${this._toDate.getUTCHours()}:${this._toDate.getUTCMinutes()}`;
        this._fromTime = `${this._fromDate.getUTCHours()}:${this._fromDate.getUTCMinutes()}`;
    }
}
