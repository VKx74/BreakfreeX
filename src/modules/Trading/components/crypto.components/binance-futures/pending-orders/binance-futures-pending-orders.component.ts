import {ChangeDetectionStrategy, Component} from '@angular/core';
import { BinanceFuturesOrder } from 'modules/Trading/models/crypto/binance-futures/binance-futures.models';
import {Observable, Subscription, of} from "rxjs";
import { BinanceFuturesItemsComponent } from '../binance-futures-items.component';


@Component({
    selector: 'binance-futures-pending-orders',
    templateUrl: './binance-futures-pending-orders.component.html',
    styleUrls: ['./binance-futures-pending-orders.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BinanceFuturesPendingOrdersComponent extends BinanceFuturesItemsComponent<BinanceFuturesOrder> {

    protected loadItems(): Observable<BinanceFuturesOrder[]> {
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