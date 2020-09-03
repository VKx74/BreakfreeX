import {Component} from '@angular/core';
import {Observable, Subscription, of} from "rxjs";
import { OandaOrder } from 'modules/Trading/models/forex/oanda/oanda.models';
import {OrderSide} from "../../../../models/models";
import { MT5ItemsComponent } from '../mt5-items.component';

@Component({
    selector: 'mt5-history-orders',
    templateUrl: './mt5-history-orders.component.html',
    styleUrls: ['./mt5-history-orders.component.scss']
})
export class MT5HistoryOrdersComponent extends MT5ItemsComponent<OandaOrder> {
    OrderSide = OrderSide;
    protected loadItems(): Observable<OandaOrder[]> {
        if (!this._oandaBrokerService.userInfo) {
            return of([]);
        }
        return this._oandaBrokerService.getHistoryOrders();
    }

    trackById(index, item: OandaOrder) {
        return item.id;
    }

    protected _subscribeOnUpdates(): Subscription {
        return this._oandaBrokerService.onOrderUpdated.subscribe(orderResp => {
            this.updateItems();
        });
    }
}
