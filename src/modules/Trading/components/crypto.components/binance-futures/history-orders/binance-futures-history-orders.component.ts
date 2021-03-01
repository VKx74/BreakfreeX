import {ChangeDetectionStrategy, Component} from '@angular/core';
import {Observable, Subscription, of} from "rxjs";
import { BinanceFuturesItemsComponent } from '../binance-futures-items.component';


@Component({
    selector: 'binance-futures-history-orders',
    templateUrl: './binance-futures-history-orders.component.html',
    styleUrls: ['./binance-futures-history-orders.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BinanceFuturesHistoryOrdersComponent extends BinanceFuturesItemsComponent<any> {

    protected loadItems(): Observable<any[]> {
       return of(this._binanceBroker.ordersHistory);
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
