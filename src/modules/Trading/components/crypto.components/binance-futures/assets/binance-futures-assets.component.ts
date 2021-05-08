import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BinanceFuturesAsset } from 'modules/Trading/models/crypto/binance-futures/binance-futures.models';
import { Observable, Subscription, of } from "rxjs";
import { BinanceFuturesItemsComponent } from '../binance-futures-items.component';

@Component({
    selector: 'binance-futures-assets',
    templateUrl: './binance-futures-assets.component.html',
    styleUrls: ['./binance-futures-assets.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BinanceFuturesAssetsComponent extends BinanceFuturesItemsComponent<BinanceFuturesAsset> {

    protected loadItems(): Observable<BinanceFuturesAsset[]> {
        return of(this._binanceBroker.assets);
    }

    protected _subscribeOnUpdates(): Subscription {
        return this._binanceBroker.onAssetsUpdated.subscribe(orderResp => {
            this.updateItems();
        });
    }

    ngOnDestroy(): void {
        super.ngOnDestroy();
    }

    protected collectionUpdated() {
        this.refresh();
    }
}
