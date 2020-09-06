import {Component} from '@angular/core';
import {Observable, Subscription, of} from "rxjs";
import {map} from 'rxjs/operators';
import {OandaOrder} from 'modules/Trading/models/forex/oanda/oanda.models';
import {OrderSide} from "../../../../models/models";
import { MT5ItemsComponent } from '../mt5-items.component';
import { MT5Order } from 'modules/Trading/models/forex/mt/mt.models';


@Component({
    selector: 'mt5-open-orders',
    templateUrl: './mt5-open-orders.component.html',
    styleUrls: ['./mt5-open-orders.component.scss']
})
export class MT5OpenOrdersComponent extends MT5ItemsComponent<MT5Order> {
    OrderSide = OrderSide;

    protected loadItems(): Observable<MT5Order[]> {
       return of(this._mt5Broker.orders);
    }

    protected _subscribeOnUpdates(): Subscription {
        return this._mt5Broker.onOrdersUpdated.subscribe(() => {
            this.updateItems();
        });
    }

    closeOrder(selectedItem: MT5Order) {
        if (selectedItem) {
            this._mt5Broker.cancelOrder(selectedItem.Id).subscribe(
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
