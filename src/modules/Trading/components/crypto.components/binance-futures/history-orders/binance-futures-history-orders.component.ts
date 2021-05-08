import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IInstrument } from '@app/models/common/instrument';
import { BinanceFuturesHistoricalOrder } from 'modules/Trading/models/crypto/binance-futures/binance-futures.models';
import { Observable, Subscription, of } from "rxjs";
import { BinanceFuturesItemsComponent, BinanceFuturesItemsComponentWithHeader } from '../binance-futures-items.component';


@Component({
    selector: 'binance-futures-history-orders',
    templateUrl: './binance-futures-history-orders.component.html',
    styleUrls: ['./binance-futures-history-orders.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BinanceFuturesHistoryOrdersComponent extends BinanceFuturesItemsComponentWithHeader<BinanceFuturesHistoricalOrder> {
    protected loadItems(): Observable<BinanceFuturesHistoricalOrder[]> {
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

    ngOnInit() {
        super.ngOnInit();
    }

    ngOnDestroy() {
        super.ngOnDestroy();
    }

    protected collectionUpdated() {
        // this.refresh();
    }
}
