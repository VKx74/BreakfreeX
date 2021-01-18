import {ChangeDetectionStrategy, Component} from '@angular/core';
import {Observable, Subscription, of} from "rxjs";
import { MTItemsComponent } from '../mt-items.component';
import { MTOrder, MTOrderRecommendation, MTPendingOrderRecommendation } from 'modules/Trading/models/forex/mt/mt.models';
import { MTHelper } from '@app/services/mt/mt.helper';


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

    trackById(index, item: MTOrder) {
        return item.Id;
    }

    protected ordersUpdated() {
        this.refresh();
    }
}
