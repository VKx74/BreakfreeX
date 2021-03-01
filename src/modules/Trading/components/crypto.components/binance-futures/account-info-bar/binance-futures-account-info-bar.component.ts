import { Component } from '@angular/core';
import { BinanceFuturesBroker } from '@app/services/binance-futures/binance-futures.broker';
import { BrokerService } from '@app/services/broker.service';
import { BinanceFuturesTradingAccount } from 'modules/Trading/models/crypto/binance-futures/binance-futures.models';
import { BrokerConnectivityStatus } from 'modules/Trading/models/models';

@Component({
    selector: 'binance-futures-account-info-bar',
    templateUrl: './binance-futures-account-info-bar.component.html',
    styleUrls: ['./binance-futures-account-info-bar.component.scss']
})
export class BinanceFuturesAccountInfoBarComponent {
    BrokerConnectivityStatus = BrokerConnectivityStatus;

    get activeAccount(): BinanceFuturesTradingAccount {
        const mtBroker = this._broker.activeBroker as BinanceFuturesBroker;
        if (!mtBroker) {
            return null;
        }

        return mtBroker.accountInfo;
    }

    get status(): BrokerConnectivityStatus {
        const mtBroker = this._broker.activeBroker;
        if (!mtBroker) {
            return null;
        }


        return mtBroker.status;
    }

    constructor(private _broker: BrokerService) {
    }
}
