import {ChangeDetectionStrategy, Component} from '@angular/core';
import {Observable, Subscription, of} from "rxjs";
import {map} from 'rxjs/operators';
import {OandaOrder} from 'modules/Trading/models/forex/oanda/oanda.models';
import {OrderFillPolicy, OrderSide} from "../../../../models/models";
import { MT5ItemsComponent } from '../mt5-items.component';
import { MT5Order } from 'modules/Trading/models/forex/mt/mt.models';
import { MT5OrderCloseModalComponent } from '../order-close-modal/mt5-order-close-modal.component';
import { ConfirmModalComponent } from 'modules/UI/components/confirm-modal/confirm-modal.component';


@Component({
    selector: 'mt5-pending-orders',
    templateUrl: './mt5-pending-orders.component.html',
    styleUrls: ['./mt5-pending-orders.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MT5PendingOrdersComponent extends MT5ItemsComponent<MT5Order> {

    protected loadItems(): Observable<MT5Order[]> {
       return of(this._mt5Broker.pendingOrders);
    }

    protected _subscribeOnUpdates(): Subscription {
        return this._mt5Broker.onOrdersUpdated.subscribe(() => {
            this.updateItems();
        });
    }

    cancelOrder(selectedItem: MT5Order) {
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
