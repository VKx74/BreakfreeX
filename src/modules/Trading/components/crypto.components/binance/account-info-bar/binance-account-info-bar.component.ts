import { Component } from '@angular/core';
import { BinanceBroker } from '@app/services/binance/binance.broker';
import { BrokerService } from '@app/services/broker.service';
import { BinanceSpotTradingAccount } from 'modules/Trading/models/crypto/binance/binance.models';
import { BrokerConnectivityStatus } from 'modules/Trading/models/models';

@Component({
    selector: 'binance-account-info-bar',
    templateUrl: './binance-account-info-bar.component.html',
    styleUrls: ['./binance-account-info-bar.component.scss']
})
export class BinanceAccountInfoBarComponent {
    BrokerConnectivityStatus = BrokerConnectivityStatus;

    get activeAccount(): BinanceSpotTradingAccount {
        const broker = this._broker.activeBroker as BinanceBroker;
        if (!broker) {
            return null;
        }

        return broker.accountInfo;
    }
    
    get server(): string {
        const broker = this._broker.activeBroker as BinanceBroker;
        if (!broker) {
            return null;
        }

        return broker.server;
    }

    get status(): BrokerConnectivityStatus {
        const broker = this._broker.activeBroker;
        if (!broker) {
            return null;
        }


        return broker.status;
    }

    constructor(private _broker: BrokerService) {
    }
}
