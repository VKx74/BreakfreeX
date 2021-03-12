import {ChangeDetectionStrategy, Component} from '@angular/core';
import {Observable, Subscription, of} from "rxjs";
import { BinanceItemsComponent, BinanceItemsComponentWithHeader } from '../binance-items.component';


@Component({
    selector: 'binance-history-trades',
    templateUrl: './binance-history-trades.component.html',
    styleUrls: ['./binance-history-trades.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BinanceHistoryTradeComponent extends BinanceItemsComponentWithHeader<any> {

    protected loadItems(): Observable<any[]> {
        if (!this._instrument) {
            return of([]);
        }

        const from = this._getDate(this._fromTime, this._fromDate);
        const to = this._getDate(this._toTime, this._toDate);

        return this._binanceBroker.loadTradesHistory(this._instrument.symbol, from, to);
    }

    protected _subscribeOnUpdates(): Subscription {
        return this._binanceBroker.onOrdersUpdated.subscribe(() => {
            this.updateItems();
        });
    }

    ngOnDestroy(): void {
        super.ngOnDestroy();
    }

    protected collectionUpdated() {
        this.refresh();
    }
}
