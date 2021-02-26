import {ChangeDetectionStrategy, Component} from '@angular/core';
import {Observable, Subscription, of} from "rxjs";
import { BinanceItemsComponent } from '../binance-items.component';


@Component({
    selector: 'binance-pending-orders',
    templateUrl: './binance-pending-orders.component.html',
    styleUrls: ['./binance-pending-orders.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BinancePendingOrdersComponent extends BinanceItemsComponent<any> {

    protected loadItems(): Observable<any[]> {
       return of(this._binanceBroker.orders);
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
