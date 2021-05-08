import {ChangeDetectionStrategy, Component, EventEmitter, Input} from '@angular/core';
import { BinanceFuturesPosition } from 'modules/Trading/models/crypto/binance-futures/binance-futures.models';
import {Observable, Subscription, of} from "rxjs";
import { BinanceFuturesItemsComponent } from '../binance-futures-items.component';

@Component({
    selector: 'binance-futures-positions',
    templateUrl: './binance-futures-positions.component.html',
    styleUrls: ['./binance-futures-positions.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BinanceFuturesPositionsComponent extends BinanceFuturesItemsComponent<BinanceFuturesPosition> {
    protected _subscriptionOnPositionDataChanged: Subscription;

    protected loadItems(): Observable<BinanceFuturesPosition[]> {
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

        if (this._subscriptionOnPositionDataChanged) {
            this._subscriptionOnPositionDataChanged.unsubscribe();
            this._subscriptionOnPositionDataChanged = null;
        }
    }

    ngOnInit() {
        super.ngOnInit();
        this._subscriptionOnPositionDataChanged = this._binanceBroker.onPositionsParametersUpdated.subscribe(() => {
            this.collectionUpdated();
        });
    }

    protected collectionUpdated() {
        this.refresh();
    }
}
