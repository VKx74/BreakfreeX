import {Component} from '@angular/core';
import {Observable, Subscription, of} from "rxjs";
import {OandaItemsComponent} from "../oanda-items.component";
import { OandaOrder } from 'modules/Trading/models/forex/oanda/oanda.models';
import {OrderSide} from "../../../../models/models";

@Component({
    selector: 'oanda-history-orders',
    templateUrl: './oanda-history-orders.component.html',
    styleUrls: ['./oanda-history-orders.component.scss']
})
export class OandaHistoryOrdersComponent extends OandaItemsComponent<OandaOrder> {
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
