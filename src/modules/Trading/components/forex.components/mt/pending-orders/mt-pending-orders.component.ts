import {ChangeDetectionStrategy, Component} from '@angular/core';
import {Observable, Subscription, of} from "rxjs";
import {OandaOrder} from 'modules/Trading/models/forex/oanda/oanda.models';
import { MTItemsComponent } from '../mt-items.component';
import { MTOrder } from 'modules/Trading/models/forex/mt/mt.models';


@Component({
    selector: 'mt-pending-orders',
    templateUrl: './mt-pending-orders.component.html',
    styleUrls: ['./mt-pending-orders.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MTPendingOrdersComponent extends MTItemsComponent<MTOrder> {

    protected loadItems(): Observable<MTOrder[]> {
       return of(this._mtBroker.pendingOrders);
    }

    protected _subscribeOnUpdates(): Subscription {
        return this._mtBroker.onOrdersUpdated.subscribe(() => {
            this.updateItems();
        });
    }

    cancelOrder(selectedItem: MTOrder) {
        if (selectedItem) {
            this.raiseOrderClose(selectedItem);
        }
    }

    ngOnDestroy(): void {
        super.ngOnDestroy();
    }

    trackById(index, item: OandaOrder) {
        return item.id;
    }

    protected ordersUpdated() {
        this.refresh();
    }
}
