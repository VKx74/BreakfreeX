import {ChangeDetectionStrategy, Component} from '@angular/core';
import {Observable, Subscription, of} from "rxjs";
import { BinanceItemsComponent } from '../binance-items.component';


@Component({
    selector: 'binance-history-trades',
    templateUrl: './binance-history-trades.component.html',
    styleUrls: ['./binance-history-trades.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BinanceHistoryTradeComponent extends BinanceItemsComponent<any> {

    protected loadItems(): Observable<any[]> {
       return of(this._binanceBroker.tradesHistory);
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
