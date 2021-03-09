import {Component} from '@angular/core';
import { BrokerService } from '@app/services/broker.service';
import { BinanceFuturesBroker } from '@app/services/binance-futures/binance-futures.broker';
import { BinanceFuturesTradingAccount } from 'modules/Trading/models/crypto/binance-futures/binance-futures.models';

@Component({
    selector: 'binance-futures-account-info',
    templateUrl: './binance-futures-account-info.component.html',
    styleUrls: ['./binance-futures-account-info.component.scss']
})
export class BinanceFuturesAccountInfoComponent {
    get activeAccount(): BinanceFuturesTradingAccount {
        const broker = this._broker.activeBroker as BinanceFuturesBroker;
        if (!broker) {
            return null;
        }

        return broker.accountInfo;
    }

    constructor(private _broker: BrokerService) {
    }
}
