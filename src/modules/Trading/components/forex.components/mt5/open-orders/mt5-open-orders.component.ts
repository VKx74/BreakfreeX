import {Component} from '@angular/core';
import {Observable, Subscription, of} from "rxjs";
import {map} from 'rxjs/operators';
import {OandaOrder} from 'modules/Trading/models/forex/oanda/oanda.models';
import {OrderSide} from "../../../../models/models";
import { MT5ItemsComponent } from '../mt5-items.component';


@Component({
    selector: 'mt5-open-orders',
    templateUrl: './mt5-open-orders.component.html',
    styleUrls: ['./mt5-open-orders.component.scss']
})
export class MT5OpenOrdersComponent extends MT5ItemsComponent<OandaOrder> {
    OrderSide = OrderSide;

    protected loadItems(): Observable<OandaOrder[]> {
        if (!this._oandaBrokerService.userInfo) {
            return of([]);
        }
        return this._oandaBrokerService.getOrders().pipe(map((orders: OandaOrder[]) => {
            // this._resubscribe(orders);
            return orders;
        }));
    }

    protected _subscribeOnUpdates(): Subscription {
        return this._oandaBrokerService.onOrderUpdated.subscribe(() => {
            this.updateItems();
        });
    }

    closeOrder(selectedItem: OandaOrder) {
        if (selectedItem) {
            this._oandaBrokerService.cancelOrder({
                Id: selectedItem.id
            }).subscribe(
                () => {
                },
                () => {
                }
            );
        }
    }

    ngOnDestroy(): void {
        super.ngOnDestroy();
    }

    trackById(index, item: OandaOrder) {
        return item.id;
    }
}
