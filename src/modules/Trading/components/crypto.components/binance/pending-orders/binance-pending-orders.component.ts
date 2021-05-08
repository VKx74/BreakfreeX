import {ChangeDetectionStrategy, Component} from '@angular/core';
import { BinanceOrder } from 'modules/Trading/models/crypto/binance/binance.models';
import {Observable, Subscription, of} from "rxjs";
import { BinanceItemsComponent } from '../binance-items.component';


@Component({
    selector: 'binance-pending-orders',
    templateUrl: './binance-pending-orders.component.html',
    styleUrls: ['./binance-pending-orders.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BinancePendingOrdersComponent extends BinanceItemsComponent<BinanceOrder> {
    protected _subscriptionOnOrdersDataChanged: Subscription;

    protected loadItems(): Observable<BinanceOrder[]> {
       return of(this._binanceBroker.orders);
    }

    protected _subscribeOnUpdates(): Subscription {
        return this._binanceBroker.onOrdersUpdated.subscribe(() => {
            this.updateItems();
        });
    }

    closeOrder(selectedItem: BinanceOrder) {
        if (selectedItem) {
            this.raiseOrderClose(selectedItem);
        }
    }

    ngOnDestroy(): void {
        super.ngOnDestroy();

        if (this._subscriptionOnOrdersDataChanged) {
            this._subscriptionOnOrdersDataChanged.unsubscribe();
            this._subscriptionOnOrdersDataChanged = null;
        }
    }

    ngOnInit() {
        super.ngOnInit();
        this._subscriptionOnOrdersDataChanged = this._binanceBroker.onOrdersParametersUpdated.subscribe(() => {
            this.collectionUpdated();
        });
    }

    protected collectionUpdated() {
        this.refresh();
    }
}
