import {Component} from '@angular/core';
import { BinanceFund } from 'modules/Trading/models/crypto/binance/binance.models';
import { BinanceItemsComponent } from '../binance-items.component';
import { Observable, of, Subscription } from 'rxjs';

@Component({
    selector: 'binance-funds',
    templateUrl: './binance-funds.component.html',
    styleUrls: ['./binance-funds.component.scss']
})
export class BinanceFundsComponent extends BinanceItemsComponent<BinanceFund> {

    protected loadItems(): Observable<BinanceFund[]> {
        const broker = this._binanceBroker;
        if (!broker) {
            return null;
        }
        return of(broker.accountInfo.Funds);
    }

    trackById(index, item: BinanceFund) {
        return item.Coin;
    }
    
    totalBalance(item: BinanceFund): number {
        return item.AvailableBalance + item.FreezedBalance;
    }

    protected _subscribeOnUpdates(): Subscription {
        return this._binanceBroker.onAccountInfoUpdated.subscribe(orderResp => {
            this.updateItems();
        });
    }

    protected collectionUpdated() {
        this.refresh();
    }
}