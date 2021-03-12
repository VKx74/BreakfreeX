import {ChangeDetectionStrategy, Component} from '@angular/core';
import { IInstrument } from '@app/models/common/instrument';
import { BinanceFuturesHistoricalTrade } from 'modules/Trading/models/crypto/binance-futures/binance-futures.models';
import {Observable, Subscription, of} from "rxjs";
import { BinanceFuturesItemsComponent, BinanceFuturesItemsComponentWithHeader } from '../binance-futures-items.component';


@Component({
    selector: 'binance-futures-history-trades',
    templateUrl: './binance-futures-history-trades.component.html',
    styleUrls: ['./binance-futures-history-trades.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BinanceFuturesHistoryTradeComponent extends BinanceFuturesItemsComponentWithHeader<BinanceFuturesHistoricalTrade> {
    protected loadItems(): Observable<BinanceFuturesHistoricalTrade[]> {
        if (!this._instrument) {
            return of([]);
        }

        const from = this._getDate(this._fromTime, this._fromDate);
        const to = this._getDate(this._toTime, this._toDate);

        return this._binanceBroker.loadTradesHistory(this._instrument.symbol, from, to);
    }

    protected _subscribeOnUpdates(): Subscription {
        return null;
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
