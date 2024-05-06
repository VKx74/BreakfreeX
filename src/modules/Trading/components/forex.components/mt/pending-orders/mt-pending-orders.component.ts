import {ChangeDetectionStrategy, Component} from '@angular/core';
import {Observable, Subscription, of} from "rxjs";
import { MTItemsComponent } from '../mt-items.component';
import { MTOrder } from 'modules/Trading/models/forex/mt/mt.models';


@Component({
    selector: 'mt-pending-orders',
    templateUrl: './mt-pending-orders.component.html',
    styleUrls: ['./mt-pending-orders.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MTPendingOrdersComponent extends MTItemsComponent<MTOrder> {
    protected get _defaultHiddenColumns(): string[] {
        return ['Id', 'Open Time', 'Expiration Type', 'Expiration Date', 'Comment'];
    }
    
    protected get componentKey(): string {
        return "MTPendingOrdersComponent";
    }

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

    selectItem(item: MTOrder) {
        super.selectItem(item);
        this._broker.setActiveOrder(item.Id);
    }

    protected collectionUpdated() {
        this.refresh();
    }
}
