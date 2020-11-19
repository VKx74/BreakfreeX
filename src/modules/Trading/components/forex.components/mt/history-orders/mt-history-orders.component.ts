import {ChangeDetectionStrategy, Component} from '@angular/core';
import {Observable, Subscription, of} from "rxjs";
import { OandaOrder } from 'modules/Trading/models/forex/oanda/oanda.models';
import { MTItemsComponent } from '../mt-items.component';
import { MTHistoricalOrder } from 'modules/Trading/models/forex/mt/mt.models';

@Component({
    selector: 'mt-history-orders',
    templateUrl: './mt-history-orders.component.html',
    styleUrls: ['./mt-history-orders.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MTHistoryOrdersComponent extends MTItemsComponent<MTHistoricalOrder> {
    protected loadItems(): Observable<MTHistoricalOrder[]> {
        return of(this._mtBroker.ordersHistory);
    }

    trackById(index, item: OandaOrder) {
        return item.id;
    }

    protected _subscribeOnUpdates(): Subscription {
        return this._mtBroker.onHistoricalOrdersUpdated.subscribe(orderResp => {
            this.updateItems();
        });
    }

    protected ordersUpdated() {
        // this.cdr.detectChanges();
    }
    
}
