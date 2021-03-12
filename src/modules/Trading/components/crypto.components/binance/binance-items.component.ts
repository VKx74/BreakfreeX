import { ChangeDetectorRef, Inject } from "@angular/core";
import { AlertService } from "@alert/services/alert.service";
import { MatDialog } from "@angular/material/dialog";
import { BrokerService } from '@app/services/broker.service';
import { DataHighlightService } from "modules/Trading/services/dataHighlight.service";
import { ItemsComponent } from "../../trade-manager/items-component/items.component";
import { BinanceBroker } from "@app/services/binance/binance.broker";
import { IInstrument } from "@app/models/common/instrument";

export abstract class BinanceItemsComponent<T> extends ItemsComponent<T> {
    protected get _binanceBroker(): BinanceBroker {
        return this._broker.activeBroker as BinanceBroker;
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

export abstract class BinanceItemsComponentWithHeader<T> extends BinanceItemsComponent<T> {
    protected _instrument: IInstrument;
    protected _fromTime: string;
    protected _toTime: string;
    protected _fromDate: Date;
    protected _toDate: Date;

    get instrument(): IInstrument {
        return this._instrument;
    }

    set instrument(data: IInstrument) {
        this._instrument = data;
        this.updateItems();
    }
     
    get fromTime(): string {
        return this._fromTime;
    }

    set fromTime(data: string) {
        this._fromTime = data;
        this.updateItems();
    }
     
    get toTime(): string {
        return this._toTime;
    }

    set toTime(data: string) {
        this._toTime = data;
        this.updateItems();
    }

    get fromDate(): Date {
        return this._fromDate;
    }

    set fromDate(data: Date) {
        this._fromDate = data;
        this.updateItems();
    }

    get toDate(): Date {
        return this._toDate;
    }

    set toDate(data: Date) {
        this._toDate = data;
        this.updateItems();
    }
    
    protected _getDate(time: string, date: Date): number {
        const hourMin = time.split(":");
        let h = hourMin[0];
        let m = hourMin[1];

        if (h.length === 1) {
            h = `0${h}`;
        }
        if (m.length === 1) {
            m = `0${m}`;
        }

        const dateString = date.toISOString().split("T")[0];
        const timeString = `${h}:${m}:00.500Z`;
        const exp = new Date(`${dateString}T${timeString}`).getTime() / 1000;
        return Math.roundToDecimals(exp, 0);
    }

    refreshRequired() {
        this.updateItems();
    }
    
    ngOnInit() {
        super.ngOnInit();

        this._toDate = new Date(new Date().getTime());
        this._fromDate = new Date(this._toDate.getTime() - (1000 * 24 * 60 * 60 * 1));

        this._toTime = `${this._toDate.getUTCHours()}:${this._toDate.getUTCMinutes()}`;
        this._fromTime = `${this._fromDate.getUTCHours()}:${this._fromDate.getUTCMinutes()}`;
    }
}
