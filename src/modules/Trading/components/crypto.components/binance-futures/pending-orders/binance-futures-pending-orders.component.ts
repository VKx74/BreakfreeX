import {ChangeDetectionStrategy, Component} from '@angular/core';
import {Observable, Subscription, of} from "rxjs";
import { BinanceFuturesItemsComponent } from '../binance-futures-items.component';


@Component({
    selector: 'binance-futures-pending-orders',
    templateUrl: './binance-futures-pending-orders.component.html',
    styleUrls: ['./binance-futures-pending-orders.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BinanceFuturesPendingOrdersComponent extends BinanceFuturesItemsComponent<any> {

    protected loadItems(): Observable<any[]> {
       return of(this._binanceBroker.pendingOrders);
    }

    protected _subscribeOnUpdates(): Subscription {
        return this._binanceBroker.onOrdersUpdated.subscribe(() => {
            this.updateItems();
        });
    }

    closeOrder(selectedItem: any) {
        if (selectedItem) {
            this.raiseOrderClose(selectedItem);
        }
    }

    ngOnDestroy(): void {
        super.ngOnDestroy();
    }

    protected collectionUpdated() {
        this.refresh();
    }
}
