import {ChangeDetectionStrategy, Component} from '@angular/core';
import {Observable, Subscription, of} from "rxjs";
import { BinanceItemsComponent } from '../binance-items.component';


@Component({
    selector: 'binance-history-orders',
    templateUrl: './binance-history-orders.component.html',
    styleUrls: ['./binance-history-orders.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BinanceHistoryOrdersComponent extends BinanceItemsComponent<any> {

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
