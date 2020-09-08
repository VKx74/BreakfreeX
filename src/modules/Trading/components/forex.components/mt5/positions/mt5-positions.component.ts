import {Component, EventEmitter} from '@angular/core';
import {Observable, Subscription, of} from "rxjs";
import { map } from 'rxjs/operators';
import {OandaPosition} from 'modules/Trading/models/forex/oanda/oanda.models';
import {OrderSide} from "../../../../models/models";
import { MT5ItemsComponent } from '../mt5-items.component';
import { MT5Position } from 'modules/Trading/models/forex/mt/mt.models';
import { ConfirmModalComponent } from 'modules/UI/components/confirm-modal/confirm-modal.component';
import { MT5PositionCloseModalComponent } from '../position-close-modal/mt5-position-close-modal.component';

@Component({
    selector: 'mt5-positions',
    templateUrl: './mt5-positions.component.html',
    styleUrls: ['./mt5-positions.component.scss']
})
export class MT5PositionsComponent extends MT5ItemsComponent<MT5Position> {
    OrderSide = OrderSide;

    protected loadItems(): Observable<MT5Position[]> {
        return of(this._mt5Broker.positions);
    }

    protected _subscribeOnUpdates(): Subscription {
        return this._mt5Broker.onPositionsUpdated.subscribe(orderResp => {
            this.updateItems();
        });
    }

    closePosition(position: MT5Position) {
        if (position) {
            this._dialog.open(MT5PositionCloseModalComponent, {
                data: position
            });
        }
    }

    ngOnDestroy(): void {
        super.ngOnDestroy();
    }

    trackById(index, item: MT5Position) {
        return 1;
    }
}
