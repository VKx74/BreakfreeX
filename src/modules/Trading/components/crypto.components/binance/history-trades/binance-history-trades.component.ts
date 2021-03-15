import {ChangeDetectionStrategy, Component} from '@angular/core';
import { BinanceHistoricalTrade } from 'modules/Trading/models/crypto/binance/binance.models';
import {Observable, Subscription, of} from "rxjs";
import { BinanceSpotItemsComponentWithHeader } from '../binance-items.component';


@Component({
    selector: 'binance-history-trades',
    templateUrl: './binance-history-trades.component.html',
    styleUrls: ['./binance-history-trades.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BinanceHistoryTradeComponent extends BinanceSpotItemsComponentWithHeader<BinanceHistoricalTrade> {

    protected loadItems(): Observable<BinanceHistoricalTrade[]> {
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

    ngOnDestroy(): void {
        super.ngOnDestroy();
    }

    protected collectionUpdated() {
        this.refresh();
    }
}
