import {ChangeDetectionStrategy, Component, EventEmitter, Input} from '@angular/core';
import {Observable, Subscription, of} from "rxjs";
import { BinanceFuturesItemsComponent } from '../binance-futures-items.component';

@Component({
    selector: 'binance-futures-positions',
    templateUrl: './binance-futures-positions.component.html',
    styleUrls: ['./binance-futures-positions.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BinanceFuturesPositionsComponent extends BinanceFuturesItemsComponent<any> {

    protected loadItems(): Observable<any[]> {
        return of(this._binanceBroker.positions);
    }

    protected _subscribeOnUpdates(): Subscription {
        return this._binanceBroker.onPositionsUpdated.subscribe(orderResp => {
            this.updateItems();
        });
    }

    closePosition(position: any) {
        if (position) {
            this.raisePositionClose(position);
        }
    }

    ngOnDestroy(): void {
        super.ngOnDestroy();
    }

    protected collectionUpdated() {
        this.refresh();
    }
}
