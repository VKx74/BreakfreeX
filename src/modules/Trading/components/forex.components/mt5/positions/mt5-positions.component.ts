import {Component, EventEmitter} from '@angular/core';
import {Observable, Subscription, of} from "rxjs";
import { map } from 'rxjs/operators';
import {OandaPosition} from 'modules/Trading/models/forex/oanda/oanda.models';
import {OrderSide} from "../../../../models/models";
import { MT5ItemsComponent } from '../mt5-items.component';

@Component({
    selector: 'mt5-positions',
    templateUrl: './mt5-positions.component.html',
    styleUrls: ['./mt5-positions.component.scss']
})
export class MT5PositionsComponent extends MT5ItemsComponent<OandaPosition> {
    OrderSide = OrderSide;

    protected loadItems(): Observable<OandaPosition[]> {
        if (!this._oandaBrokerService.userInfo) {
            return of([]);
        }
        return this._oandaBrokerService.getPositions().pipe(map((positions: OandaPosition[]) => {
            // this._resubscribe(positions);
            return positions;
        }));
    }

    protected _subscribeOnUpdates(): Subscription {
        return this._oandaBrokerService.onPositionUpdated.subscribe(orderResp => {
            this.updateItems();
        });
    }

    closePosition(position: OandaPosition) {
        if (position) {
            this._oandaBrokerService.closePosition({
                Symbol: position.symbol,
            }).subscribe(
                () => {
                    // Response in socket
                },
                (e) => console.log(e)
            );
        }
    }

    ngOnDestroy(): void {
        super.ngOnDestroy();
    }

    trackById(index, item: OandaPosition) {
        return index;
    }
}
