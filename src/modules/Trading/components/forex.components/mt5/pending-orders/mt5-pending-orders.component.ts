import {Component} from '@angular/core';
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
    styleUrls: ['./mt5-pending-orders.component.scss']
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
            this._dialog.open(ConfirmModalComponent, {
                data: {
                    title: 'Cancel order',
                    message: `Are you sure you want cancel #'${selectedItem.Id}' order?`,
                    onConfirm: () => {
                        this._mt5Broker.cancelOrder(selectedItem.Id, OrderFillPolicy.FOK)
                            .subscribe( (result) => {
                                if (result.result) {
                                    this._alertService.success("Order canceled");
                                } else {
                                    this._alertService.error("Failed to cancel order: " + result.msg);
                                }
                            },
                            (error) => {
                                this._alertService.error("Failed to cancel order: " + error);
                            });
                    }
                }
            });
        }
    }

    ngOnDestroy(): void {
        super.ngOnDestroy();
    }

    trackById(index, item: OandaOrder) {
        return item.id;
    }
}
