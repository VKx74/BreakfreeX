import {ChangeDetectionStrategy, Component} from '@angular/core';
import { BinanceHistoricalOrder } from 'modules/Trading/models/crypto/binance/binance.models';
import {Observable, Subscription, of} from "rxjs";
import { BinanceSpotItemsComponentWithHeader } from '../binance-items.component';


@Component({
    selector: 'binance-history-orders',
    templateUrl: './binance-history-orders.component.html',
    styleUrls: ['./binance-history-orders.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BinanceHistoryOrdersComponent extends BinanceSpotItemsComponentWithHeader<BinanceHistoricalOrder> {

    protected loadItems(): Observable<BinanceHistoricalOrder[]> {
        if (!this._instrument) {
            return of([]);
        }

        const from = this._getDate(this._fromTime, this._fromDate);
        const to = this._getDate(this._toTime, this._toDate);

        return this._binanceBroker.loadOrdersHistory(this._instrument.symbol, from, to);
    }

    protected _subscribeOnUpdates(): Subscription {
        return null;
        // return this._binanceBroker.onOrdersUpdated.subscribe(() => {
        //     this.updateItems();
        // });
    }

    ngOnDestroy(): void {
        super.ngOnDestroy();
    }

    protected collectionUpdated() {
        this.refresh();
    }
}
