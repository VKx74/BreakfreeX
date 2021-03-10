import {ChangeDetectionStrategy, Component} from '@angular/core';
import { IInstrument } from '@app/models/common/instrument';
import {Observable, Subscription, of} from "rxjs";
import { BinanceFuturesItemsComponent } from '../binance-futures-items.component';


@Component({
    selector: 'binance-futures-history-trades',
    templateUrl: './binance-futures-history-trades.component.html',
    styleUrls: ['./binance-futures-history-trades.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BinanceFuturesHistoryTradeComponent extends BinanceFuturesItemsComponent<any> {
    private _instrument: IInstrument;
    private _fromTime: string;
    private _toTime: string;
    private _fromDate: Date;
    private _toDate: Date;

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

    protected loadItems(): Observable<any[]> {
        if (!this._instrument) {
            return of([]);
        }

        const from = this._getDate(this._fromTime, this._fromDate);
        const to = this._getDate(this._toTime, this._toDate);

        return this._binanceBroker.loadTradesHistory(this._instrument.symbol, from, to);
    }

    protected _subscribeOnUpdates(): Subscription {
        return null;
        // return this._binanceBroker.onOrdersUpdated.subscribe(() => {
        //     this.updateItems();
        // });
    }

    ngOnInit() {
        super.ngOnInit();

        this._toDate = new Date(new Date().getTime() + (1000 * 24 * 60 * 60));
        this._fromDate = new Date(this._toDate.getTime() - (1000 * 24 * 60 * 60 * 5));

        this._toTime = `${this._toDate.getUTCHours()}:${this._toDate.getUTCMinutes()}`;
        this._fromTime = `${this._fromDate.getUTCHours()}:${this._fromDate.getUTCMinutes()}`;
    }

    ngOnDestroy() {
        super.ngOnDestroy();
    }

    refreshRequired() {
        this.updateItems();
    }

    protected collectionUpdated() {
        // this.refresh();
    }

    private _getDate(time: string, date: Date): number {
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
}
