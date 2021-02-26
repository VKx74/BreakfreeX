import { Component } from '@angular/core';
import { BinanceBroker } from '@app/services/binance/binance.broker';
import { BrokerService } from '@app/services/broker.service';
import { MTBroker } from '@app/services/mt/mt.broker';
import { BinanceTradingAccount } from 'modules/Trading/models/crypto/binance/binance.models';
import { MTTradingAccount } from 'modules/Trading/models/forex/mt/mt.models';
import { BrokerConnectivityStatus } from 'modules/Trading/models/models';

@Component({
    selector: 'binance-account-info-bar',
    templateUrl: './binance-account-info-bar.component.html',
    styleUrls: ['./binance-account-info-bar.component.scss']
})
export class BinanceAccountInfoBarComponent {
    BrokerConnectivityStatus = BrokerConnectivityStatus;

    get activeAccount(): BinanceTradingAccount {
        const mtBroker = this._broker.activeBroker as BinanceBroker;
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
