import {Component} from '@angular/core';
import {Observable, Subscription, of} from "rxjs";
import { OandaOrder } from 'modules/Trading/models/forex/oanda/oanda.models';
import {OrderSide} from "../../../../models/models";
import { MT5ItemsComponent } from '../mt5-items.component';
import { MT5HistoricalOrder } from 'modules/Trading/models/forex/mt/mt.models';

@Component({
    selector: 'mt5-history-orders',
    templateUrl: './mt5-history-orders.component.html',
    styleUrls: ['./mt5-history-orders.component.scss']
})
export class MT5HistoryOrdersComponent extends MT5ItemsComponent<MT5HistoricalOrder> {
    OrderSide = OrderSide;
    protected loadItems(): Observable<MT5HistoricalOrder[]> {
        return of(this._mt5Broker.ordersHistory);
    }

    trackById(index, item: OandaOrder) {
        return item.id;
    }

    protected _subscribeOnUpdates(): Subscription {
        return this._mt5Broker.onHistoricalOrdersUpdated.subscribe(orderResp => {
            this.updateItems();
        });
    }
}
