import {ChangeDetectionStrategy, Component} from '@angular/core';
import {Observable, Subscription, of} from "rxjs";
import { MTItemsComponent } from '../mt-items.component';
import { MTOrder } from 'modules/Trading/models/forex/mt/mt.models';


@Component({
    selector: 'mt-open-orders',
    templateUrl: './mt-open-orders.component.html',
    styleUrls: ['./mt-open-orders.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MTOpenOrdersComponent extends MTItemsComponent<MTOrder> {
    protected get _defaultHiddenColumns(): string[] {
        return ['Id', 'Open Time', 'Commission', 'Swap', 'Comment', 'Net Risk'];
    }

    protected get componentKey(): string {
        return "MTOpenOrdersComponent";
    }

    protected loadItems(): Observable<MTOrder[]> {
       return of(this._mtBroker.marketOrders);
    }

    protected _subscribeOnUpdates(): Subscription {
        return this._mtBroker.onOrdersUpdated.subscribe(() => {
            this.updateItems();
        });
    }

    closeOrder(selectedItem: MTOrder) {
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
    
    selectItem(item: MTOrder) {
        super.selectItem(item);
        this._broker.setActiveOrder(item.Id);
    }
}
