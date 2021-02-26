import {Component} from '@angular/core';
import { MTBroker } from '@app/services/mt/mt.broker';
import { MTTradingAccount } from 'modules/Trading/models/forex/mt/mt.models';
import { BrokerService } from '@app/services/broker.service';
import { BinanceBroker } from '@app/services/binance/binance.broker';

@Component({
    selector: 'binance-funds',
    templateUrl: './binance-funds.component.html',
    styleUrls: ['./binance-funds.component.scss']
})
export class MTAccountInfoComponent {
    decimals = 8;
    
    get activeAccount(): MTTradingAccount {
        const broker = this._broker.activeBroker as BinanceBroker;
        if (!broker) {
            return null;
        }

        return broker.accountInfo;
    }

    constructor(private _broker: BrokerService) {
    }
}
