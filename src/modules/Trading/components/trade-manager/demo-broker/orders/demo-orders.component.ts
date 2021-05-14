import {ChangeDetectionStrategy, ChangeDetectorRef, Component} from '@angular/core';
import { BrokerService } from '@app/services/broker.service';
import { IDemoOrder, SignalsDemoBrokerService } from '@app/services/demo.broker/signals-demo-broker.service';
import { OrderSide } from 'modules/Trading/models/models';
import {Observable, Subscription, of} from "rxjs";

enum OrderType {
    Pending = "Pending",
    Active = "Active",
    Closed = "Closed",
    Canceled = "Canceled"
}

interface IDemoOrderVM extends IDemoOrder {
    Type: OrderType;
}

@Component({
    selector: 'demo-orders',
    templateUrl: './demo-orders.component.html',
    styleUrls: ['./demo-orders.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DemoOrdersComponent {
    private _subscription: Subscription;
    public groups: string[] = [OrderType.Pending, OrderType.Active, OrderType.Closed, OrderType.Canceled];
    public groupingField: string = "Type";

    OrderSide = OrderSide;
    
    public get items(): IDemoOrderVM[] {
        let res: IDemoOrderVM[] = [];

        for (const o of this._demoBroker.pendingOrders) {
            res.push({
                ...o,
                Type: OrderType.Pending
            });
        }

        for (const o of this._demoBroker.filledOrders) {
            res.push({
                ...o,
                Type: OrderType.Active
            });
        }

        for (const o of this._demoBroker.closedOrders) {
            res.push({
                ...o,
                Type: OrderType.Closed
            });
        }

        for (const o of this._demoBroker.canceledOrders) {
            res.push({
                ...o,
                Type: OrderType.Canceled
            });
        }

        return res;
    }
    
    constructor(private _demoBroker: SignalsDemoBrokerService, 
                private _cdr: ChangeDetectorRef) {
        this._subscription = _demoBroker.dataChanged.subscribe(() => {
            this._cdr.detectChanges();
        });
    }

    ngOnDestroy() {
        if (this._subscription) {
            this._subscription.unsubscribe();
        }
    }

    getDecimals() {
        return this._demoBroker.decimals;
    }
}
